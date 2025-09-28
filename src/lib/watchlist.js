// src/lib/watchlist.js
'use client';

// Single source of truth for the watchlist storage format.
const KEY = 'omni.watchlist.v1'; // array of { symbol, name? }

export function readWatchlist() {
  if (typeof window === 'undefined') return [];
  try {
    const arr = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function writeWatchlist(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
  // Tell other tabs/components to refresh
  window.dispatchEvent(new Event('watchlist:changed'));
}

export function isWatched(symbol) {
  return readWatchlist().some((w) => w.symbol === symbol);
}

export function addToWatchlist(symbol, name) {
  const cur = readWatchlist();
  if (cur.some((w) => w.symbol === symbol)) return cur;
  const next = [{ symbol, name }, ...cur].slice(0, 200);
  writeWatchlist(next);
  return next;
}

export function removeFromWatchlist(symbol) {
  const next = readWatchlist().filter((w) => w.symbol !== symbol);
  writeWatchlist(next);
  return next;
}
