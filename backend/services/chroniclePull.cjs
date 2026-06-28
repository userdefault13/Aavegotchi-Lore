const { ObjectId } = require('mongodb');
const { getStoryNodesCollection, getTomeChroniclesCollection } = require('../lib/mongodb.cjs');
const { getChronicleCommit } = require('./chronicleCommits.cjs');
const { captureChronicleSnapshot } = require('./chronicleSnapshot.cjs');
const { createChronicleCommit } = require('./chronicleCommits.cjs');
const { getChronicleSyncStatus } = require('./chronicleSync.cjs');
const { computePullPlan, nodesByKey, summarizeTomePatches } = require('./tomeDiff.cjs');
const {
  applyHunkToNode,
  buildParentKeyMap,
  nodeDocFromSnapshot,
  cloneNodeFields,
} = require('./tomePatchApply.cjs');

function conflictKey(nodeKey, path) {
  return `${nodeKey}::${path}`;
}

async function loadPullSnapshots(branchChronicle) {
  if (!branchChronicle.upstreamChronicleId) throw new Error('Not a branch chronicle');
  if (!branchChronicle.baseCommitId) throw new Error('Branch has no base commit');

  const chronicles = await getTomeChroniclesCollection();
  const upstream = await chronicles.findOne({ _id: new ObjectId(branchChronicle.upstreamChronicleId) });
  if (!upstream) throw new Error('Upstream chronicle not found');

  const [baseSnapshot, upstreamSnapshot, branchSnapshot] = await Promise.all([
    getChronicleCommit(branchChronicle.baseCommitId).then((c) => c?.snapshot),
    upstream.headCommitId
      ? getChronicleCommit(upstream.headCommitId).then((c) => c?.snapshot)
      : captureChronicleSnapshot(upstream._id.toString()),
    captureChronicleSnapshot(branchChronicle._id.toString()),
  ]);

  if (!baseSnapshot || !upstreamSnapshot || !branchSnapshot) {
    throw new Error('Could not load snapshots for pull');
  }

  return { upstream, baseSnapshot, upstreamSnapshot, branchSnapshot, upstreamHeadCommitId: upstream.headCommitId || null };
}

async function previewPull(chronicleId) {
  const chronicles = await getTomeChroniclesCollection();
  const branch = await chronicles.findOne({ _id: new ObjectId(chronicleId) });
  if (!branch) throw new Error('Chronicle not found');

  const sync = await getChronicleSyncStatus(branch);
  const ctx = await loadPullSnapshots(branch);
  const plan = computePullPlan({
    baseSnapshot: ctx.baseSnapshot,
    upstreamSnapshot: ctx.upstreamSnapshot,
    branchSnapshot: ctx.branchSnapshot,
  });

  return {
    ...sync,
    upstreamHeadCommitId: ctx.upstreamHeadCommitId,
    baseCommitId: branch.baseCommitId,
    autoApply: plan.autoApply,
    conflicts: plan.conflicts,
    canPull: sync.commitsBehind > 0,
    stats: {
      ...summarizeTomePatches(plan.autoApply),
      conflictCount: plan.conflicts.length,
    },
  };
}

async function executePull(chronicleId, { actorWallet, resolutions = [], message }) {
  const chronicles = await getTomeChroniclesCollection();
  const branch = await chronicles.findOne({ _id: new ObjectId(chronicleId) });
  if (!branch) throw new Error('Chronicle not found');
  if (branch.ownerWallet !== actorWallet) throw new Error('Only the branch owner can pull');

  const preview = await previewPull(chronicleId);
  if (!preview.canPull && preview.commitsBehind === 0) {
    throw new Error('Already up to date with upstream canon');
  }

  const resolutionMap = new Map();
  for (const r of resolutions) {
    if (!r?.nodeKey || !r?.path || !r?.choice) continue;
    resolutionMap.set(conflictKey(r.nodeKey, r.path), r);
  }

  for (const conflict of preview.conflicts) {
    const key = conflictKey(conflict.nodeKey, conflict.path);
    if (!resolutionMap.has(key)) {
      throw new Error(`Unresolved conflict: ${conflict.nodeKey} · ${conflict.path}`);
    }
  }

  const ctx = await loadPullSnapshots(branch);
  const nodesColl = await getStoryNodesCollection();
  const branchNodes = await nodesColl.find({ chronicleId: chronicleId.toString() }).toArray();
  const branchByKey = new Map(branchNodes.filter((n) => n.nodeKey).map((n) => [n.nodeKey, n]));
  const sourceNodes = nodesByKey(ctx.upstreamSnapshot);
  const parentKeyMap = buildParentKeyMap(ctx.upstreamSnapshot);
  const now = new Date();

  function resolveParentId(nodeKey) {
    const parentKey = parentKeyMap.get(nodeKey);
    if (!parentKey) return null;
    return branchByKey.get(parentKey)?._id?.toString() || null;
  }

  for (const patch of preview.autoApply) {
    if (patch.action === 'add') {
      const sourceNode = sourceNodes.get(patch.nodeKey);
      if (!sourceNode || branchByKey.has(patch.nodeKey)) continue;
      const parentId = resolveParentId(patch.nodeKey);
      const doc = nodeDocFromSnapshot(sourceNode, chronicleId.toString(), branch.ownerWallet, parentId, now);
      const result = await nodesColl.insertOne(doc);
      branchByKey.set(patch.nodeKey, { ...doc, _id: result.insertedId });
      continue;
    }
    if (patch.action === 'delete') {
      const existing = branchByKey.get(patch.nodeKey);
      if (existing) {
        await nodesColl.deleteOne({ _id: existing._id });
        branchByKey.delete(patch.nodeKey);
      }
      continue;
    }
    const existing = branchByKey.get(patch.nodeKey);
    if (!existing) continue;
    const sourceNode = sourceNodes.get(patch.nodeKey);
    const next = cloneNodeFields(existing);
    for (const hunk of patch.hunks || []) applyHunkToNode(next, hunk, sourceNode);
    await nodesColl.updateOne(
      { _id: existing._id },
      {
        $set: {
          title: next.title,
          type: next.type,
          content: next.content,
          frame: next.frame,
          choices: next.choices,
          roles: next.roles,
          crossLinks: next.crossLinks,
          situational: next.situational,
          order: next.order,
          branchIndex: next.branchIndex,
          updatedAt: now,
        },
      },
    );
  }

  for (const conflict of preview.conflicts) {
    const choice = resolutionMap.get(conflictKey(conflict.nodeKey, conflict.path))?.choice;
    let existing = branchByKey.get(conflict.nodeKey);
    if (conflict.action === 'add' && choice === 'theirs' && !existing) {
      const sourceNode = sourceNodes.get(conflict.nodeKey);
      if (sourceNode) {
        const parentId = resolveParentId(conflict.nodeKey);
        const doc = nodeDocFromSnapshot(sourceNode, chronicleId.toString(), branch.ownerWallet, parentId, now);
        const result = await nodesColl.insertOne(doc);
        branchByKey.set(conflict.nodeKey, { ...doc, _id: result.insertedId });
      }
      continue;
    }
    if (!existing) continue;
    if (choice === 'mine') continue;
    const sourceNode = sourceNodes.get(conflict.nodeKey);
    const next = cloneNodeFields(existing);
    if (choice === 'theirs') {
      if (conflict.path === '_node') {
        if (conflict.action === 'delete') {
          await nodesColl.deleteOne({ _id: existing._id });
          branchByKey.delete(conflict.nodeKey);
        }
        continue;
      }
      applyHunkToNode(next, { path: conflict.path, after: conflict.theirs, action: conflict.action }, sourceNode);
    }
    await nodesColl.updateOne(
      { _id: existing._id },
      {
        $set: {
          title: next.title,
          type: next.type,
          content: next.content,
          frame: next.frame,
          choices: next.choices,
          roles: next.roles,
          crossLinks: next.crossLinks,
          situational: next.situational,
          order: next.order,
          branchIndex: next.branchIndex,
          updatedAt: now,
        },
      },
    );
  }

  await chronicles.updateOne(
    { _id: branch._id },
    { $set: { baseCommitId: ctx.upstreamHeadCommitId || branch.baseCommitId, updatedAt: now } },
  );

  const commit = await createChronicleCommit({
    chronicleId: chronicleId.toString(),
    parentCommitId: branch.headCommitId || null,
    message: message || 'Pull from upstream canon',
    authorWallet: actorWallet,
    kind: 'pull',
  });

  return { commitId: commit.id, autoApplied: preview.autoApply.length, conflictsResolved: preview.conflicts.length };
}

module.exports = { previewPull, executePull, conflictKey };
