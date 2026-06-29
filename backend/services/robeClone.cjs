const { ObjectId } = require('mongodb');
const {
  getRobeBoardsCollection,
  getRobeFramesCollection,
  getTomeChroniclesCollection,
} = require('../lib/mongodb.cjs');
const { defaultFrameDoc } = require('./robeSync.cjs');

function branchBoardSlug(canonSlug, wallet) {
  return `${canonSlug}-robe--${wallet.toLowerCase()}`.slice(0, 120);
}

async function forkBoard(sourceBoardId, newChronicleId, ownerWallet, nodeIdMap = {}) {
  const boards = await getRobeBoardsCollection();
  const source = await boards.findOne({ _id: new ObjectId(sourceBoardId) });
  if (!source) return null;

  const chronicles = await getTomeChroniclesCollection();
  const chronicle = await chronicles.findOne({ _id: new ObjectId(newChronicleId) });
  if (!chronicle) throw new Error('Target chronicle not found');

  const slug = branchBoardSlug(source.slug || `board-${source._id}`, ownerWallet);
  const existing = await boards.findOne({ chronicleId: newChronicleId.toString() });
  if (existing) return { board: existing, reused: true };

  const now = new Date();
  const boardDoc = {
    chronicleId: newChronicleId.toString(),
    linkedWorldId: chronicle.linkedWorldBranchId || chronicle.linkedWorldId || source.linkedWorldId,
    title: `${source.title} (branch)`,
    slug,
    defaultTransition: source.defaultTransition || { type: 'fade', durationMs: 600 },
    forkOfBoardId: source._id.toString(),
    upstreamBoardId: source._id.toString(),
    upstreamChronicleId: source.chronicleId,
    visibility: 'private',
    maintainers: [],
    ownerWallet: ownerWallet.toLowerCase(),
    createdAt: now,
    updatedAt: now,
  };

  const boardResult = await boards.insertOne(boardDoc);
  const newBoardId = boardResult.insertedId.toString();

  const framesColl = await getRobeFramesCollection();
  const sourceFrames = await framesColl.find({ boardId: source._id.toString() }).toArray();

  for (const frame of sourceFrames) {
    const newNodeId = nodeIdMap[frame.storyNodeId] || frame.storyNodeId;
    await framesColl.insertOne({
      ...defaultFrameDoc(boardResult.insertedId, { _id: new ObjectId(newNodeId), title: frame.sceneTitle, order: frame.order }, now),
      preset: frame.preset,
      layers: JSON.parse(JSON.stringify(frame.layers || [])),
      holdDurationMs: frame.holdDurationMs,
      transition: frame.transition ? { ...frame.transition } : null,
      composedUrl: frame.composedUrl,
      aiGenerated: frame.aiGenerated ? { ...frame.aiGenerated } : null,
      audioTrack: null,
    });
  }

  const created = await boards.findOne({ _id: boardResult.insertedId });
  return { board: created, reused: false, boardId: newBoardId };
}

async function forkBoardForChronicle(sourceChronicleId, newChronicleId, ownerWallet, nodeIdMap) {
  const boards = await getRobeBoardsCollection();
  const sourceBoard = await boards.findOne({ chronicleId: sourceChronicleId.toString() });
  if (!sourceBoard) return null;
  return forkBoard(sourceBoard._id.toString(), newChronicleId, ownerWallet, nodeIdMap);
}

module.exports = {
  forkBoard,
  forkBoardForChronicle,
  branchBoardSlug,
};
