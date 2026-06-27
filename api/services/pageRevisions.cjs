const { ObjectId } = require('mongodb');
const { getLorePageRevisionsCollection } = require('../../lib/mongodb.cjs');
const { getOwnerWallet } = require('../middleware/owner');

const REVISION_FIELDS = ['title', 'templateId', 'blocks', 'layout', 'runes', 'tags', 'mirrorLinks', 'crossLinks', 'frame'];
const MAX_REVISIONS = 50;

function snapshotFromPage(doc) {
  const snap = {};
  for (const key of REVISION_FIELDS) snap[key] = doc[key] ?? (key === 'tags' ? [] : null);
  return snap;
}

function revisionChanged(before, after) {
  return REVISION_FIELDS.some((key) => JSON.stringify(before[key] ?? null) !== JSON.stringify(after[key] ?? null));
}

function toRevision(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    pageId: doc.pageId,
    worldId: doc.worldId,
    label: doc.label || '',
    snapshot: doc.snapshot || {},
    createdAt: doc.createdAt?.toISOString?.(),
    createdBy: doc.createdBy || null,
  };
}

async function savePageRevision(pageDoc, { label = '' } = {}) {
  const coll = await getLorePageRevisionsCollection();
  const now = new Date();
  const doc = {
    pageId: pageDoc._id.toString(),
    worldId: pageDoc.worldId,
    label: label || pageDoc.title || 'Revision',
    snapshot: snapshotFromPage(pageDoc),
    createdBy: pageDoc.ownerWallet || null,
    createdAt: now,
  };
  const result = await coll.insertOne(doc);
  const saved = await coll.findOne({ _id: result.insertedId });

  const excess = await coll
    .find({ pageId: doc.pageId })
    .sort({ createdAt: -1 })
    .skip(MAX_REVISIONS)
    .toArray();
  if (excess.length) {
    await coll.deleteMany({ _id: { $in: excess.map((d) => d._id) } });
  }
  return toRevision(saved);
}

async function listPageRevisions(pageId, limit = 30) {
  const coll = await getLorePageRevisionsCollection();
  const items = await coll.find({ pageId }).sort({ createdAt: -1 }).limit(limit).toArray();
  return items.map(toRevision);
}

async function getPageRevision(revisionId) {
  if (!ObjectId.isValid(revisionId)) return null;
  const coll = await getLorePageRevisionsCollection();
  const doc = await coll.findOne({ _id: new ObjectId(revisionId) });
  return toRevision(doc);
}

module.exports = {
  REVISION_FIELDS,
  revisionChanged,
  snapshotFromPage,
  savePageRevision,
  listPageRevisions,
  getPageRevision,
  toRevision,
};
