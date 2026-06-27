const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const ZERO = '0x0000000000000000000000000000000000000000';
const JWT_SECRET = (process.env.JWT_SECRET || 'dev-insecure-jwt-secret').trim();
const AUTH_STRICT = process.env.AUTH_STRICT === '1';

function parseBearer(req) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

function attachAuth(req, _res, next) {
  const token = parseBearer(req);
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET);
      if (payload?.address && /^0x[a-f0-9]{40}$/.test(payload.address)) {
        req.authWallet = payload.address.toLowerCase();
      }
    } catch {
      /* invalid token — fall through */
    }
  }
  next();
}

function signSession(address) {
  const addr = address.toLowerCase();
  return jwt.sign({ address: addr }, JWT_SECRET, { expiresIn: '7d' });
}

function isDevBypassWallet(wallet) {
  return !AUTH_STRICT && wallet === ZERO;
}

module.exports = {
  attachAuth,
  signSession,
  JWT_SECRET,
  AUTH_STRICT,
  ZERO,
  isDevBypassWallet,
};
