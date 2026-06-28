const express = require('express');
const { ObjectId } = require('mongodb');
const { getLoreInventoryCollection } = require('../lib/mongodb.cjs');
const { getOwnerWallet } = require('../middleware/owner');

const router = express.Router();

function toItem(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    worldId: doc.worldId,
    pageId: doc.pageId || null,
    kind: doc.kind || 'item',
    tokenId: doc.tokenId || '',
    label: doc.label || '',
    imageUrl: doc.imageUrl || '',
    meta: doc.meta || {},
    ownerWallet: doc.ownerWallet,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

router.get('/', async (req, res) => {
  try {
    const { worldId, kind, pageId } = req.query;
    if (!worldId) return res.status(400).json({ error: 'worldId required' });
    const filter = { worldId };
    if (kind) filter.kind = kind;
    if (pageId) filter.pageId = pageId;
    const coll = await getLoreInventoryCollection();
    const items = await coll.find(filter).sort({ updatedAt: -1 }).toArray();
    res.json(items.map(toItem));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { worldId, pageId, kind, tokenId, label, imageUrl, meta } = req.body;
    if (!worldId) return res.status(400).json({ error: 'worldId required' });
    const coll = await getLoreInventoryCollection();
    const now = new Date();
    const doc = {
      worldId,
      pageId: pageId || null,
      kind: kind || 'item',
      tokenId: tokenId ? String(tokenId) : '',
      label: label?.trim() || '',
      imageUrl: imageUrl || '',
      meta: meta || {},
      ownerWallet: getOwnerWallet(req),
      createdAt: now,
      updatedAt: now,
    };
    const result = await coll.insertOne(doc);
    res.status(201).json(toItem(await coll.findOne({ _id: result.insertedId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreInventoryCollection();
    const updates = { updatedAt: new Date() };
    for (const key of ['pageId', 'kind', 'tokenId', 'label', 'imageUrl', 'meta']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await coll.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(toItem(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreInventoryCollection();
    await coll.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
