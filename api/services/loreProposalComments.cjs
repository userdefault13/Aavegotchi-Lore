const { ObjectId } = require('mongodb');
const { getLoreProposalCommentsCollection } = require('../../lib/mongodb.cjs');
const { recordGovernanceEvent } = require('./loreGovernanceEvents.cjs');

function toComment(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    proposalId: doc.proposalId,
    scope: doc.scope,
    pageKey: doc.pageKey || null,
    nodeKey: doc.nodeKey || null,
    hunkPath: doc.hunkPath || null,
    body: doc.body,
    authorWallet: doc.authorWallet,
    createdAt: doc.createdAt?.toISOString?.(),
  };
}

async function listProposalComments(proposalId) {
  const coll = await getLoreProposalCommentsCollection();
  const items = await coll
    .find({ proposalId: proposalId.toString() })
    .sort({ createdAt: 1 })
    .toArray();
  return items.map(toComment);
}

async function addProposalComment({
  proposalId,
  authorWallet,
  body,
  scope = 'general',
  pageKey = null,
  nodeKey = null,
  hunkPath = null,
}) {
  const text = (body || '').trim();
  if (!text) throw new Error('Comment body required');
  if (text.length > 4000) throw new Error('Comment too long');

  const coll = await getLoreProposalCommentsCollection();
  const now = new Date();
  const doc = {
    proposalId: proposalId.toString(),
    scope: scope === 'hunk' ? 'hunk' : 'general',
    pageKey: scope === 'hunk' && !nodeKey ? pageKey || null : null,
    nodeKey: scope === 'hunk' && nodeKey ? nodeKey : null,
    hunkPath: scope === 'hunk' ? hunkPath || null : null,
    body: text,
    authorWallet,
    createdAt: now,
  };
  const result = await coll.insertOne(doc);

  await recordGovernanceEvent({
    proposalId,
    type: 'comment',
    actorWallet: authorWallet,
    message: text.slice(0, 120),
    meta: { scope: doc.scope, pageKey: doc.pageKey, nodeKey: doc.nodeKey, hunkPath: doc.hunkPath },
  });

  return toComment(await coll.findOne({ _id: result.insertedId }));
}

async function deleteProposalComment(commentId, actorWallet, { isMaintainer, isAuthor }) {
  if (!ObjectId.isValid(commentId)) throw new Error('Invalid comment id');
  const coll = await getLoreProposalCommentsCollection();
  const doc = await coll.findOne({ _id: new ObjectId(commentId) });
  if (!doc) throw new Error('Comment not found');

  const own = doc.authorWallet === actorWallet;
  if (!own && !isMaintainer && !isAuthor) throw new Error('Forbidden');

  await coll.deleteOne({ _id: doc._id });
  return { ok: true };
}

module.exports = {
  toComment,
  listProposalComments,
  addProposalComment,
  deleteProposalComment,
};
