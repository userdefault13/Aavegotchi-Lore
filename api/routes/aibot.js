const express = require('express');
const fs = require('fs');
const path = require('path');
const { getOwnerWallet } = require('../middleware/owner');

const router = express.Router();

const AIBOT_URL = (process.env.AIBOT_URL || process.env.VITE_AIBOT_URL || 'https://aarcade-aibot.pages.dev').replace(/\/$/, '');
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads');

function extractDataUrl(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/);
  return match ? match[0] : null;
}

function extractHttpImageUrl(text) {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/https?:\/\/[^\s)"']+\.(?:png|jpg|jpeg|webp|gif)/i);
  return match ? match[0] : null;
}

function saveDataUrl(dataUrl) {
  fs.mkdirSync(uploadDir, { recursive: true });
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
  if (!m) return null;
  const ext = m[1].includes('png') ? 'png' : m[1].includes('jpeg') || m[1].includes('jpg') ? 'jpg' : 'webp';
  const filename = `aibot-${Date.now()}.${ext}`;
  fs.writeFileSync(path.join(uploadDir, filename), Buffer.from(m[2], 'base64'));
  return `/uploads/${filename}`;
}

router.get('/health', async (_req, res) => {
  try {
    const r = await fetch(`${AIBOT_URL}/api/health`);
    const data = await r.json().catch(() => ({}));
    res.json({ ok: r.ok, aibot: data, url: AIBOT_URL });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message, url: AIBOT_URL });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const query = String(req.body.query || '').trim();
    if (!query) return res.status(400).json({ error: 'query required' });

    const wallet = req.body.wallet || getOwnerWallet(req) || undefined;
    const images = Array.isArray(req.body.images) ? req.body.images : undefined;

    const r = await fetch(`${AIBOT_URL}/api/worker-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        useInternet: false,
        images,
        wallet: wallet || undefined,
      }),
    });

    const payload = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({ error: payload.error || payload.reply || 'AIBot request failed' });
    }

    const reply = payload.reply || '';
    let imageUrl = null;

    const dataUrl = extractDataUrl(reply);
    if (dataUrl) {
      imageUrl = saveDataUrl(dataUrl);
    } else {
      const remote = extractHttpImageUrl(reply);
      if (remote) imageUrl = remote;
    }

    res.json({
      reply,
      imageUrl,
      meta: payload.meta || {},
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
