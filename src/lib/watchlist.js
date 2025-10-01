// src/lib/watchlist.js
'use client';

// Single source of truth for the watchlist storage format.
const KEY = 'omni.watchlist.v1'; // array of { symbol, name? }

function readLocal() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function writeLocal(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event('watchlist:changed'));
}

export function readWatchlist() {
  // Prefer server copy, fall back to local
  // NOTE: callers in server components should not import this file.
  return readLocal();
}

export async function syncFromServer() {
  try {
    const res = await fetch('/api/watchlist', { cache: 'no-store' });
    if (!res.ok) throw new Error('watchlist GET failed');
    const rows = await res.json(); // [{id,symbol,createdAt}]
    const mapped = rows.map(r => ({ symbol: r.symbol, name: r.symbol }));
    writeLocal(mapped);
    return mapped;
  } catch {
    return readLocal();
  }
}

export function isWatched(symbol) {
  return readLocal().some((w) => (w.symbol || '').toUpperCase() === (symbol || '').toUpperCase());
}

export async function addToWatchlist(symbol, name) {
  // optimistic local update
  const cur = readLocal();
  if (!cur.some(w => w.symbol.toUpperCase() === symbol.toUpperCase())) {
    writeLocal([{ symbol, name }, ...cur].slice(0, 200));
  }
  // persist to server (best-effort)
  try {
    await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ symbol, name }),
    });
  } catch {}
  return readLocal();
}

export async function removeFromWatchlist(symbol) {
  // optimistic local update
  const next = readLocal().filter(w => w.symbol.toUpperCase() !== symbol.toUpperCase());
  writeLocal(next);
  // persist to server
  try {
    const u = new URL('/api/watchlist', window.location.origin);
    u.searchParams.set('symbol', symbol);
    await fetch(u.toString(), { method: 'DELETE' });
  } catch {}
  return readLocal();
}
