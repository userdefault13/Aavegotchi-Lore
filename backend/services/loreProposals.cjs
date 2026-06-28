const { ObjectId } = require('mongodb');
const {
  getLoreProposalsCollection,
  getLoreWorldsCollection,
  getTomeChroniclesCollection,
} = require('../lib/mongodb.cjs');
const { getWorldCommit } = require('./worldCommits.cjs');
const { getChronicleCommit } = require('./chronicleCommits.cjs');
const { captureWorldSnapshot } = require('./worldSnapshot.cjs');
const { captureChronicleSnapshot } = require('./chronicleSnapshot.cjs');
const { computeProposalPatches, summarizePatches } = require('./loreDiff.cjs');
const { computeProposalPatches: computeTomePatches, summarizeTomePatches } = require('./tomeDiff.cjs');
const { applyPatches } = require('./loreMerge.cjs');
const { applyTomePatches } = require('./tomeMerge.cjs');
const { findPairedBranchChronicle } = require('./chronicleSync.cjs');
const {
  fetchSnapshotProposal,
  evaluateProposalOutcome,
  buildSnapshotPayload,
  assertSnapshotSpaceMatch,
  SNAPSHOT_RELAXED,
} = require('./snapshotHub.cjs');
const { recordGovernanceEvent } = require('./loreGovernanceEvents.cjs');

function toProposal(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    upstreamWorldId: doc.upstreamWorldId,
    sourceWorldId: doc.sourceWorldId,
    sourceCommitId: doc.sourceCommitId || null,
    baseCommitId: doc.baseCommitId || null,
    upstreamHeadCommitId: doc.upstreamHeadCommitId || null,
    title: doc.title,
    body: doc.body || '',
    authorWallet: doc.authorWallet,
    status: doc.status,
    patches: doc.patches || [],
    tomePatches: doc.tomePatches || [],
    upstreamChronicleId: doc.upstreamChronicleId || null,
    sourceChronicleId: doc.sourceChronicleId || null,
    sourceChronicleCommitId: doc.sourceChronicleCommitId || null,
    stats: doc.stats || {},
    nominatedBy: doc.nominatedBy || null,
    nominatedAt: doc.nominatedAt?.toISOString?.() || null,
    snapshotProposalId: doc.snapshotProposalId || null,
    voteEndsAt: doc.voteEndsAt?.toISOString?.() || null,
    mergedAt: doc.mergedAt?.toISOString?.() || null,
    mergedBy: doc.mergedBy || null,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
    closedAt: doc.closedAt?.toISOString?.() || null,
  };
}

async function snapshotFromCommit(commitId) {
  if (!commitId) return null;
  const commit = await getWorldCommit(commitId);
  return commit?.snapshot || null;
}

async function snapshotFromChronicleCommit(commitId) {
  if (!commitId) return null;
  const commit = await getChronicleCommit(commitId);
  return commit?.snapshot || null;
}

async function buildTomeProposalDiff(sourceChronicle) {
  if (!sourceChronicle?.upstreamChronicleId) {
    return {
      upstreamChronicleId: null,
      sourceChronicleId: null,
      sourceChronicleCommitId: null,
      tomePatches: [],
      tomeStats: { nodesChanged: 0, hunksCount: 0, conflictCount: 0 },
    };
  }

  const chronicles = await getTomeChroniclesCollection();
  const upstream = await chronicles.findOne({ _id: new ObjectId(sourceChronicle.upstreamChronicleId) });
  if (!upstream) throw new Error('Upstream chronicle not found');

  const baseCommitId = sourceChronicle.baseCommitId;
  if (!baseCommitId) throw new Error('Branch chronicle has no base commit');

  const [baseSnapshot, sourceSnapshot, upstreamSnapshot] = await Promise.all([
    snapshotFromChronicleCommit(baseCommitId),
    sourceChronicle.headCommitId
      ? snapshotFromChronicleCommit(sourceChronicle.headCommitId)
      : captureChronicleSnapshot(sourceChronicle._id.toString()),
    upstream.headCommitId
      ? snapshotFromChronicleCommit(upstream.headCommitId)
      : captureChronicleSnapshot(upstream._id.toString()),
  ]);

  if (!baseSnapshot || !sourceSnapshot) {
    throw new Error('Could not load chronicle snapshots for diff');
  }

  const tomePatches = computeTomePatches({
    baseSnapshot,
    sourceSnapshot,
    upstreamSnapshot: upstreamSnapshot || baseSnapshot,
  });

  return {
    upstreamChronicleId: upstream._id.toString(),
    upstreamChronicleTitle: upstream.title,
    sourceChronicleId: sourceChronicle._id.toString(),
    sourceChronicleCommitId: sourceChronicle.headCommitId || null,
    tomePatches,
    tomeStats: summarizeTomePatches(tomePatches),
  };
}

async function buildProposalDiff(sourceWorld) {
  if (!sourceWorld.upstreamWorldId) {
    throw new Error('Only fork worlds can open pull requests');
  }

  const worlds = await getLoreWorldsCollection();
  const upstream = await worlds.findOne({ _id: new ObjectId(sourceWorld.upstreamWorldId) });
  if (!upstream) throw new Error('Upstream world not found');

  const baseCommitId = sourceWorld.baseCommitId;
  if (!baseCommitId) throw new Error('Fork has no base commit');

  const [baseSnapshot, sourceSnapshot, upstreamSnapshot] = await Promise.all([
    snapshotFromCommit(baseCommitId),
    sourceWorld.headCommitId
      ? snapshotFromCommit(sourceWorld.headCommitId)
      : captureWorldSnapshot(sourceWorld._id.toString()),
    upstream.headCommitId
      ? snapshotFromCommit(upstream.headCommitId)
      : captureWorldSnapshot(upstream._id.toString()),
  ]);

  if (!baseSnapshot || !sourceSnapshot) {
    throw new Error('Could not load snapshots for diff');
  }

  const patches = computeProposalPatches({
    baseSnapshot,
    sourceSnapshot,
    upstreamSnapshot: upstreamSnapshot || baseSnapshot,
  });

  const loreStats = summarizePatches(patches);
  const sourceChronicle = await findPairedBranchChronicle(sourceWorld._id.toString());
  const tomeDiff = sourceChronicle
    ? await buildTomeProposalDiff(sourceChronicle)
    : {
        upstreamChronicleId: null,
        sourceChronicleId: null,
        sourceChronicleCommitId: null,
        tomePatches: [],
        tomeStats: { nodesChanged: 0, hunksCount: 0, conflictCount: 0 },
      };

  return {
    upstreamWorldId: upstream._id.toString(),
    upstreamTitle: upstream.title,
    sourceWorldId: sourceWorld._id.toString(),
    sourceCommitId: sourceWorld.headCommitId || null,
    baseCommitId,
    upstreamHeadCommitId: upstream.headCommitId || null,
    patches,
    tomePatches: tomeDiff.tomePatches,
    upstreamChronicleId: tomeDiff.upstreamChronicleId,
    upstreamChronicleTitle: tomeDiff.upstreamChronicleTitle || null,
    sourceChronicleId: tomeDiff.sourceChronicleId,
    sourceChronicleCommitId: tomeDiff.sourceChronicleCommitId,
    stats: {
      pagesChanged: loreStats.pagesChanged,
      nodesChanged: tomeDiff.tomeStats.nodesChanged,
      hunksCount: loreStats.hunksCount + tomeDiff.tomeStats.hunksCount,
      conflictCount: loreStats.conflictCount + tomeDiff.tomeStats.conflictCount,
      loreHunksCount: loreStats.hunksCount,
      tomeHunksCount: tomeDiff.tomeStats.hunksCount,
    },
  };
}

async function previewProposal(sourceWorldId) {
  const worlds = await getLoreWorldsCollection();
  const source = await worlds.findOne({ _id: new ObjectId(sourceWorldId) });
  if (!source) throw new Error('Source world not found');
  return buildProposalDiff(source);
}

async function createProposal({ sourceWorldId, title, body, authorWallet }) {
  const worlds = await getLoreWorldsCollection();
  const coll = await getLoreProposalsCollection();
  const source = await worlds.findOne({ _id: new ObjectId(sourceWorldId) });
  if (!source) throw new Error('Source world not found');
  if (source.ownerWallet !== authorWallet) {
    throw new Error('Only the fork owner can open a pull request');
  }

  const diff = await buildProposalDiff(source);
  if (!diff.patches.length && !diff.tomePatches.length) {
    throw new Error('No changes to propose vs upstream canon');
  }

  const existing = await coll.findOne({
    sourceWorldId: sourceWorldId.toString(),
    status: { $in: ['open', 'changes_requested', 'nominated', 'voting'] },
  });
  if (existing) {
    throw new Error('An open pull request already exists for this fork');
  }

  const now = new Date();
  const doc = {
    upstreamWorldId: diff.upstreamWorldId,
    sourceWorldId: diff.sourceWorldId,
    sourceCommitId: diff.sourceCommitId,
    baseCommitId: diff.baseCommitId,
    upstreamHeadCommitId: diff.upstreamHeadCommitId,
    upstreamChronicleId: diff.upstreamChronicleId,
    sourceChronicleId: diff.sourceChronicleId,
    sourceChronicleCommitId: diff.sourceChronicleCommitId,
    title: title.trim(),
    body: (body || '').trim(),
    authorWallet,
    status: 'open',
    patches: diff.patches,
    tomePatches: diff.tomePatches,
    stats: diff.stats,
    nominatedBy: null,
    nominatedAt: null,
    snapshotProposalId: null,
    createdAt: now,
    updatedAt: now,
    closedAt: null,
    mergedAt: null,
  };

  const result = await coll.insertOne(doc);
  const proposal = await coll.findOne({ _id: result.insertedId });

  await recordGovernanceEvent({
    proposalId: proposal._id.toString(),
    type: 'created',
    actorWallet: authorWallet,
    message: title.trim(),
  });

  return toProposal(proposal);
}

async function listProposals(filter = {}) {
  const coll = await getLoreProposalsCollection();
  const query = {};
  if (filter.upstreamWorldId) query.upstreamWorldId = filter.upstreamWorldId;
  if (filter.sourceWorldId) query.sourceWorldId = filter.sourceWorldId;
  if (filter.authorWallet) query.authorWallet = filter.authorWallet;
  if (filter.status) query.status = filter.status;
  if (filter.statusIn?.length) query.status = { $in: filter.statusIn };

  const items = await coll.find(query).sort({ updatedAt: -1 }).limit(filter.limit || 50).toArray();
  return items.map(toProposal);
}

async function getProposal(id) {
  if (!ObjectId.isValid(id)) return null;
  const coll = await getLoreProposalsCollection();
  return toProposal(await coll.findOne({ _id: new ObjectId(id) }));
}

function resolveMaintainer(doc, upstream, { actorWallet, isMaintainer }) {
  return (
    isMaintainer ||
    upstream?.ownerWallet === actorWallet ||
    upstream?.maintainers?.includes(actorWallet)
  );
}

async function updateProposalStatus(id, status, { actorWallet, isMaintainer }) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid proposal id');
  const coll = await getLoreProposalsCollection();
  const doc = await coll.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error('Proposal not found');

  const worlds = await getLoreWorldsCollection();
  const upstream = await worlds.findOne({ _id: new ObjectId(doc.upstreamWorldId) });
  const isAuthor = doc.authorWallet === actorWallet;
  const maintainer = resolveMaintainer(doc, upstream, { actorWallet, isMaintainer });

  if (doc.status === 'closed' || doc.status === 'rejected' || doc.status === 'merged') {
    throw new Error('Proposal is already closed');
  }

  if (status === 'merged') {
    throw new Error('Use POST /lore-proposals/:id/merge to merge');
  }

  if (doc.status === 'voting' && !['rejected', 'closed'].includes(status)) {
    throw new Error('Cannot change status while vote is active');
  }

  const allowed = {
    rejected: maintainer && ['open', 'nominated', 'changes_requested'].includes(doc.status),
    changes_requested: maintainer && ['open', 'nominated'].includes(doc.status),
    nominated: maintainer && doc.status === 'open',
    open:
      (maintainer && doc.status === 'nominated') ||
      (isAuthor && doc.status === 'changes_requested'),
    closed:
      (isAuthor || maintainer) &&
      ['open', 'changes_requested', 'nominated'].includes(doc.status),
  };

  if (!allowed[status]) throw new Error('Invalid status transition');

  const now = new Date();
  const patch = { status, updatedAt: now };

  if (status === 'closed' || status === 'rejected') patch.closedAt = now;
  if (status === 'nominated') {
    patch.nominatedBy = actorWallet;
    patch.nominatedAt = now;
  }
  if (status === 'open' && doc.status === 'nominated') {
    patch.nominatedBy = null;
    patch.nominatedAt = null;
  }

  await coll.updateOne({ _id: doc._id }, { $set: patch });

  const eventType =
    status === 'nominated'
      ? 'nominated'
      : status === 'open' && doc.status === 'nominated'
        ? 'unnominated'
        : status === 'open' && doc.status === 'changes_requested'
          ? 'reopened'
          : status;

  await recordGovernanceEvent({
    proposalId: id,
    type: eventType,
    actorWallet,
    message: doc.title,
    meta: { from: doc.status, to: status },
  });

  return toProposal(await coll.findOne({ _id: doc._id }));
}

async function refreshProposal(id, authorWallet) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid proposal id');
  const coll = await getLoreProposalsCollection();
  const doc = await coll.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error('Proposal not found');
  if (doc.authorWallet !== authorWallet) throw new Error('Only the author can refresh a proposal');
  if (!['open', 'changes_requested'].includes(doc.status)) {
    throw new Error('Proposal cannot be refreshed in its current status');
  }

  const worlds = await getLoreWorldsCollection();
  const source = await worlds.findOne({ _id: new ObjectId(doc.sourceWorldId) });
  if (!source) throw new Error('Source fork not found');

  const diff = await buildProposalDiff(source);
  if (!diff.patches.length && !diff.tomePatches.length) {
    throw new Error('No changes to propose — edit your branch and commit first');
  }

  const now = new Date();
  const wasChangesRequested = doc.status === 'changes_requested';
  const patch = {
    patches: diff.patches,
    tomePatches: diff.tomePatches,
    stats: diff.stats,
    sourceCommitId: diff.sourceCommitId,
    sourceChronicleCommitId: diff.sourceChronicleCommitId,
    upstreamHeadCommitId: diff.upstreamHeadCommitId,
    upstreamChronicleId: diff.upstreamChronicleId,
    sourceChronicleId: diff.sourceChronicleId,
    updatedAt: now,
    ...(wasChangesRequested ? { status: 'open' } : {}),
  };

  await coll.updateOne({ _id: doc._id }, { $set: patch });

  await recordGovernanceEvent({
    proposalId: id,
    type: 'refreshed',
    actorWallet: authorWallet,
    message: `${diff.stats?.hunksCount || 0} field changes`,
    meta: { pagesChanged: diff.stats?.pagesChanged, conflictCount: diff.stats?.conflictCount },
  });

  if (wasChangesRequested) {
    await recordGovernanceEvent({
      proposalId: id,
      type: 'reopened',
      actorWallet: authorWallet,
      message: 'Updated after review',
    });
  }

  return toProposal(await coll.findOne({ _id: doc._id }));
}

async function getProposalGovernance(id) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid proposal id');
  const coll = await getLoreProposalsCollection();
  const doc = await coll.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error('Proposal not found');

  if (!doc.snapshotProposalId) {
    return {
      snapshotProposalId: null,
      snapshot: evaluateProposalOutcome(null),
      payload: buildSnapshotPayload(toProposal(doc), id),
      canMerge: SNAPSHOT_RELAXED && doc.status === 'nominated',
      relaxedMode: SNAPSHOT_RELAXED,
    };
  }

  const snapshotProposal = await fetchSnapshotProposal(doc.snapshotProposalId);
  if (snapshotProposal) assertSnapshotSpaceMatch(snapshotProposal);
  const snapshot = evaluateProposalOutcome(snapshotProposal);

  if (doc.status === 'voting' && snapshot.voteEndsAt && !doc.voteEndsAt) {
    await coll.updateOne({ _id: doc._id }, { $set: { voteEndsAt: new Date(snapshot.voteEndsAt) } });
  }

  return {
    snapshotProposalId: doc.snapshotProposalId,
    snapshot,
    payload: buildSnapshotPayload(toProposal(doc), id),
    canMerge:
      (doc.status === 'nominated' && SNAPSHOT_RELAXED) ||
      (doc.status === 'voting' && snapshot.readyToMerge),
    relaxedMode: SNAPSHOT_RELAXED,
  };
}

async function linkSnapshotProposal(id, snapshotProposalId, { actorWallet, isMaintainer }) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid proposal id');
  const proposalId = snapshotProposalId?.trim();
  if (!proposalId) throw new Error('snapshotProposalId required');

  const coll = await getLoreProposalsCollection();
  const doc = await coll.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error('Proposal not found');

  const worlds = await getLoreWorldsCollection();
  const upstream = await worlds.findOne({ _id: new ObjectId(doc.upstreamWorldId) });
  const maintainer = resolveMaintainer(doc, upstream, { actorWallet, isMaintainer });
  if (!maintainer) throw new Error('Forbidden');

  if (!['nominated', 'voting'].includes(doc.status)) {
    throw new Error('Only nominated proposals can link a Snapshot vote');
  }

  const snapshotProposal = await fetchSnapshotProposal(proposalId);
  if (!snapshotProposal) throw new Error('Snapshot proposal not found on hub');
  assertSnapshotSpaceMatch(snapshotProposal);

  const outcome = evaluateProposalOutcome(snapshotProposal);
  const now = new Date();

  await coll.updateOne(
    { _id: doc._id },
    {
      $set: {
        snapshotProposalId: proposalId,
        status: 'voting',
        voteEndsAt: outcome.voteEndsAt ? new Date(outcome.voteEndsAt) : null,
        updatedAt: now,
      },
    },
  );

  await recordGovernanceEvent({
    proposalId: id,
    type: 'snapshot_linked',
    actorWallet,
    message: snapshotProposal.title || proposalId,
    meta: { snapshotProposalId: proposalId, snapshotState: outcome.state },
  });

  return toProposal(await coll.findOne({ _id: doc._id }));
}

async function executeProposalMerge(id, { actorWallet, isMaintainer, force = false }) {
  if (!ObjectId.isValid(id)) throw new Error('Invalid proposal id');
  const coll = await getLoreProposalsCollection();
  const doc = await coll.findOne({ _id: new ObjectId(id) });
  if (!doc) throw new Error('Proposal not found');

  const worlds = await getLoreWorldsCollection();
  const upstream = await worlds.findOne({ _id: new ObjectId(doc.upstreamWorldId) });
  const maintainer = resolveMaintainer(doc, upstream, { actorWallet, isMaintainer });
  if (!maintainer) throw new Error('Forbidden');

  if (doc.status === 'merged') throw new Error('Proposal already merged');
  if (!['nominated', 'voting'].includes(doc.status)) {
    throw new Error('Only nominated or voting proposals can be merged');
  }

  let snapshotPassed = false;
  if (doc.snapshotProposalId) {
    const snapshotProposal = await fetchSnapshotProposal(doc.snapshotProposalId);
    const outcome = evaluateProposalOutcome(snapshotProposal);
    snapshotPassed = outcome.readyToMerge;
    if (!snapshotPassed && !force && !SNAPSHOT_RELAXED) {
      throw new Error(outcome.message || 'Snapshot vote has not passed');
    }
  } else if (!SNAPSHOT_RELAXED && !force) {
    throw new Error('Link a Snapshot proposal before merging');
  }

  let mergeResult = { commitId: null, patchesApplied: 0, stats: {} };
  if (doc.patches?.length) {
    mergeResult = await applyPatches({
      upstreamWorldId: doc.upstreamWorldId,
      patches: doc.patches,
      baseCommitId: doc.baseCommitId,
      sourceCommitId: doc.sourceCommitId,
      force,
      mergedBy: actorWallet,
      proposalId: id,
      proposalTitle: doc.title,
    });
  } else {
    const upstream = await worlds.findOne({ _id: new ObjectId(doc.upstreamWorldId) });
    mergeResult.commitId = upstream?.headCommitId || null;
  }

  let tomeMergeResult = null;
  if (doc.upstreamChronicleId && doc.sourceChronicleId && doc.tomePatches?.length) {
    tomeMergeResult = await applyTomePatches({
      upstreamChronicleId: doc.upstreamChronicleId,
      patches: doc.tomePatches || [],
      baseCommitId: doc.baseCommitId,
      sourceCommitId: doc.sourceChronicleCommitId,
      force,
      mergedBy: actorWallet,
      proposalId: id,
      proposalTitle: doc.title,
    });
  }

  const now = new Date();
  await coll.updateOne(
    { _id: doc._id },
    {
      $set: {
        status: 'merged',
        mergedAt: now,
        mergedBy: actorWallet,
        updatedAt: now,
        closedAt: now,
      },
    },
  );

  await worlds.updateOne(
    { _id: new ObjectId(doc.sourceWorldId) },
    { $set: { baseCommitId: mergeResult.commitId || doc.baseCommitId, updatedAt: now } },
  );

  if (doc.sourceChronicleId && tomeMergeResult?.commitId) {
    await (await getTomeChroniclesCollection()).updateOne(
      { _id: new ObjectId(doc.sourceChronicleId) },
      { $set: { baseCommitId: tomeMergeResult.commitId, updatedAt: now } },
    );
  }

  await recordGovernanceEvent({
    proposalId: id,
    type: 'merged',
    actorWallet,
    message: doc.title,
    meta: {
      commitId: mergeResult.commitId,
      tomeCommitId: tomeMergeResult?.commitId || null,
      patchesApplied: mergeResult.patchesApplied,
      tomePatchesApplied: tomeMergeResult?.patchesApplied || 0,
      force,
      snapshotPassed,
    },
  });

  return {
    proposal: toProposal(await coll.findOne({ _id: doc._id })),
    merge: mergeResult,
    tomeMerge: tomeMergeResult,
  };
}

module.exports = {
  toProposal,
  previewProposal,
  createProposal,
  listProposals,
  getProposal,
  updateProposalStatus,
  refreshProposal,
  buildProposalDiff,
  getProposalGovernance,
  linkSnapshotProposal,
  executeProposalMerge,
};
