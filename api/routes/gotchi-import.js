const express = require('express');
const { getLorePagesCollection } = require('../../lib/mongodb.cjs');

const router = express.Router();

router.get('/gotchi/:tokenId', async (req, res) => {
  const tokenId = req.params.tokenId;
  res.json({
    tokenId,
    name: `Aavegotchi #${tokenId}`,
    traits: { energy: 50, aggression: 50, spookiness: 50, brainSize: 50 },
    brs: 200,
    spiritForce: '100',
    imageUrl: `https://app.aavegotchi.com/images/aavegotchis/aavegotchi-${tokenId}.svg`,
    source: 'stub',
    note: 'Set VITE_ALCHEMY_API_KEY for on-chain import',
  });
});

router.get('/parcel/:tokenId', async (req, res) => {
  res.json({
    tokenId: req.params.tokenId,
    zone: 'Citaadel',
    size: 'Humble',
    threeWordName: 'haunted portal fren',
    source: 'stub',
  });
});

router.post('/templates/import', async (req, res) => {
  const { templates } = req.body;
  if (!Array.isArray(templates)) return res.status(400).json({ error: 'templates array required' });
  res.json({ imported: templates.length });
});

router.get('/templates/export/:worldId', async (req, res) => {
  res.json({ worldId: req.params.worldId, templates: [], exportedAt: new Date().toISOString() });
});

module.exports = router;
