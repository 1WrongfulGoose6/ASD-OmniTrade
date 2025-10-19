// src/lib/csrfClient.js
const CSRF_ENDPOINT = "/api/auth/csrf";
const CSRF_HEADER = "x-csrf-token";

let cachedToken = null;
let inflight = null;

async function requestCsrfToken() {
  const res = await fetch(CSRF_ENDPOINT, {
    method: "GET",
    headers: { accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to obtain CSRF token");
  }

  const data = await res.json();
  const token = data?.csrfToken;
  if (typeof token !== "string" || token.length === 0) {
    throw new Error("Invalid CSRF token response");
  }

  cachedToken = token;
  return token;
}

export async function getCsrfToken({ forceRefresh = false } = {}) {
  if (!forceRefresh && typeof cachedToken === "string") {
    return cachedToken;
  }

  if (!inflight) {
    inflight = requestCsrfToken().finally(() => {
      inflight = null;
    });
  }

  return inflight;
}

export async function csrfFetch(input, init = {}) {
  const token = await getCsrfToken();
  const headers = new Headers(init.headers || {});
  headers.set(CSRF_HEADER, token);

  return fetch(input, { ...init, headers });
}

export function setCachedCsrfToken(token) {
  if (typeof token === "string" && token.length > 0) {
    cachedToken = token;
  } else {
    cachedToken = null;
  }
}

export function invalidateCsrfToken() {
  cachedToken = null;
}
