const express = require('express');
const { ObjectId } = require('mongodb');
const { getLoreWorldsCollection } = require('../lib/mongodb.cjs');
const { getOwnerWallet, requireAuth, requireOwner, canReadWorld, canWriteWorld } = require('../middleware/owner');
const { buildMarkdownZip, buildWorldPdf } = require('../services/worldExport.cjs');
const { forkWorld } = require('../services/worldClone.cjs');
const { listWorldCommits, createWorldCommit } = require('../services/worldCommits.cjs');
const { getForkSyncStatus } = require('../services/worldSync.cjs');
const { previewPull, executePull } = require('../services/worldPull.cjs');
const { getLorePagesCollection } = require('../lib/mongodb.cjs');

const router = express.Router();

function toWorld(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description || '',
    templateDefs: doc.templateDefs || [],
    linkedChronicleIds: doc.linkedChronicleIds || [],
    tags: doc.tags || [],
    visibility: doc.visibility || 'private',
    forkOfWorldId: doc.forkOfWorldId || null,
    upstreamWorldId: doc.upstreamWorldId || null,
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
    const coll = await getLoreWorldsCollection();
    const filter =
      owner === '0x0000000000000000000000000000000000000000'
        ? {}
        : { ownerWallet: owner };
    const items = await coll.find(filter).sort({ updatedAt: -1 }).toArray();
    res.json(items.map(toWorld));
  } catch (err) {
    console.error('lore-worlds GET:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/canon', async (_req, res) => {
  try {
    const coll = await getLoreWorldsCollection();
    const pagesColl = await getLorePagesCollection();
    const items = await coll.find({ visibility: 'canonical' }).sort({ updatedAt: -1 }).toArray();
    const enriched = await Promise.all(
      items.map(async (doc) => {
        const w = toWorld(doc);
        const pageCount = await pagesColl.countDocuments({ worldId: w.id });
        return { ...w, pageCount };
      }),
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/canon/:slug', async (req, res) => {
  try {
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ slug: req.params.slug, visibility: 'canonical' });
    if (!doc) return res.status(404).json({ error: 'Canon not found' });
    const pagesColl = await getLorePagesCollection();
    const w = toWorld(doc);
    const pageCount = await pagesColl.countDocuments({ worldId: w.id });
    res.json({ ...w, pageCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const coll = await getLoreWorldsCollection();
    const owner = getOwnerWallet(req);
    const filter = {
      $text: { $search: q },
      ...(owner !== '0x0000000000000000000000000000000000000000' ? { ownerWallet: owner } : {}),
    };
    const items = await coll.find(filter).limit(20).toArray();
    res.json(items.map(toWorld));
  } catch {
    const coll = await getLoreWorldsCollection();
    const q = (req.query.q || '').trim();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const items = await coll.find({ title: regex }).limit(20).toArray();
    res.json(items.map(toWorld));
  }
});

router.post('/', async (req, res) => {
  try {
    const owner = requireAuth(req, res);
    if (!owner) return;
    const { title, description, slug, templateDefs, seedId } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'title is required' });
    const coll = await getLoreWorldsCollection();
    const now = new Date();
    const baseSlug = (slug || title.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'world').slice(0, 72);
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
      templateDefs: templateDefs || [],
      linkedChronicleIds: [],
      tags: [],
      seedId: seedId || null,
      visibility: 'private',
      forkOfWorldId: null,
      upstreamWorldId: null,
      baseCommitId: null,
      headCommitId: null,
      maintainers: [],
      ownerWallet: owner,
      createdAt: now,
      updatedAt: now,
    };
    const result = await coll.insertOne(doc);
    res.status(201).json(toWorld(await coll.findOne({ _id: result.insertedId })));
  } catch (err) {
    console.error('lore-worlds POST:', err);
    res.status(500).json({ error: err.message });
  }
});

async function createBranchFromWorld(req, res) {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const owner = requireAuth(req, res);
    if (!owner) return;

    const coll = await getLoreWorldsCollection();
    const source = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!source) return res.status(404).json({ error: 'Not found' });
    if (!canReadWorld(source, req)) return res.status(403).json({ error: 'Forbidden' });

    const result = await forkWorld(req.params.id, owner);
    res.status(result.reused ? 200 : 201).json({
      ...toWorld(result.world),
      reused: result.reused,
      baseCommitId: result.baseCommitId || result.world.baseCommitId,
      headCommitId: result.headCommitId || result.world.headCommitId,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

router.post('/:id/fork', createBranchFromWorld);
router.post('/:id/branch', createBranchFromWorld);

router.get('/:id/branches', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreWorldsCollection();
    const source = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!source) return res.status(404).json({ error: 'Not found' });
    if (source.visibility !== 'canonical') {
      return res.status(400).json({ error: 'Only canon worlds expose member branches' });
    }
    const pagesColl = await getLorePagesCollection();
    const branches = await coll
      .find({ upstreamWorldId: req.params.id })
      .sort({ updatedAt: -1 })
      .toArray();
    const enriched = await Promise.all(
      branches.map(async (doc) => {
        const w = toWorld(doc);
        const pageCount = await pagesColl.countDocuments({ worldId: w.id });
        return { ...w, pageCount };
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
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const status = await getForkSyncStatus(doc);
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/pull-preview', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    if (!doc.upstreamWorldId) return res.status(400).json({ error: 'Not a fork world' });
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
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canWriteWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    if (!doc.upstreamWorldId) return res.status(400).json({ error: 'Not a fork world' });

    const { resolutions, message } = req.body || {};
    const result = await executePull(req.params.id, {
      actorWallet: owner,
      resolutions: resolutions || [],
      message,
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
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canWriteWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });

    const message = (req.body.message || 'Checkpoint').trim().slice(0, 240);
    const kind = doc.visibility === 'canonical' && !doc.upstreamWorldId
      ? (req.body.kind || 'checkpoint')
      : 'checkpoint';
    const commit = await createWorldCommit({
      worldId: req.params.id,
      parentCommitId: doc.headCommitId || null,
      message,
      authorWallet: owner,
      kind,
    });
    res.status(201).json({
      id: commit.id,
      message: commit.message,
      authorWallet: commit.authorWallet,
      parentCommitId: commit.parentCommitId,
      kind: commit.kind,
      createdAt: commit.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/commits', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const commits = await listWorldCommits(req.params.id);
    res.json(commits);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/export/markdown', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const result = await buildMarkdownZip(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    result.stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/export/pdf', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const result = await buildWorldPdf(req.params.id);
    if (!result) return res.status(404).json({ error: 'Not found' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    result.stream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canReadWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    res.json(toWorld(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!canWriteWorld(doc, req)) return res.status(403).json({ error: 'Forbidden' });
    const updates = { updatedAt: new Date() };
    for (const key of [
      'title',
      'description',
      'slug',
      'templateDefs',
      'linkedChronicleIds',
      'tags',
      'linkedWorldId',
      'maintainers',
    ]) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (req.body.visibility !== undefined && doc.visibility !== 'canonical') {
      updates.visibility = req.body.visibility;
    }
    await coll.updateOne({ _id: doc._id }, { $set: updates });
    res.json(toWorld(await coll.findOne({ _id: doc._id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreWorldsCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!requireOwner(doc, req, res)) return;
    if (doc.visibility === 'canonical') {
      return res.status(403).json({ error: 'Canonical worlds cannot be deleted via API' });
    }
    await coll.deleteOne({ _id: doc._id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
