const { ObjectId } = require('mongodb');
const {
  getRobeBoardsCollection,
  getRobeFramesCollection,
  getStoryNodesCollection,
  getTomeChroniclesCollection,
} = require('../lib/mongodb.cjs');

function defaultFrameDoc(boardId, node, now) {
  return {
    boardId: boardId.toString(),
    storyNodeId: node._id.toString(),
    sceneTitle: node.title || 'Scene',
    order: node.order ?? 0,
    preset: null,
    layers: [],
    holdDurationMs: null,
    transition: null,
    composedUrl: null,
    aiGenerated: null,
    audioTrack: null,
    createdAt: now,
    updatedAt: now,
  };
}

function frameHasImageLayers(frame) {
  return (frame.layers || []).some((l) => l.kind === 'image' && l.assetUrl);
}

async function syncBoardFrames(boardId) {
  const boards = await getRobeBoardsCollection();
  const board = await boards.findOne({ _id: new ObjectId(boardId) });
  if (!board) throw new Error('Board not found');

  const nodesColl = await getStoryNodesCollection();
  const scenes = await nodesColl
    .find({ chronicleId: board.chronicleId, type: 'scene' })
    .sort({ order: 1, branchIndex: 1 })
    .toArray();

  const framesColl = await getRobeFramesCollection();
  const existing = await framesColl.find({ boardId: boardId.toString() }).toArray();
  const byNodeId = new Map(existing.map((f) => [f.storyNodeId, f]));
  const sceneIds = new Set(scenes.map((s) => s._id.toString()));
  const now = new Date();

  let created = 0;
  let updated = 0;

  for (const scene of scenes) {
    const nodeId = scene._id.toString();
    const prev = byNodeId.get(nodeId);
    if (!prev) {
      await framesColl.insertOne(defaultFrameDoc(boardId, scene, now));
      created += 1;
    } else if (prev.order !== (scene.order ?? 0) || prev.sceneTitle !== (scene.title || 'Scene')) {
      await framesColl.updateOne(
        { _id: prev._id },
        { $set: { order: scene.order ?? 0, sceneTitle: scene.title || 'Scene', updatedAt: now } },
      );
      updated += 1;
    }
  }

  const toRemove = existing.filter((f) => !sceneIds.has(f.storyNodeId));
  if (toRemove.length) {
    await framesColl.deleteMany({ _id: { $in: toRemove.map((f) => f._id) } });
  }

  await boards.updateOne({ _id: board._id }, { $set: { updatedAt: now } });

  return { created, updated, removed: toRemove.length, sceneCount: scenes.length };
}

async function getOrCreateBoardForChronicle(chronicleId, ownerWallet) {
  const chronicles = await getTomeChroniclesCollection();
  const chronicle = await chronicles.findOne({ _id: new ObjectId(chronicleId) });
  if (!chronicle) throw new Error('Chronicle not found');

  const boards = await getRobeBoardsCollection();
  let board = await boards.findOne({ chronicleId: chronicleId.toString() });
  const now = new Date();

  if (!board) {
    const doc = {
      chronicleId: chronicleId.toString(),
      linkedWorldId: chronicle.linkedWorldBranchId || chronicle.linkedWorldId || null,
      title: `${chronicle.title} — Storyboard`,
      slug: `${chronicle.slug || chronicleId}-robe`.slice(0, 120),
      defaultTransition: { type: 'fade', durationMs: 600 },
      forkOfBoardId: null,
      upstreamBoardId: null,
      upstreamChronicleId: chronicle.upstreamChronicleId || null,
      visibility: chronicle.visibility || 'private',
      maintainers: chronicle.maintainers || [],
      ownerWallet: (ownerWallet || chronicle.ownerWallet || '').toLowerCase(),
      createdAt: now,
      updatedAt: now,
    };
    const result = await boards.insertOne(doc);
    board = await boards.findOne({ _id: result.insertedId });
  }

  await syncBoardFrames(board._id.toString());
  return board;
}

module.exports = {
  syncBoardFrames,
  getOrCreateBoardForChronicle,
  frameHasImageLayers,
  defaultFrameDoc,
};
