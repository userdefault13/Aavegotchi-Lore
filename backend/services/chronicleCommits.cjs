const { ObjectId } = require('mongodb');
const { getTomeChronicleCommitsCollection, getTomeChroniclesCollection } = require('../lib/mongodb.cjs');
const { captureChronicleSnapshot } = require('./chronicleSnapshot.cjs');

async function createChronicleCommit({ chronicleId, parentCommitId, message, authorWallet, snapshot, kind }) {
  const coll = await getTomeChronicleCommitsCollection();
  const snap = snapshot || (await captureChronicleSnapshot(chronicleId));
  if (!snap) throw new Error('Chronicle not found');

  const now = new Date();
  const doc = {
    chronicleId: chronicleId.toString(),
    parentCommitId: parentCommitId || null,
    message: message || 'Snapshot',
    authorWallet: authorWallet || null,
    kind: kind || 'checkpoint',
    snapshot: snap,
    createdAt: now,
  };
  const result = await coll.insertOne(doc);
  const commitId = result.insertedId.toString();

  await (await getTomeChroniclesCollection()).updateOne(
    { _id: new ObjectId(chronicleId) },
    { $set: { headCommitId: commitId, updatedAt: now } },
  );

  return { id: commitId, ...doc, createdAt: now.toISOString() };
}

async function getChronicleCommit(commitId) {
  if (!ObjectId.isValid(commitId)) return null;
  const coll = await getTomeChronicleCommitsCollection();
  return coll.findOne({ _id: new ObjectId(commitId) });
}

async function listChronicleCommits(chronicleId, limit = 30) {
  const coll = await getTomeChronicleCommitsCollection();
  const items = await coll.find({ chronicleId: chronicleId.toString() }).sort({ createdAt: -1 }).limit(limit).toArray();
  return items.map((doc) => ({
    id: doc._id.toString(),
    chronicleId: doc.chronicleId,
    parentCommitId: doc.parentCommitId,
    message: doc.message,
    authorWallet: doc.authorWallet,
    kind: doc.kind || 'checkpoint',
    createdAt: doc.createdAt?.toISOString?.(),
  }));
}

module.exports = {
  createChronicleCommit,
  getChronicleCommit,
  listChronicleCommits,
};
