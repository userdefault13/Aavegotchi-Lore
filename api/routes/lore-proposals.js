const express = require('express');
const { ObjectId } = require('mongodb');
const { getLoreWorldsCollection } = require('../../lib/mongodb.cjs');
const { getOwnerWallet, requireAuth, canReadWorld } = require('../middleware/owner');
const {
  previewProposal,
  createProposal,
  listProposals,
  getProposal,
  updateProposalStatus,
  refreshProposal,
  getProposalGovernance,
  linkSnapshotProposal,
  executeProposalMerge,
} = require('../services/loreProposals.cjs');
const {
  listProposalComments,
  addProposalComment,
  deleteProposalComment,
} = require('../services/loreProposalComments.cjs');
const { listGovernanceEvents } = require('../services/loreGovernanceEvents.cjs');

const router = express.Router();

function isMaintainer(world, wallet) {
  if (!world || !wallet) return false;
  return world.ownerWallet === wallet || (world.maintainers || []).includes(wallet);
}

async function loadProposalContext(proposalId) {
  const proposal = await getProposal(proposalId);
  if (!proposal) return null;
  const worlds = await getLoreWorldsCollection();
  const [upstream, source] = await Promise.all([
    worlds.findOne({ _id: new ObjectId(proposal.upstreamWorldId) }),
    worlds.findOne({ _id: new ObjectId(proposal.sourceWorldId) }),
  ]);
  return { proposal, upstream, source };
}

function canViewProposal(proposal, upstream, source, req) {
  const wallet = getOwnerWallet(req);
  return (
    canReadWorld(source, req) ||
    canReadWorld(upstream, req) ||
    isMaintainer(upstream, wallet) ||
    proposal.authorWallet === wallet
  );
}

router.get('/preview', async (req, res) => {
  try {
    const { sourceWorldId } = req.query;
    if (!sourceWorldId || !ObjectId.isValid(sourceWorldId)) {
      return res.status(400).json({ error: 'sourceWorldId required' });
    }
    const worlds = await getLoreWorldsCollection();
    const source = await worlds.findOne({ _id: new ObjectId(sourceWorldId) });
    if (!source) return res.status(404).json({ error: 'Not found' });
    if (!canReadWorld(source, req)) return res.status(403).json({ error: 'Forbidden' });
    const preview = await previewProposal(sourceWorldId);
    res.json(preview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { upstreamWorldId, sourceWorldId, status, mine } = req.query;
    const wallet = getOwnerWallet(req);
    const filter = { limit: 80 };

    if (upstreamWorldId) {
      if (!ObjectId.isValid(upstreamWorldId)) return res.status(400).json({ error: 'Invalid upstreamWorldId' });
      const upstream = await (await getLoreWorldsCollection()).findOne({ _id: new ObjectId(upstreamWorldId) });
      if (!upstream) return res.status(404).json({ error: 'Upstream not found' });
      if (!canReadWorld(upstream, req) && !isMaintainer(upstream, wallet)) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      filter.upstreamWorldId = upstreamWorldId;
    }

    if (sourceWorldId) {
      filter.sourceWorldId = sourceWorldId;
    }

    if (mine === '1' && wallet !== '0x0000000000000000000000000000000000000000') {
      filter.authorWallet = wallet;
    }

    if (status) filter.status = status;
    else if (upstreamWorldId) filter.statusIn = ['open', 'changes_requested', 'nominated', 'voting'];

    const items = await listProposals(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const owner = requireAuth(req, res);
    if (!owner) return;
    const { sourceWorldId, title, body } = req.body;
    if (!sourceWorldId || !title?.trim()) {
      return res.status(400).json({ error: 'sourceWorldId and title required' });
    }
    const proposal = await createProposal({
      sourceWorldId,
      title: title.trim(),
      body,
      authorWallet: owner,
    });
    res.status(201).json(proposal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const ctx = await loadProposalContext(req.params.id);
    if (!ctx) return res.status(404).json({ error: 'Not found' });
    if (!canViewProposal(ctx.proposal, ctx.upstream, ctx.source, req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(ctx.proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/comments', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const ctx = await loadProposalContext(req.params.id);
    if (!ctx) return res.status(404).json({ error: 'Not found' });
    if (!canViewProposal(ctx.proposal, ctx.upstream, ctx.source, req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const comments = await listProposalComments(req.params.id);
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/comments', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;

    const ctx = await loadProposalContext(req.params.id);
    if (!ctx) return res.status(404).json({ error: 'Not found' });
    if (!canViewProposal(ctx.proposal, ctx.upstream, ctx.source, req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { body, scope, pageKey, nodeKey, hunkPath } = req.body;
    const comment = await addProposalComment({
      proposalId: req.params.id,
      authorWallet: owner,
      body,
      scope,
      pageKey,
      nodeKey,
      hunkPath,
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.params.commentId)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const owner = requireAuth(req, res);
    if (!owner) return;

    const ctx = await loadProposalContext(req.params.id);
    if (!ctx) return res.status(404).json({ error: 'Not found' });

    const wallet = owner;
    const maintainer = isMaintainer(ctx.upstream, wallet);
    const isAuthor = ctx.proposal.authorWallet === wallet;

    await deleteProposalComment(req.params.commentId, wallet, {
      isMaintainer: maintainer,
      isAuthor,
    });
    res.status(204).end();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/events', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const ctx = await loadProposalContext(req.params.id);
    if (!ctx) return res.status(404).json({ error: 'Not found' });
    if (!canViewProposal(ctx.proposal, ctx.upstream, ctx.source, req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const events = await listGovernanceEvents(req.params.id);
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/refresh', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;

    const updated = await refreshProposal(req.params.id, owner);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/governance', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const ctx = await loadProposalContext(req.params.id);
    if (!ctx) return res.status(404).json({ error: 'Not found' });
    if (!canViewProposal(ctx.proposal, ctx.upstream, ctx.source, req)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const governance = await getProposalGovernance(req.params.id);
    res.json(governance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/snapshot', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;

    const { snapshotProposalId } = req.body;
    const upstream = await (await getLoreWorldsCollection()).findOne({
      _id: new ObjectId((await getProposal(req.params.id))?.upstreamWorldId),
    });

    const updated = await linkSnapshotProposal(req.params.id, snapshotProposalId, {
      actorWallet: owner,
      isMaintainer: isMaintainer(upstream, owner),
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/merge', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;

    const existing = await getProposal(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const upstream = await (await getLoreWorldsCollection()).findOne({
      _id: new ObjectId(existing.upstreamWorldId),
    });

    const result = await executeProposalMerge(req.params.id, {
      actorWallet: owner,
      isMaintainer: isMaintainer(upstream, owner),
      force: !!req.body.force,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;

    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'status required' });

    const existing = await getProposal(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Not found' });

    const upstream = await (await getLoreWorldsCollection()).findOne({
      _id: new ObjectId(existing.upstreamWorldId),
    });

    const updated = await updateProposalStatus(req.params.id, status, {
      actorWallet: owner,
      isMaintainer: isMaintainer(upstream, owner),
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
