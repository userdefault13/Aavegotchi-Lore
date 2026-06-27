import { SiweMessage } from 'siwe';
import { getAddress } from 'ethers';

const apiBase = import.meta.env.VITE_API_BASE || '';
const TOKEN_KEY = 'gotchi-lore-token';

function authUrl(path) {
  return `${apiBase}/api/auth${path}`;
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function setAuthToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function signInWithWallet(address, signMessage) {
  const checksumAddress = getAddress((address || '').trim());
  const addrLower = checksumAddress.toLowerCase();
  const nonceRes = await fetch(authUrl(`/nonce?address=${encodeURIComponent(addrLower)}`));
  if (!nonceRes.ok) {
    const err = await nonceRes.json().catch(() => ({}));
    throw new Error(err.error || 'Could not fetch auth nonce');
  }
  const { nonce, domain, uri, statement } = await nonceRes.json();

  const message = new SiweMessage({
    domain: domain || window.location.hostname,
    address: checksumAddress,
    statement: statement || 'Sign in to gotchi-lore',
    uri: uri || window.location.origin,
    version: '1',
    chainId: 1,
    nonce,
  });

  const prepared = message.prepareMessage();
  const signature = await signMessage(prepared);

  const verifyRes = await fetch(authUrl('/verify'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: prepared, signature }),
  });
  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}));
    throw new Error(err.error || 'Sign-in failed');
  }
  const { token } = await verifyRes.json();
  setAuthToken(token);
  return token;
}
