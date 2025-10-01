// src/lib/bookmarksStore.js
export function keyFor(uid) {
  return uid ? `omni.bookmarks.v1.u${uid}` : 'omni.bookmarks.v1.anon';
}

export function read(uid) {
  try { return JSON.parse(localStorage.getItem(keyFor(uid)) || '[]'); }
  catch { return []; }
}

export function write(uid, list) {
  localStorage.setItem(keyFor(uid), JSON.stringify(list));
}

export function isBookmarkKey(k) {
  return typeof k === 'string' && k.startsWith('omni.bookmarks.v1');
}

// client-only helper to fetch current user id
export async function getUid() {
  try {
    const res = await fetch('/api/auth/me', { cache: 'no-store' });
    const j = await res.json().catch(() => ({}));
    return j?.user?.id ?? null;   // { user: { id } }
  } catch { return null; }
}
