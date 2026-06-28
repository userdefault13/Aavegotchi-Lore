const express = require('express');
const { ObjectId } = require('mongodb');
const { getRealmMapsCollection } = require('../lib/mongodb.cjs');
const { getOwnerWallet } = require('../middleware/owner');

const router = express.Router();

function toMap(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    worldId: doc.worldId,
    chronicleId: doc.chronicleId || null,
    title: doc.title,
    mapPreset: doc.mapPreset || 'custom',
    imageUrl: doc.imageUrl || '',
    mapWidth: doc.mapWidth ?? null,
    mapHeight: doc.mapHeight ?? null,
    pins: doc.pins || [],
    paths: doc.paths || [],
    situationalLayers: doc.situationalLayers || {},
    ownerWallet: doc.ownerWallet,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

router.get('/', async (req, res) => {
  try {
    const { worldId, chronicleId } = req.query;
    const filter = {};
    if (worldId) filter.worldId = worldId;
    if (chronicleId) filter.chronicleId = chronicleId;
    const coll = await getRealmMapsCollection();
    const items = await coll.find(filter).toArray();
    res.json(items.map(toMap));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const {
      worldId,
      chronicleId,
      title,
      mapPreset,
      imageUrl,
      mapWidth,
      mapHeight,
      pins,
      paths,
      situationalLayers,
    } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'title required' });
    const coll = await getRealmMapsCollection();
    const now = new Date();
    const doc = {
      worldId: worldId || null,
      chronicleId: chronicleId || null,
      title: title.trim(),
      mapPreset: mapPreset || 'custom',
      imageUrl: imageUrl || '',
      mapWidth: mapWidth ?? null,
      mapHeight: mapHeight ?? null,
      pins: pins || [],
      paths: paths || [],
      situationalLayers: situationalLayers || {},
      ownerWallet: getOwnerWallet(req),
      createdAt: now,
      updatedAt: now,
    };
    const result = await coll.insertOne(doc);
    res.status(201).json(toMap(await coll.findOne({ _id: result.insertedId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getRealmMapsCollection();
    const updates = { updatedAt: new Date() };
    for (const key of ['title', 'mapPreset', 'imageUrl', 'mapWidth', 'mapHeight', 'pins', 'paths', 'situationalLayers']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await coll.updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates });
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(toMap(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getRealmMapsCollection();
    await coll.deleteOne({ _id: new ObjectId(req.params.id) });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
