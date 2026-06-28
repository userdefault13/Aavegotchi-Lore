const express = require('express');
const { ObjectId } = require('mongodb');
const { getStoryNodesCollection, getTomeChroniclesCollection } = require('../lib/mongodb.cjs');
const { getOwnerWallet, canReadChronicle, canWriteChronicle } = require('../middleware/owner');
const { generateNodeKey, uniquifyNodeKey } = require('../services/nodeKey.cjs');

const router = express.Router();

async function canAccessChronicle(chronicleId, req, write = false) {
  const coll = await getTomeChroniclesCollection();
  const doc = await coll.findOne({ _id: new ObjectId(chronicleId) });
  if (!doc) return null;
  if (write && !canWriteChronicle(doc, req)) return false;
  if (!write && !canReadChronicle(doc, req)) return false;
  return doc;
}

function toNode(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    chronicleId: doc.chronicleId,
    nodeKey: doc.nodeKey || null,
    parentId: doc.parentId || null,
    type: doc.type,
    title: doc.title,
    content: doc.content || '',
    status: doc.status || 'pending',
    choices: doc.choices || [],
    roles: doc.roles || [],
    memoSheets: doc.memoSheets || [],
    crossLinks: doc.crossLinks || [],
    situational: doc.situational || { visible: [], audible: [], discoverable: [] },
    branchIndex: doc.branchIndex ?? 0,
    order: doc.order ?? 0,
    frame: doc.frame || null,
    ownerWallet: doc.ownerWallet,
    createdAt: doc.createdAt?.toISOString?.(),
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

router.get('/', async (req, res) => {
  try {
    const { chronicleId } = req.query;
    if (!chronicleId) return res.status(400).json({ error: 'chronicleId is required' });
    const access = await canAccessChronicle(chronicleId, req);
    if (access === null) return res.status(404).json({ error: 'Chronicle not found' });
    if (access === false) return res.status(403).json({ error: 'Forbidden' });
    const coll = await getStoryNodesCollection();
    const items = await coll.find({ chronicleId }).sort({ order: 1, branchIndex: 1 }).toArray();
    res.json(items.map(toNode));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { chronicleId, parentId, type, title, content, order, branchIndex, nodeKey } = req.body;
    if (!chronicleId || !type || !title?.trim()) {
      return res.status(400).json({ error: 'chronicleId, type, and title required' });
    }
    const access = await canAccessChronicle(chronicleId, req, true);
    if (access === null) return res.status(404).json({ error: 'Chronicle not found' });
    if (access === false) return res.status(403).json({ error: 'Forbidden' });
    const coll = await getStoryNodesCollection();
    const now = new Date();
    let finalNodeKey = nodeKey || null;
    if (!finalNodeKey) {
      const siblings = await coll.find({ chronicleId }).project({ nodeKey: 1 }).toArray();
      const used = new Set(siblings.map((n) => n.nodeKey).filter(Boolean));
      let parentKey = null;
      if (parentId) {
        const parent = await coll.findOne({ _id: new ObjectId(parentId) });
        parentKey = parent?.nodeKey || null;
      }
      finalNodeKey = uniquifyNodeKey(generateNodeKey(title.trim(), parentKey), used);
    }
    const doc = {
      chronicleId,
      nodeKey: finalNodeKey,
      parentId: parentId || null,
      type,
      title: title.trim(),
      content: content || '',
      status: 'pending',
      choices: [],
      roles: [],
      memoSheets: [],
      crossLinks: [],
      situational: { visible: [], audible: [], discoverable: [] },
      branchIndex: branchIndex ?? 0,
      order: order ?? 0,
      frame: null,
      ownerWallet: getOwnerWallet(req),
      createdAt: now,
      updatedAt: now,
    };
    const result = await coll.insertOne(doc);
    res.status(201).json(toNode(await coll.findOne({ _id: result.insertedId })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getStoryNodesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const access = await canAccessChronicle(doc.chronicleId, req);
    if (access === null) return res.status(404).json({ error: 'Chronicle not found' });
    if (access === false) return res.status(403).json({ error: 'Forbidden' });
    res.json(toNode(doc));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getStoryNodesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const access = await canAccessChronicle(doc.chronicleId, req, true);
    if (access === null) return res.status(404).json({ error: 'Chronicle not found' });
    if (access === false) return res.status(403).json({ error: 'Forbidden' });
    const updates = { updatedAt: new Date() };
    for (const key of ['title', 'content', 'parentId', 'type', 'status', 'choices', 'roles', 'memoSheets', 'crossLinks', 'situational', 'order', 'branchIndex', 'frame', 'nodeKey']) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    await coll.updateOne({ _id: doc._id }, { $set: updates });
    res.json(toNode(await coll.findOne({ _id: doc._id })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ error: 'Invalid id' });
    const coll = await getStoryNodesCollection();
    const doc = await coll.findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    const access = await canAccessChronicle(doc.chronicleId, req, true);
    if (access === null) return res.status(404).json({ error: 'Chronicle not found' });
    if (access === false) return res.status(403).json({ error: 'Forbidden' });
    await coll.deleteOne({ _id: doc._id });
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
