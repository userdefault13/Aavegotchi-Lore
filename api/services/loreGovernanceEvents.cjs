const { ObjectId } = require('mongodb');
const { getLoreGovernanceEventsCollection } = require('../../lib/mongodb.cjs');

function toEvent(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    proposalId: doc.proposalId,
    type: doc.type,
    actorWallet: doc.actorWallet,
    message: doc.message || '',
    meta: doc.meta || {},
    createdAt: doc.createdAt?.toISOString?.(),
  };
}

async function recordGovernanceEvent({ proposalId, type, actorWallet, message, meta }) {
  const coll = await getLoreGovernanceEventsCollection();
  const now = new Date();
  const doc = {
    proposalId: proposalId.toString(),
    type,
    actorWallet: actorWallet || null,
    message: (message || '').trim(),
    meta: meta || {},
    createdAt: now,
  };
  const result = await coll.insertOne(doc);
  return toEvent(await coll.findOne({ _id: result.insertedId }));
}

async function listGovernanceEvents(proposalId, limit = 80) {
  const coll = await getLoreGovernanceEventsCollection();
  const items = await coll
    .find({ proposalId: proposalId.toString() })
    .sort({ createdAt: 1 })
    .limit(limit)
    .toArray();
  return items.map(toEvent);
}

module.exports = {
  toEvent,
  recordGovernanceEvent,
  listGovernanceEvents,
};
