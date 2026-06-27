const express = require('express');
const { ObjectId } = require('mongodb');
const { getLoreDiagramsCollection } = require('../../lib/mongodb.cjs');
const { getOwnerWallet } = require('../middleware/owner');

const router = express.Router();

function toDiagram(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    worldId: doc.worldId,
    title: doc.title,
    nodes: doc.nodes || [],
    edges: doc.edges || [],
    viewport: doc.viewport || null,
    ownerWallet: doc.ownerWallet,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

router.get('/', async (req, res) => {
  try {
    const { worldId } = req.query;
    if (!worldId) return res.status(400).json({ error: 'worldId required' });
    const coll = await getLoreDiagramsCollection();
    const items = await coll.find({ worldId }).sort({ updatedAt: -1 }).toArray();
    res.json(items.map(toDiagram));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { worldId, title, nodes, edges, viewport } = req.body;
    if (!worldId) return res.status(400).json({ error: 'worldId required' });
    if (!title?.trim()) return res.status(400).json({ error: 'title required' });
    const coll = await getLoreDiagramsCollection();
    const now = new Date();
    const doc = {
      worldId,
      title: title.trim(),
      nodes: nodes || [],
      edges: edges || [],
      viewport: viewport || null,
      ownerWallet: getOwnerWallet(req),
      createdAt: now,
      updatedAt: now,
    };
    const result = await coll.insertOne(doc);
    res.status(201).json(toDiagram(await coll.findOne({ _id: result.insertedId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const { title, nodes, edges, viewport } = req.body;
    const coll = await getLoreDiagramsCollection();
    const patch = { updatedAt: new Date() };
    if (title != null) patch.title = String(title).trim();
    if (nodes != null) patch.nodes = nodes;
    if (edges != null) patch.edges = edges;
    if (viewport != null) patch.viewport = viewport;
    await coll.updateOne({ _id: new ObjectId(req.params.id) }, { $set: patch });
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'not found' });
    res.json(toDiagram(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getLoreDiagramsCollection();
    const result = await coll.deleteOne({ _id: new ObjectId(req.params.id) });
    if (!result.deletedCount) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
