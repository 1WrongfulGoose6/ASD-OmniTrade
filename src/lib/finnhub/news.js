// lib/finnhub/news.js
const BASE = "https://finnhub.io/api/v1";

function authHeaders() {
  const key = process.env.FINNHUB_API_KEY; // server-side env var
  if (!key) throw new Error("FINNHUB_API_KEY is missing");
  return { "X-Finnhub-Token": key };
}

export async function getMarketNews(category="general", { limit=8, fetchFn=fetch } = {}) {
  const url = `${BASE}/news?category=${encodeURIComponent(category)}&minId=0`;
  const res = await fetchFn(url, { headers: authHeaders() }, { label: "finnhub:news" });
  if (!res.ok) throw new Error(`Finnhub /news failed with ${res.status}`);
  const all = await res.json();
  return all.slice(0, limit);
}

// Company-specific news (North American companies; requires from/to)
export async function getCompanyNews(symbol, { days = 7, limit = 12, fetchFn = fetch } = {}) {
  if (!symbol) throw new Error("symbol is required");

  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error("FINNHUB_API_KEY is missing");

  // Finnhub /company-news requires YYYY-MM-DD dates
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - days);

  const fmt = (d) => d.toISOString().slice(0, 10);
  const url = `${BASE}/company-news?symbol=${encodeURIComponent(symbol)}&from=${fmt(from)}&to=${fmt(to)}&token=${token}`;

  const res = await fetchFn(url, {}, { label: "finnhub:company-news" });
  if (!res.ok) throw new Error(`Finnhub /company-news failed with ${res.status}`);

  const all = await res.json();
  // Normalize and cap
  return (all ?? []).slice(0, limit);
}