const { ObjectId } = require('mongodb');
const { getStoryNodesCollection, getTomeChroniclesCollection } = require('../lib/mongodb.cjs');
const { getChronicleCommit } = require('./chronicleCommits.cjs');
const { captureChronicleSnapshot } = require('./chronicleSnapshot.cjs');
const { createChronicleCommit } = require('./chronicleCommits.cjs');
const { computeProposalPatches, summarizeTomePatches, nodesByKey } = require('./tomeDiff.cjs');
const {
  applyHunkToNode,
  buildParentKeyMap,
  nodeDocFromSnapshot,
  cloneNodeFields,
} = require('./tomePatchApply.cjs');

async function applyTomePatches({
  upstreamChronicleId,
  patches,
  baseCommitId,
  sourceCommitId,
  force = false,
  mergedBy,
  proposalId,
  proposalTitle,
}) {
  const [baseSnapshot, sourceSnapshot] = await Promise.all([
    baseCommitId ? getChronicleCommit(baseCommitId).then((c) => c?.snapshot) : null,
    sourceCommitId ? getChronicleCommit(sourceCommitId).then((c) => c?.snapshot) : null,
  ]);

  if (!baseSnapshot || !sourceSnapshot) {
    throw new Error('Missing base or source chronicle snapshot for merge');
  }

  const upstreamSnapshot = await captureChronicleSnapshot(upstreamChronicleId);
  const freshPatches = computeProposalPatches({
    baseSnapshot,
    sourceSnapshot,
    upstreamSnapshot,
  });
  const stats = summarizeTomePatches(freshPatches);
  if (stats.conflictCount > 0 && !force) {
    throw new Error(`${stats.conflictCount} field conflict(s) — rebase branch or force merge`);
  }

  const chronicles = await getTomeChroniclesCollection();
  const upstream = await chronicles.findOne({ _id: new ObjectId(upstreamChronicleId) });
  if (!upstream) throw new Error('Upstream chronicle not found');

  const nodesColl = await getStoryNodesCollection();
  const upstreamNodes = await nodesColl.find({ chronicleId: upstreamChronicleId.toString() }).toArray();
  const upstreamByKey = new Map(upstreamNodes.filter((n) => n.nodeKey).map((n) => [n.nodeKey, n]));
  const sourceNodes = nodesByKey(sourceSnapshot);
  const parentKeyMap = buildParentKeyMap(sourceSnapshot);
  const now = new Date();
  const ownerWallet = upstream.ownerWallet;

  function resolveParentId(nodeKey) {
    const parentKey = parentKeyMap.get(nodeKey);
    if (!parentKey) return null;
    return upstreamByKey.get(parentKey)?._id?.toString() || null;
  }

  for (const patch of freshPatches) {
    if (patch.action === 'add') {
      const sourceNode = sourceNodes.get(patch.nodeKey);
      if (!sourceNode || upstreamByKey.has(patch.nodeKey)) continue;
      const parentId = resolveParentId(patch.nodeKey);
      const doc = nodeDocFromSnapshot(sourceNode, upstreamChronicleId.toString(), ownerWallet, parentId, now);
      const result = await nodesColl.insertOne(doc);
      upstreamByKey.set(patch.nodeKey, { ...doc, _id: result.insertedId });
      continue;
    }
    if (patch.action === 'delete') {
      const existing = upstreamByKey.get(patch.nodeKey);
      if (existing) {
        await nodesColl.deleteOne({ _id: existing._id });
        upstreamByKey.delete(patch.nodeKey);
      }
      continue;
    }
    const existing = upstreamByKey.get(patch.nodeKey);
    if (!existing) continue;
    const sourceNode = sourceNodes.get(patch.nodeKey);
    for (const hunk of patch.hunks || []) {
      if (hunk.conflict && !force) throw new Error(`Conflict at ${patch.nodeKey} · ${hunk.path}`);
    }
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

  const mergeMessage = proposalId
    ? `Merged PR #${proposalId.slice(-6)}: ${proposalTitle || 'Tome proposal'}`
    : 'Merged tome proposal';

  const commit = await createChronicleCommit({
    chronicleId: upstreamChronicleId,
    parentCommitId: upstream.headCommitId || null,
    message: mergeMessage,
    authorWallet: mergedBy,
    kind: 'merge',
  });

  return { commitId: commit.id, stats, patchesApplied: freshPatches.length };
}

module.exports = { applyTomePatches };
