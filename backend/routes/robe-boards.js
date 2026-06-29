const express = require('express');
const { ObjectId } = require('mongodb');
const {
  getRobeBoardsCollection,
  getRobeFramesCollection,
  getTomeChroniclesCollection,
  getStoryNodesCollection,
  getLorePagesCollection,
} = require('../lib/mongodb.cjs');
const { getOwnerWallet, canReadChronicle, canWriteChronicle } = require('../middleware/owner');
const { getOrCreateBoardForChronicle, syncBoardFrames, frameHasImageLayers } = require('../services/robeSync.cjs');
const { buildStoryboardFramePrompt } = require('../services/robePrompts.cjs');

const router = express.Router();

const AIBOT_URL = (process.env.AIBOT_URL || process.env.VITE_AIBOT_URL || 'https://aarcade-aibot.pages.dev').replace(/\/$/, '');
const fs = require('fs');
const path = require('path');
const uploadDir = process.env.VERCEL
  ? path.join('/tmp', 'gotchi-lore-uploads')
  : path.join(__dirname, '..', '..', 'public', 'uploads');

function saveDataUrl(dataUrl) {
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch {
    /* ignore */
  }
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!m) return null;
  const ext = m[1].includes('png') ? 'png' : m[1].includes('jpeg') || m[1].includes('jpg') ? 'jpg' : 'webp';
  const filename = `robe-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(m[2], 'base64'));
  return `/uploads/${filename}`;
}

async function loadChronicle(chronicleId) {
  const coll = await getTomeChroniclesCollection();
  return coll.findOne({ _id: new ObjectId(chronicleId) });
}

async function canAccessBoard(board, req, write = false) {
  const chronicle = await loadChronicle(board.chronicleId);
  if (!chronicle) return null;
  if (write) return canWriteChronicle(chronicle, req) ? chronicle : false;
  return canReadChronicle(chronicle, req) ? chronicle : false;
}

function toBoard(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    chronicleId: doc.chronicleId,
    linkedWorldId: doc.linkedWorldId || null,
    title: doc.title,
    slug: doc.slug,
    defaultTransition: doc.defaultTransition || { type: 'fade', durationMs: 600 },
    forkOfBoardId: doc.forkOfBoardId || null,
    upstreamBoardId: doc.upstreamBoardId || null,
    upstreamChronicleId: doc.upstreamChronicleId || null,
    visibility: doc.visibility,
    ownerWallet: doc.ownerWallet,
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

function toFrame(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    boardId: doc.boardId,
    storyNodeId: doc.storyNodeId,
    sceneTitle: doc.sceneTitle,
    order: doc.order ?? 0,
    preset: doc.preset || null,
    layers: doc.layers || [],
    holdDurationMs: doc.holdDurationMs ?? null,
    transition: doc.transition || null,
    composedUrl: doc.composedUrl || null,
    aiGenerated: doc.aiGenerated || null,
    audioTrack: doc.audioTrack || null,
    updatedAt: doc.updatedAt?.toISOString?.(),
  };
}

async function loreTitlesForNode(node, worldId) {
  if (!worldId || !node?.crossLinks?.length) return [];
  const pages = await getLorePagesCollection();
  const titles = [];
  for (const link of node.crossLinks) {
    if (!link.pageId) continue;
    try {
      const page = await pages.findOne({ _id: new ObjectId(link.pageId), worldId: worldId.toString() });
      if (page?.title) titles.push(page.title);
    } catch {
      /* skip invalid id */
    }
  }
  return titles;
}

async function generateImageForPrompt(query, wallet) {
  const r = await fetch(`${AIBOT_URL}/api/worker-ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, useInternet: false, wallet: wallet || undefined }),
  });
  const payload = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(payload.error || payload.reply || 'AIBot request failed');
  const reply = payload.reply || '';
  const dataMatch = reply.match(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/);
  if (dataMatch) {
    const saved = saveDataUrl(dataMatch[0]);
    return { reply, imageUrl: saved || dataMatch[0] };
  }
  const httpMatch = reply.match(/https?:\/\/[^\s)"']+\.(?:png|jpg|jpeg|webp|gif)/i);
  if (httpMatch) return { reply, imageUrl: httpMatch[0] };
  return { reply, imageUrl: null };
}

router.get('/', async (req, res) => {
  try {
    const { chronicleId } = req.query;
    if (chronicleId) {
      const chronicle = await loadChronicle(chronicleId);
      if (!chronicle) return res.status(404).json({ error: 'Chronicle not found' });
      if (!canReadChronicle(chronicle, req)) return res.status(403).json({ error: 'Forbidden' });
      const owner = getOwnerWallet(req);
      const board = await getOrCreateBoardForChronicle(chronicleId, owner);
      return res.json(toBoard(board));
    }
    const boards = await getRobeBoardsCollection();
    const items = await boards.find({}).sort({ updatedAt: -1 }).limit(100).toArray();
    const visible = [];
    for (const b of items) {
      const access = await canAccessBoard(b, req);
      if (access) visible.push(toBoard(b));
    }
    res.json(visible);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/frames', async (req, res) => {
  try {
    const boards = await getRobeBoardsCollection();
    const board = await boards.findOne({ _id: new ObjectId(req.params.id) });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const access = await canAccessBoard(board, req);
    if (!access) return res.status(403).json({ error: 'Forbidden' });
    const framesColl = await getRobeFramesCollection();
    const frames = await framesColl.find({ boardId: board._id.toString() }).sort({ order: 1 }).toArray();
    res.json(frames.map(toFrame));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const boards = await getRobeBoardsCollection();
    const board = await boards.findOne({ _id: new ObjectId(req.params.id) });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const access = await canAccessBoard(board, req, true);
    if (!access) return res.status(403).json({ error: 'Forbidden' });
    const patch = {};
    if (req.body.defaultTransition) patch.defaultTransition = req.body.defaultTransition;
    if (req.body.title) patch.title = req.body.title;
    patch.updatedAt = new Date();
    await boards.updateOne({ _id: board._id }, { $set: patch });
    const updated = await boards.findOne({ _id: board._id });
    res.json(toBoard(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/frames/:frameId', async (req, res) => {
  try {
    const boards = await getRobeBoardsCollection();
    const board = await boards.findOne({ _id: new ObjectId(req.params.id) });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const access = await canAccessBoard(board, req, true);
    if (!access) return res.status(403).json({ error: 'Forbidden' });

    const framesColl = await getRobeFramesCollection();
    const frame = await framesColl.findOne({
      _id: new ObjectId(req.params.frameId),
      boardId: board._id.toString(),
    });
    if (!frame) return res.status(404).json({ error: 'Frame not found' });

    const allowed = ['layers', 'preset', 'holdDurationMs', 'transition', 'composedUrl', 'aiGenerated'];
    const patch = { updatedAt: new Date() };
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    await framesColl.updateOne({ _id: frame._id }, { $set: patch });
    const updated = await framesColl.findOne({ _id: frame._id });
    res.json(toFrame(updated));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/sync', async (req, res) => {
  try {
    const boards = await getRobeBoardsCollection();
    const board = await boards.findOne({ _id: new ObjectId(req.params.id) });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const access = await canAccessBoard(board, req, true);
    if (!access) return res.status(403).json({ error: 'Forbidden' });
    const stats = await syncBoardFrames(board._id.toString());
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/generate-missing', async (req, res) => {
  try {
    const boards = await getRobeBoardsCollection();
    const board = await boards.findOne({ _id: new ObjectId(req.params.id) });
    if (!board) return res.status(404).json({ error: 'Board not found' });
    const access = await canAccessBoard(board, req, true);
    if (!access) return res.status(403).json({ error: 'Forbidden' });

    const framesColl = await getRobeFramesCollection();
    const nodesColl = await getStoryNodesCollection();
    const frames = await framesColl.find({ boardId: board._id.toString() }).sort({ order: 1 }).toArray();
    const wallet = getOwnerWallet(req);
    const maxBatch = Math.min(Number(req.body.limit) || 5, 10);
    const results = [];

    for (const frame of frames) {
      if (results.length >= maxBatch) break;
      if (frameHasImageLayers(frame)) continue;

      const node = await nodesColl.findOne({ _id: new ObjectId(frame.storyNodeId) });
      const loreTitles = node ? await loreTitlesForNode(node, board.linkedWorldId) : [];
      const prompt = buildStoryboardFramePrompt({
        sceneTitle: frame.sceneTitle || node?.title,
        sceneContent: node?.content,
        loreTitles,
      });

      try {
        const gen = await generateImageForPrompt(prompt, wallet);
        const layers = [...(frame.layers || [])];
        if (gen.imageUrl) {
          layers.unshift({
            id: `bg-${Date.now()}`,
            kind: 'image',
            assetUrl: gen.imageUrl,
            x: 0,
            y: 0,
            w: 1280,
            h: 720,
            z: 0,
            opacity: 1,
          });
        }
        await framesColl.updateOne(
          { _id: frame._id },
          {
            $set: {
              layers,
              aiGenerated: { prompt, generatedAt: new Date() },
              updatedAt: new Date(),
            },
          },
        );
        results.push({ frameId: frame._id.toString(), ok: !!gen.imageUrl, prompt });
      } catch (err) {
        results.push({ frameId: frame._id.toString(), ok: false, error: err.message });
      }
    }

    res.json({ generated: results.filter((r) => r.ok).length, results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
