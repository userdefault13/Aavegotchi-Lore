const express = require('express');
const { ObjectId } = require('mongodb');
const {
  getTomeChroniclesCollection,
  getStoryNodesCollection,
  getLoreWorldsCollection,
  getLorePagesCollection,
  getTomeChronicleCommitsCollection,
} = require('../lib/mongodb.cjs');
const {
  getOwnerWallet,
  requireAuth,
  canReadChronicle,
  canWriteChronicle,
} = require('../middleware/owner');
const { forkChronicle } = require('../services/chronicleClone.cjs');
const { listChronicleCommits, createChronicleCommit } = require('../services/chronicleCommits.cjs');
const { getChronicleSyncStatus } = require('../services/chronicleSync.cjs');
const { previewPull, executePull } = require('../services/chroniclePull.cjs');

const router = express.Router();

function toChronicle(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug || null,
    description: doc.description || '',
    linkedWorldId: doc.linkedWorldId || null,
    linkedWorldBranchId: doc.linkedWorldBranchId || null,
    toolboard: doc.toolboard || { widgets: [] },
    visibility: doc.visibility || 'private',
    forkOfChronicleId: doc.forkOfChronicleId || null,
    upstreamChronicleId: doc.upstreamChronicleId || null,
    baseCommitId: doc.baseCommitId || null,
    headCommitId: doc.headCommitId || null,
    maintainers: doc.maintainers || [],
    ownerWallet: doc.ownerWallet,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

router.get('/', async (req, res) => {
  try {
    const owner = getOwnerWallet(req);
    const coll = await getTomeChroniclesCollection();
    const filter =
      owner === '0x0000000000000000000000000000000000000000' ? {} : { ownerWallet: owner };
    const items = await coll.find(filter).sort({ updatedAt: -1 }).toArray();
    res.json(items.map(toChronicle));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/canon', async (_req, res) => {
  try {
    const coll = await getTomeChroniclesCollection();
    const nodesColl = await getStoryNodesCollection();
    const items = await coll.find({ visibility: 'canonical' }).sort({ updatedAt: -1 }).toArray();
    const enriched = await Promise.all(
      items.map(async (doc) => {
        const c = toChronicle(doc);
        const nodeCount = await nodesColl.countDocuments({ chronicleId: c.id });
        return { ...c, nodeCount };
      }),
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/canon/:slug', async (req, res) => {
  try {
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ slug: req.params.slug, visibility: 'canonical' });
    if (!doc) return res.status(404).json({ error: 'Canon not found' });
    const nodesColl = await getStoryNodesCollection();
    const c = toChronicle(doc);
    const nodeCount = await nodesColl.countDocuments({ chronicleId: c.id });
    res.json({ ...c, nodeCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const owner = requireAuth(req, res);
    if (!owner) return;
    const { title, description, linkedWorldId } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'title is required' });
    const coll = await getTomeChroniclesCollection();
    const now = new Date();
    const baseSlug = title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 72) || 'chronicle';
    let finalSlug = baseSlug;
    let attempt = 0;
    while (await coll.findOne({ slug: finalSlug })) {
      attempt += 1;
      finalSlug = `${baseSlug}-${attempt}`;
    }
    const doc = {
      title: title.trim(),
      slug: finalSlug,
      description: (description || '').trim(),
      linkedWorldId: linkedWorldId || null,
      linkedWorldBranchId: null,
      toolboard: { widgets: [] },
      visibility: 'private',
      forkOfChronicleId: null,
      upstreamChronicleId: null,
      baseCommitId: null,
      headCommitId: null,
      maintainers: [],
      ownerWallet: owner,
      createdAt: now,
      updatedAt: now,
    };
    const result = await coll.insertOne(doc);
    res.status(201).json(toChronicle(await coll.findOne({ _id: result.insertedId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function createBranchFromChronicle(req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;

    const coll = await getTomeChroniclesCollection();
    const source = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!source) return res.status(404).json({ error: 'Not found' });
    if (!canReadChronicle(source, req)) return res.status(403).json({ error: 'Forbidden' });

    const result = await forkChronicle(req.params.id, owner);
    res.status(result.reused ? 200 : 201).json({
      ...toChronicle(result.chronicle),
      reused: result.reused,
      baseCommitId: result.baseCommitId || result.chronicle.baseCommitId,
      headCommitId: result.headCommitId || result.chronicle.headCommitId,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

router.post('/:id/fork', createBranchFromChronicle);
router.post('/:id/branch', createBranchFromChronicle);

router.get('/:id/branches', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getTomeChroniclesCollection();
    const source = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!source) return res.status(404).json({ error: 'Not found' });
    if (source.visibility !== 'canonical') {
      return res.status(400).json({ error: 'Only canon chronicles expose member branches' });
    }
    const nodesColl = await getStoryNodesCollection();
    const branches = await coll.find({ upstreamChronicleId: req.params.id }).sort({ updatedAt: -1 }).toArray();
    const enriched = await Promise.all(
      branches.map(async (doc) => {
        const c = toChronicle(doc);
        const nodeCount = await nodesColl.countDocuments({ chronicleId: c.id });
        return { ...c, nodeCount };
      }),
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/sync-status', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadChronicle(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const status = await getChronicleSyncStatus(doc);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/pull-preview', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadChronicle(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const preview = await previewPull(req.params.id);
    res.json(preview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/pull', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canWriteChronicle(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const result = await executePull(req.params.id, {
      actorWallet: owner,
      resolutions: req.body.resolutions || [],
      message: req.body.message,
    });
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/:id/commit', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canWriteChronicle(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const commit = await createChronicleCommit({
      chronicleId: req.params.id,
      parentCommitId: doc.headCommitId || null,
      message: req.body.message || 'Checkpoint',
      authorWallet: owner,
      kind: req.body.kind || 'checkpoint',
    });
    res.status(201).json(commit);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/commits', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadChronicle(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const items = await listChronicleCommits(req.params.id);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadChronicle(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    res.json(toChronicle(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canWriteChronicle(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const updates = { updatedAt: new Date() };
    for (const key of ['title', 'description', 'linkedWorldId', 'toolboard']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await coll.updateOne({ _id: doc._id }, { $set: updates });
    res.json(toChronicle(await coll.findOne({ _id: doc._id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getTomeChroniclesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (doc.visibility === 'canonical') return res.status(403).json({ error: 'Cannot delete canonical chronicle' });
    if (!canWriteChronicle(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const cid = req.params.id;
    const nodesColl = await getStoryNodesCollection();
    await nodesColl.deleteMany({ chronicleId: cid });

    const worlds = await getLoreWorldsCollection();
    await worlds.updateMany(
      { linkedChronicleIds: cid },
      { $pull: { linkedChronicleIds: cid }, $set: { updatedAt: new Date() } },
    );

    const pagesColl = await getLorePagesCollection();
    await pagesColl.updateMany(
      { crossLinks: { $elemMatch: { chronicleId: cid } } },
      { $pull: { crossLinks: { chronicleId: cid } }, $set: { updatedAt: new Date() } },
    );
    await nodesColl.updateMany(
      { crossLinks: { $elemMatch: { chronicleId: cid } } },
      { $pull: { crossLinks: { chronicleId: cid } }, $set: { updatedAt: new Date() } },
    );

    const commitsColl = await getTomeChronicleCommitsCollection();
    await commitsColl.deleteMany({ chronicleId: cid });
    await coll.deleteOne({ _id: doc._id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
