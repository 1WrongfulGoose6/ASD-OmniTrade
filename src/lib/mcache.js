// src/lib/mcache.js

// super-simple in-memory cache (per Next.js server process)
// key -> { at:number, ttl:number, value:any }
const BOX = new Map();

export function getCache(key) {
  const hit = BOX.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > hit.ttl) { BOX.delete(key); return null; }
  return hit.value;
}

export function setCache(key, value, ttlMs) {
  BOX.set(key, { at: Date.now(), ttl: ttlMs, value });
  return value;
}

// Convenience: fetch JSON with caching + 429 fallback
export async function fetchJsonCached(url, { ttlMs = 15_000, init } = {}) {
  const key = `GET:${url}`;
  const fresh = getCache(key);
  if (fresh) return { data: fresh, fromCache: true, stale: false };

  const res = await fetch(url, { cache: "no-store", ...(init || {}) });

  // If rate limited and we have any cached value (even if expired), return it as stale.
  if (res.status === 429) {
    const old = BOX.get(key)?.value;
    if (old) return { data: old, fromCache: true, stale: true, rateLimited: true };
    throw new Error("429");
  }

  if (!res.ok) {
    // graceful fallback to stale cache on other upstream errors too
    const old = BOX.get(key)?.value;
    if (old) return { data: old, fromCache: true, stale: true, upstream: res.status };
    throw new Error(`upstream_${res.status}`);
  }

  const json = await res.json();
  setCache(key, json, ttlMs);
  return { data: json, fromCache: false, stale: false };
}
