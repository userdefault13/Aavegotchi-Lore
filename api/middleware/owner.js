const { AUTH_STRICT, ZERO, isDevBypassWallet } = require('./auth');

function getOwnerWallet(req) {
  if (req.authWallet) return req.authWallet;
  if (AUTH_STRICT) return ZERO;

  const header = (req.headers['x-owner-wallet'] || '').trim().toLowerCase();
  if (header && /^0x[a-f0-9]{40}$/.test(header)) return header;
  const body = (req.body?.ownerWallet || '').trim().toLowerCase();
  if (body && /^0x[a-f0-9]{40}$/.test(body)) return body;
  return ZERO;
}

function requireAuth(req, res) {
  const owner = getOwnerWallet(req);
  if (owner === ZERO) {
    res.status(401).json({ error: 'Wallet authentication required' });
    return null;
  }
  return owner;
}

function requireOwner(doc, req, res) {
  const owner = getOwnerWallet(req);
  if (isDevBypassWallet(owner)) return true;
  if (doc.ownerWallet === owner) return true;
  if (Array.isArray(doc.maintainers) && doc.maintainers.includes(owner)) return true;
  res.status(403).json({ error: 'Forbidden' });
  return false;
}

function canReadWorld(doc, req) {
  const owner = getOwnerWallet(req);
  if (isDevBypassWallet(owner)) return true;
  if (doc.ownerWallet === owner) return true;
  if (Array.isArray(doc.maintainers) && doc.maintainers.includes(owner)) return true;
  if (doc.visibility === 'canonical' || doc.visibility === 'public') return true;
  return false;
}

function canWriteWorld(doc, req) {
  const owner = getOwnerWallet(req);
  if (isDevBypassWallet(owner)) return true;
  if (doc.ownerWallet === owner) return true;
  if (Array.isArray(doc.maintainers) && doc.maintainers.includes(owner)) return true;
  return false;
}

function isCanonical(doc) {
  return doc?.visibility === 'canonical';
}

function isCanonicalChronicle(doc) {
  return doc?.visibility === 'canonical';
}

function canReadChronicle(doc, req) {
  const owner = getOwnerWallet(req);
  if (isDevBypassWallet(owner)) return true;
  if (doc.ownerWallet === owner) return true;
  if (Array.isArray(doc.maintainers) && doc.maintainers.includes(owner)) return true;
  if (doc.visibility === 'canonical' || doc.visibility === 'public') return true;
  return false;
}

function canWriteChronicle(doc, req) {
  const owner = getOwnerWallet(req);
  if (isDevBypassWallet(owner)) return true;
  if (doc.ownerWallet === owner) return true;
  if (Array.isArray(doc.maintainers) && doc.maintainers.includes(owner)) return true;
  return false;
}

module.exports = {
  getOwnerWallet,
  requireAuth,
  requireOwner,
  canReadWorld,
  canWriteWorld,
  canReadChronicle,
  canWriteChronicle,
  isCanonical,
  isCanonicalChronicle,
  ZERO,
};
