// lib/http/fetchWithBackoff.js
export async function fetchWithBackoff(url, opts = {}, { label = "fetch" } = {}) {
  const res = await fetch(url, opts);

  // Happy path: not rate-limited
  if (res.status !== 429) {
    console.info(`[${label}] OK ${res.status} — under rate limit`);
    return res;
  }

  // Rate-limited case
  const retryAfter = Number(res.headers.get("retry-after") || 1);
  console.warn(
    `[${label}] RATE-LIMITED (429). Waiting ${retryAfter}s then retrying once…`
  );

  await new Promise(r => setTimeout(r, retryAfter * 1000));
  const retryRes = await fetch(url, opts);

  if (retryRes.status === 429) {
    console.error(`[${label}] Still rate-limited after retry.`);
  } else {
    console.info(`[${label}] Retry succeeded with status ${retryRes.status}.`);
  }
  return retryRes;
}