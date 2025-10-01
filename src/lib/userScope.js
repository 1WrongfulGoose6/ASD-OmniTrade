// src/lib/userScope.js
let cachedUserId = null;
let inFlight = null;

/** Fetch and cache the current user's id (or null if not signed in). */
export async function getUserId() {
  if (cachedUserId !== null) return cachedUserId;
  if (!inFlight) {
    inFlight = (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) throw new Error("auth");
        const j = await res.json();
        cachedUserId = Number.isFinite(j?.id) ? j.id : null;
      } catch {
        cachedUserId = null;
      }
      return cachedUserId;
    })();
  }
  await inFlight;
  return cachedUserId;
}

/** Returns a localStorage key namespaced to the current user. */
export async function userScopedKey(base) {
  const uid = await getUserId();
  return `${base}.u${uid ?? "guest"}`;
}

/** Safe read/write that always uses a user-scoped key. */
export async function readScopedArray(base) {
  const key = await userScopedKey(base);
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeScoped(base, value) {
  const key = await userScopedKey(base);
  localStorage.setItem(key, JSON.stringify(value));
}
