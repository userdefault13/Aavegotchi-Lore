const express = require('express');
const crypto = require('crypto');
const { SiweMessage } = require('siwe');
const { signSession } = require('../middleware/auth');

const router = express.Router();
const nonces = new Map();

function purgeNonces() {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, entry] of nonces.entries()) {
    if (entry.createdAt < cutoff) nonces.delete(key);
  }
}

router.get('/nonce', (req, res) => {
  purgeNonces();
  const address = (req.query.address || '').trim().toLowerCase();
  if (!/^0x[a-f0-9]{40}$/.test(address)) {
    return res.status(400).json({ error: 'Valid address query param required' });
  }
  const nonce = crypto.randomBytes(16).toString('hex');
  nonces.set(address, { nonce, createdAt: Date.now() });
  const domain = process.env.SIWE_DOMAIN || 'localhost';
  const uri = process.env.SIWE_URI || 'http://localhost:5174';
  res.json({ nonce, domain, uri, statement: 'Sign in to gotchi-lore' });
});

router.post('/verify', async (req, res) => {
  try {
    const { message, signature } = req.body || {};
    if (!message || !signature) return res.status(400).json({ error: 'message and signature required' });

    const siwe = new SiweMessage(message);
    const address = siwe.address?.toLowerCase();
    if (!address) return res.status(400).json({ error: 'Invalid message' });

    const stored = nonces.get(address);
    if (!stored || stored.nonce !== siwe.nonce) {
      return res.status(401).json({ error: 'Invalid or expired nonce' });
    }

    const domain = process.env.SIWE_DOMAIN || 'localhost';
    await siwe.verify({ signature, domain });

    nonces.delete(address);
    const token = signSession(address);
    res.json({ token, address });
  } catch (err) {
    res.status(401).json({ error: err.message || 'Verification failed' });
  }
});

module.exports = router;
