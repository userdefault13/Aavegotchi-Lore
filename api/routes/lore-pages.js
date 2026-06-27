const express = require('express');
const { ObjectId } = require('mongodb');
const { getLorePagesCollection, getLoreWorldsCollection } = require('../../lib/mongodb.cjs');
const { getOwnerWallet, requireAuth, canReadWorld, canWriteWorld } = require('../middleware/owner');
const { generatePageKey, uniquifyPageKey } = require('../services/pageKey.cjs');
const { applyMirrorLinks, propagateTemplateChange, listMirrorGraph } = require('../services/loreEngine.cjs');
const { savePageRevision, listPageRevisions, revisionChanged } = require('../services/pageRevisions.cjs');

const router = express.Router();

async function getWorldById(worldId) {
  if (!ObjectId.isValid(worldId)) return null;
  return (await getLoreWorldsCollection()).findOne({ _id: new ObjectId(worldId) });
}

async function assertWorldWrite(worldId, req, res) {
  const world = await getWorldById(worldId);
  if (!world) {
    res.status(404).json({ error: 'World not found' });
    return null;
  }
  if (!canWriteWorld(world, req)) {
    res.status(403).json({ error: 'Forbidden' });
    return null;
  }
  return world;
}

function toPage(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    worldId: doc.worldId,
    pageKey: doc.pageKey || null,
    parentId: doc.parentId || null,
    templateId: doc.templateId || 'default',
    title: doc.title,
    blocks: doc.blocks || [],
    layout: doc.layout || null,
    runes: doc.runes || {},
    tags: doc.tags || [],
    mirrorLinks: doc.mirrorLinks || [],
    crossLinks: doc.crossLinks || [],
    frame: doc.frame || null,
    order: doc.order ?? 0,
    ownerWallet: doc.ownerWallet,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) return res.json([]);
    const coll = await getLorePagesCollection();
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const items = await coll
      .find({ $or: [{ title: regex }, { 'tags.label': regex }] })
      .limit(40)
      .toArray();
    res.json(items.map(toPage));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const { worldId, q } = req.query;
    if (!worldId) return res.status(400).json({ error: 'worldId is required' });
    const worlds = await getLoreWorldsCollection();
    const world = await worlds.findOne({ _id: new ObjectId(worldId) });
    if (!world) return res.status(404).json({ error: 'World not found' });
    if (!canReadWorld(world, req)) return res.status(403).json({ error: 'Forbidden' });
    const coll = await getLorePagesCollection();
    if (q?.trim()) {
      const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const items = await coll.find({ worldId, title: regex }).limit(50).toArray();
      return res.json(items.map(toPage));
    }
    const items = await coll.find({ worldId }).sort({ order: 1, title: 1 }).toArray();
    res.json(items.map(toPage));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const owner = requireAuth(req, res);
    if (!owner) return;
    const { worldId, parentId, templateId, title, blocks, layout, runes, tags, order, pageKey } = req.body;
    if (!worldId || !title?.trim()) return res.status(400).json({ error: 'worldId and title required' });
    const worlds = await getLoreWorldsCollection();
    const world = await worlds.findOne({ _id: new ObjectId(worldId) });
    if (!world) return res.status(404).json({ error: 'World not found' });
    if (!canWriteWorld(world, req)) return res.status(403).json({ error: 'Forbidden' });

    const coll = await getLorePagesCollection();
    const now = new Date();
    let finalPageKey = pageKey;
    if (!finalPageKey) {
      const parent = parentId && ObjectId.isValid(parentId)
        ? await coll.findOne({ _id: new ObjectId(parentId) })
        : null;
      const used = new Set(
        (await coll.find({ worldId, pageKey: { $exists: true, $ne: null } }).project({ pageKey: 1 }).toArray()).map(
          (p) => p.pageKey,
        ),
      );
      finalPageKey = uniquifyPageKey(generatePageKey(title.trim(), parent?.pageKey), used);
    }
    const doc = {
      worldId,
      pageKey: finalPageKey,
      parentId: parentId || null,
      templateId: templateId || 'default',
      title: title.trim(),
      blocks: blocks || [{ id: 'b1', type: 'prose', content: '' }],
      layout: layout || null,
      runes: runes || {},
      tags: tags || [],
      mirrorLinks: [],
      crossLinks: [],
      frame: null,
      order: order ?? 0,
      ownerWallet: owner,
      createdAt: now,
      updatedAt: now,
    };
    const result = await coll.insertOne(doc);
    res.status(201).json(toPage(await coll.findOne({ _id: result.insertedId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/reorder', async (req, res) => {
  try {
    const { worldId, updates } = req.body;
    if (!worldId || !Array.isArray(updates) || !updates.length) {
      return res.status(400).json({ error: 'worldId and updates[] required' });
    }
    const coll = await getLorePagesCollection();
    const now = new Date();
    for (const item of updates) {
      if (!item?.id || !ObjectId.isValid(item.id)) {
        return res.status(400).json({ error: 'Invalid page id in updates' });
      }
      const doc = await coll.findOne({ _id: new ObjectId(item.id), worldId });
      if (!doc) return res.status(404).json({ error: `Page not found: ${item.id}` });
      await coll.updateOne(
        { _id: doc._id },
        {
          $set: {
            parentId: item.parentId || null,
            order: item.order ?? 0,
            updatedAt: now,
          },
        },
      );
    }
    const items = await coll.find({ worldId }).sort({ order: 1, title: 1 }).toArray();
    res.json(items.map(toPage));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/revisions', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLorePagesCollection();
    const page = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!page) return res.status(404).json({ error: 'Not found' });
    const revisions = await listPageRevisions(req.params.id);
    res.json(revisions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/revisions/:revisionId/restore', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id) || !ObjectId.isValid(req.params.revisionId)) {
      return res.status(400).json({ error: 'Invalid id' });
    }
    const coll = await getLorePagesCollection();
    const { getLorePageRevisionsCollection } = require('../../lib/mongodb.cjs');
    const page = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!page) return res.status(404).json({ error: 'Not found' });
    const revColl = await getLorePageRevisionsCollection();
    const rev = await revColl.findOne({ _id: new ObjectId(req.params.revisionId), pageId: req.params.id });
    if (!rev) return res.status(404).json({ error: 'Revision not found' });

    await savePageRevision(page, { label: `Before restore` });

    const snap = rev.snapshot || {};
    const updates = {
      updatedAt: new Date(),
      title: snap.title ?? page.title,
      templateId: snap.templateId ?? page.templateId,
      blocks: snap.blocks ?? page.blocks,
      runes: snap.runes ?? page.runes,
      tags: snap.tags ?? page.tags,
      mirrorLinks: snap.mirrorLinks ?? page.mirrorLinks,
      crossLinks: snap.crossLinks ?? page.crossLinks,
      frame: snap.frame ?? page.frame,
    };
    await coll.updateOne({ _id: page._id }, { $set: updates });
    let updated = await coll.findOne({ _id: page._id });
    if (updated.mirrorLinks?.length) {
      await applyMirrorLinks(coll, updated);
      updated = await coll.findOne({ _id: page._id });
    }
    res.json(toPage(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/backlinks', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLorePagesCollection();
    const page = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!page) return res.status(404).json({ error: 'Not found' });
    const pageId = req.params.id;
    const incoming = await coll
      .find({
        worldId: page.worldId,
        $or: [{ 'crossLinks.pageId': pageId }, { 'mirrorLinks.targetPageId': pageId }],
      })
      .toArray();
    res.json({ pages: incoming.map(toPage) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/mirrors', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLorePagesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const graph = await listMirrorGraph(coll, doc.worldId, doc._id.toString());
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/apply-mirrors', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLorePagesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const { synced } = await applyMirrorLinks(coll, doc);
    res.json({ synced });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLorePagesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const world = await getWorldById(doc.worldId);
    if (!world || !canReadWorld(world, req)) return res.status(403).json({ error: 'Forbidden' });
    res.json(toPage(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLorePagesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!(await assertWorldWrite(doc.worldId, req, res))) return;
    const updates = { updatedAt: new Date() };
    for (const key of ['title', 'parentId', 'templateId', 'blocks', 'layout', 'runes', 'tags', 'mirrorLinks', 'crossLinks', 'frame', 'order']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const contentKeys = ['title', 'templateId', 'blocks', 'layout', 'runes', 'tags', 'mirrorLinks', 'crossLinks', 'frame'];
    const touchesContent = contentKeys.some((k) => req.body[k] !== undefined);
    const merged = { ...doc, ...updates };
    if (touchesContent && !req.body.skipRevision && revisionChanged(doc, merged)) {
      await savePageRevision(doc, { label: doc.title });
    }

    await coll.updateOne({ _id: doc._id }, { $set: updates });
    let updated = await coll.findOne({ _id: doc._id });
    let mirrorSync = { synced: [] };
    const shouldMirror =
      updated.mirrorLinks?.length &&
      (req.body.runes !== undefined || req.body.title !== undefined || req.body.blocks !== undefined);
    if (shouldMirror) {
      mirrorSync = await applyMirrorLinks(coll, updated);
      updated = await coll.findOne({ _id: doc._id });
    }
    res.json({ ...toPage(updated), mirrorSync });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/refactor-template', async (req, res) => {
  try {
    const { worldId, templateId, blockOrder, layout, blocks } = req.body;
    if (!worldId || !templateId) return res.status(400).json({ error: 'worldId and templateId required' });
    const coll = await getLorePagesCollection();
    const templateSpec = blocks?.length
      ? { layout: layout || null, blocks }
      : blockOrder || [];
    const count = await propagateTemplateChange(coll, worldId, templateId, templateSpec);
    res.json({ updated: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/refactor-template', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLorePagesCollection();
    const page = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!page) return res.status(404).json({ error: 'Not found' });
    const { templateId, blockOrder, layout, blocks } = req.body;
    const templateSpec = blocks?.length ? { layout: layout || null, blocks } : blockOrder;
    const count = await propagateTemplateChange(coll, page.worldId, templateId || page.templateId, templateSpec);
    res.json({ updated: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLorePagesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    if (!(await assertWorldWrite(doc.worldId, req, res))) return;
    await coll.deleteOne({ _id: doc._id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
