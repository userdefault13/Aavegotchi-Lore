const { ObjectId } = require('mongodb');
const {
  getLorePagesCollection,
  getLoreWorldsCollection,
} = require('../../lib/mongodb.cjs');
const { getWorldCommit } = require('./worldCommits.cjs');
const { captureWorldSnapshot } = require('./worldSnapshot.cjs');
const { createWorldCommit } = require('./worldCommits.cjs');
const { computeProposalPatches, summarizePatches, pagesByKey } = require('./loreDiff.cjs');
const {
  applyHunkToPage,
  buildParentKeyMap,
  pageDocFromSnapshot,
  clonePageFields,
} = require('./lorePatchApply.cjs');

async function applyPatches({
  upstreamWorldId,
  patches,
  baseCommitId,
  sourceCommitId,
  force = false,
  mergedBy,
  proposalId,
  proposalTitle,
}) {
  if (!patches?.length) throw new Error('No patches to apply');

  const [baseSnapshot, sourceSnapshot] = await Promise.all([
    baseCommitId ? getWorldCommit(baseCommitId).then((c) => c?.snapshot) : null,
    sourceCommitId ? getWorldCommit(sourceCommitId).then((c) => c?.snapshot) : null,
  ]);

  if (!baseSnapshot || !sourceSnapshot) {
    throw new Error('Missing base or source snapshot for merge');
  }

  const upstreamSnapshot = await captureWorldSnapshot(upstreamWorldId);
  const freshPatches = computeProposalPatches({
    baseSnapshot,
    sourceSnapshot,
    upstreamSnapshot,
  });
  const stats = summarizePatches(freshPatches);
  if (stats.conflictCount > 0 && !force) {
    throw new Error(`${stats.conflictCount} field conflict(s) — rebase fork or force merge`);
  }

  const worlds = await getLoreWorldsCollection();
  const upstream = await worlds.findOne({ _id: new ObjectId(upstreamWorldId) });
  if (!upstream) throw new Error('Upstream world not found');

  const pagesColl = await getLorePagesCollection();
  const upstreamPages = await pagesColl.find({ worldId: upstreamWorldId.toString() }).toArray();
  const upstreamByKey = new Map(upstreamPages.filter((p) => p.pageKey).map((p) => [p.pageKey, p]));

  const sourcePages = pagesByKey(sourceSnapshot);
  const parentKeyMap = buildParentKeyMap(sourceSnapshot);
  const now = new Date();
  const ownerWallet = upstream.ownerWallet;

  function resolveParentId(pageKey) {
    const parentKey = parentKeyMap.get(pageKey);
    if (!parentKey) return null;
    return upstreamByKey.get(parentKey)?._id?.toString() || null;
  }

  for (const patch of freshPatches) {
    if (patch.action === 'add') {
      const sourcePage = sourcePages.get(patch.pageKey);
      if (!sourcePage) continue;
      if (upstreamByKey.has(patch.pageKey)) {
        throw new Error(`Page already exists: ${patch.pageKey}`);
      }
      const parentId = resolveParentId(patch.pageKey);
      const doc = pageDocFromSnapshot(sourcePage, upstreamWorldId.toString(), ownerWallet, parentId, now);
      const result = await pagesColl.insertOne(doc);
      upstreamByKey.set(patch.pageKey, { ...doc, _id: result.insertedId });
      continue;
    }

    if (patch.action === 'delete') {
      const existing = upstreamByKey.get(patch.pageKey);
      if (existing) {
        await pagesColl.deleteOne({ _id: existing._id });
        upstreamByKey.delete(patch.pageKey);
      }
      continue;
    }

    const existing = upstreamByKey.get(patch.pageKey);
    if (!existing) continue;
    const sourcePage = sourcePages.get(patch.pageKey);

    for (const hunk of patch.hunks || []) {
      if (hunk.conflict && !force) {
        throw new Error(`Conflict at ${patch.pageKey} · ${hunk.path}`);
      }
    }

    const next = clonePageFields(existing);

    for (const hunk of patch.hunks || []) {
      applyHunkToPage(next, hunk, sourcePage);
    }

    await pagesColl.updateOne(
      { _id: existing._id },
      {
        $set: {
          title: next.title,
          templateId: next.templateId,
          frame: next.frame,
          tags: next.tags,
          runes: next.runes,
          blocks: next.blocks,
          layout: next.layout,
          updatedAt: now,
        },
      },
    );
  }

  const mergeMessage = proposalId
    ? `Merged PR #${proposalId.slice(-6)}: ${proposalTitle || 'Lore proposal'}`
    : `Merged lore proposal`;

  const commit = await createWorldCommit({
    worldId: upstreamWorldId,
    parentCommitId: upstream.headCommitId || null,
    message: mergeMessage,
    authorWallet: mergedBy,
    kind: 'merge',
  });

  return {
    commitId: commit.id,
    stats,
    patchesApplied: freshPatches.length,
  };
}

module.exports = {
  applyPatches,
};
