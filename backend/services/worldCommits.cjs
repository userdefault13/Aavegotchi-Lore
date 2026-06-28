const { ObjectId } = require('mongodb');
const { getLoreWorldCommitsCollection, getLoreWorldsCollection } = require('../lib/mongodb.cjs');
const { captureWorldSnapshot, collectAssetRefs } = require('./worldSnapshot.cjs');

async function createWorldCommit({ worldId, parentCommitId, message, authorWallet, snapshot, kind }) {
  const coll = await getLoreWorldCommitsCollection();
  const snap = snapshot || (await captureWorldSnapshot(worldId));
  if (!snap) throw new Error('World not found');

  const now = new Date();
  const doc = {
    worldId: worldId.toString(),
    parentCommitId: parentCommitId || null,
    message: message || 'Snapshot',
    authorWallet: authorWallet || null,
    kind: kind || 'checkpoint',
    assetRefs: collectAssetRefs(snap),
    snapshot: snap,
    createdAt: now,
  };
  const result = await coll.insertOne(doc);
  const commitId = result.insertedId.toString();

  await (await getLoreWorldsCollection()).updateOne(
    { _id: new ObjectId(worldId) },
    { $set: { headCommitId: commitId, updatedAt: now } },
  );

  return { id: commitId, ...doc, createdAt: now.toISOString() };
}

async function getWorldCommit(commitId) {
  if (!ObjectId.isValid(commitId)) return null;
  const coll = await getLoreWorldCommitsCollection();
  return coll.findOne({ _id: new ObjectId(commitId) });
}

async function listWorldCommits(worldId, limit = 30) {
  const coll = await getLoreWorldCommitsCollection();
  const items = await coll.find({ worldId: worldId.toString() }).sort({ createdAt: -1 }).limit(limit).toArray();
  return items.map((doc) => ({
    id: doc._id.toString(),
    worldId: doc.worldId,
    parentCommitId: doc.parentCommitId,
    message: doc.message,
    authorWallet: doc.authorWallet,
    kind: doc.kind || 'checkpoint',
    assetRefCount: (doc.assetRefs || []).length,
    createdAt: doc.createdAt?.toISOString?.(),
  }));
}

module.exports = {
  createWorldCommit,
  getWorldCommit,
  listWorldCommits,
};
