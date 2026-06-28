const { ObjectId } = require('mongodb');
const {
  getLorePagesCollection,
  getLoreWorldsCollection,
} = require('../lib/mongodb.cjs');
const { getWorldCommit } = require('./worldCommits.cjs');
const { captureWorldSnapshot } = require('./worldSnapshot.cjs');
const { createWorldCommit } = require('./worldCommits.cjs');
const { getForkSyncStatus } = require('./worldSync.cjs');
const { computePullPlan, conflictKey, pagesByKey } = require('./loreDiff.cjs');
const {
  applyHunkToPage,
  buildParentKeyMap,
  pageDocFromSnapshot,
  clonePageFields,
} = require('./lorePatchApply.cjs');

async function loadPullSnapshots(forkWorld) {
  if (!forkWorld.upstreamWorldId) throw new Error('Not a fork world');
  if (!forkWorld.baseCommitId) throw new Error('Fork has no base commit');

  const worlds = await getLoreWorldsCollection();
  const upstream = await worlds.findOne({ _id: new ObjectId(forkWorld.upstreamWorldId) });
  if (!upstream) throw new Error('Upstream world not found');

  const [baseSnapshot, upstreamSnapshot, forkSnapshot] = await Promise.all([
    getWorldCommit(forkWorld.baseCommitId).then((c) => c?.snapshot),
    upstream.headCommitId
      ? getWorldCommit(upstream.headCommitId).then((c) => c?.snapshot)
      : captureWorldSnapshot(upstream._id.toString()),
    captureWorldSnapshot(forkWorld._id.toString()),
  ]);

  if (!baseSnapshot || !upstreamSnapshot || !forkSnapshot) {
    throw new Error('Could not load snapshots for pull');
  }

  return {
    upstream,
    baseSnapshot,
    upstreamSnapshot,
    forkSnapshot,
    upstreamHeadCommitId: upstream.headCommitId || null,
  };
}

async function previewPull(forkWorldId) {
  const worlds = await getLoreWorldsCollection();
  const fork = await worlds.findOne({ _id: new ObjectId(forkWorldId) });
  if (!fork) throw new Error('Fork not found');

  const sync = await getForkSyncStatus(fork);
  const ctx = await loadPullSnapshots(fork);
  const plan = computePullPlan({
    baseSnapshot: ctx.baseSnapshot,
    upstreamSnapshot: ctx.upstreamSnapshot,
    forkSnapshot: ctx.forkSnapshot,
  });

  return {
    ...sync,
    upstreamHeadCommitId: ctx.upstreamHeadCommitId,
    baseCommitId: fork.baseCommitId,
    autoApply: plan.autoApply,
    conflicts: plan.conflicts,
    stats: plan.stats,
    canPull: sync.commitsBehind > 0,
  };
}

function buildResolutionMap(resolutions = []) {
  const map = new Map();
  for (const r of resolutions) {
    if (!r?.pageKey || !r?.path || !r?.choice) continue;
    map.set(conflictKey(r.pageKey, r.path), r);
  }
  return map;
}

function hunkFromConflict(conflict, choice) {
  if (choice === 'mine') {
    return null;
  }
  if (choice === 'theirs') {
    return {
      path: conflict.path,
      before: conflict.base,
      after: conflict.theirs,
      action: conflict.action,
    };
  }
  if (choice === 'custom') {
    return {
      path: conflict.path,
      before: conflict.base,
      after: conflict.value,
      action: conflict.action,
    };
  }
  return null;
}

async function executePull(forkWorldId, { actorWallet, resolutions = [], message }) {
  const worlds = await getLoreWorldsCollection();
  const fork = await worlds.findOne({ _id: new ObjectId(forkWorldId) });
  if (!fork) throw new Error('Fork not found');
  if (fork.ownerWallet !== actorWallet) throw new Error('Only the fork owner can pull');

  const preview = await previewPull(forkWorldId);
  if (!preview.canPull && preview.commitsBehind === 0) {
    throw new Error('Already up to date with upstream canon');
  }

  const resolutionMap = buildResolutionMap(resolutions);
  for (const conflict of preview.conflicts) {
    const key = conflictKey(conflict.pageKey, conflict.path);
    if (!resolutionMap.has(key)) {
      throw new Error(`Unresolved conflict: ${conflict.pageKey} · ${conflict.path}`);
    }
    const choice = resolutionMap.get(key).choice;
    if (!['mine', 'theirs', 'custom'].includes(choice)) {
      throw new Error(`Invalid resolution choice for ${key}`);
    }
    if (choice === 'custom' && resolutionMap.get(key).value === undefined) {
      throw new Error(`Custom value required for ${key}`);
    }
  }

  const ctx = await loadPullSnapshots(fork);
  const upstreamPages = pagesByKey(ctx.upstreamSnapshot);
  const parentKeyMap = buildParentKeyMap(ctx.upstreamSnapshot);
  const pagesColl = await getLorePagesCollection();
  const forkPages = await pagesColl.find({ worldId: forkWorldId.toString() }).toArray();
  const forkByKey = new Map(forkPages.filter((p) => p.pageKey).map((p) => [p.pageKey, p]));
  const now = new Date();

  function resolveParentId(pageKey) {
    const parentKey = parentKeyMap.get(pageKey);
    if (!parentKey) return null;
    return forkByKey.get(parentKey)?._id?.toString() || null;
  }

  async function applyPatchList(patches, sourcePages) {
    for (const patch of patches) {
      if (patch.action === 'add') {
        const sourcePage = sourcePages.get(patch.pageKey);
        if (!sourcePage || forkByKey.has(patch.pageKey)) continue;
        const parentId = resolveParentId(patch.pageKey);
        const doc = pageDocFromSnapshot(
          sourcePage,
          forkWorldId.toString(),
          fork.ownerWallet,
          parentId,
          now,
        );
        const result = await pagesColl.insertOne(doc);
        forkByKey.set(patch.pageKey, { ...doc, _id: result.insertedId });
        continue;
      }

      if (patch.action === 'delete') {
        const existing = forkByKey.get(patch.pageKey);
        if (existing) {
          await pagesColl.deleteOne({ _id: existing._id });
          forkByKey.delete(patch.pageKey);
        }
        continue;
      }

      const existing = forkByKey.get(patch.pageKey);
      if (!existing) continue;
      const sourcePage = sourcePages.get(patch.pageKey);
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
  }

  await applyPatchList(preview.autoApply, upstreamPages);

  for (const conflict of preview.conflicts) {
    const res = resolutionMap.get(conflictKey(conflict.pageKey, conflict.path));

    if (conflict.path === '_page') {
      if (conflict.action === 'delete') {
        if (res.choice === 'theirs') {
          await applyPatchList(
            [
              {
                pageKey: conflict.pageKey,
                action: 'delete',
                hunks: [{ path: '_page', action: 'delete' }],
              },
            ],
            upstreamPages,
          );
        }
        continue;
      }
      if (conflict.action === 'missing_local' || conflict.action === 'add') {
        if (res.choice === 'theirs') {
          const sourcePage = upstreamPages.get(conflict.pageKey);
          if (sourcePage && !forkByKey.has(conflict.pageKey)) {
            const parentId = resolveParentId(conflict.pageKey);
            const doc = pageDocFromSnapshot(
              sourcePage,
              forkWorldId.toString(),
              fork.ownerWallet,
              parentId,
              now,
            );
            const result = await pagesColl.insertOne(doc);
            forkByKey.set(conflict.pageKey, { ...doc, _id: result.insertedId });
          }
        }
        continue;
      }
    }

    const hunk = hunkFromConflict(conflict, res.choice);
    if (!hunk) continue;

    let existing = forkByKey.get(conflict.pageKey);
    if (!existing && res.choice === 'theirs') {
      const sourcePage = upstreamPages.get(conflict.pageKey);
      if (sourcePage) {
        const parentId = resolveParentId(conflict.pageKey);
        const doc = pageDocFromSnapshot(
          sourcePage,
          forkWorldId.toString(),
          fork.ownerWallet,
          parentId,
          now,
        );
        const result = await pagesColl.insertOne(doc);
        existing = { ...doc, _id: result.insertedId };
        forkByKey.set(conflict.pageKey, existing);
      }
    }
    if (!existing) continue;

    const sourcePage = upstreamPages.get(conflict.pageKey);
    const next = clonePageFields(existing);
    applyHunkToPage(next, hunk, sourcePage);

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

  await worlds.updateOne(
    { _id: fork._id },
    {
      $set: {
        baseCommitId: ctx.upstreamHeadCommitId,
        updatedAt: now,
      },
    },
  );

  const pullMessage = (message || 'Pull from upstream canon').trim().slice(0, 240);
  const commit = await createWorldCommit({
    worldId: forkWorldId,
    parentCommitId: fork.headCommitId || null,
    message: pullMessage,
    authorWallet: actorWallet,
    kind: 'pull',
  });

  return {
    commitId: commit.id,
    baseCommitId: ctx.upstreamHeadCommitId,
    stats: preview.stats,
    conflictsResolved: preview.conflicts.length,
    autoApplied: preview.autoApply.length,
  };
}

module.exports = {
  previewPull,
  executePull,
};
