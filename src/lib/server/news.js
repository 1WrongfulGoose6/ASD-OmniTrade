import { fetchJsonCached } from "@/lib/mcache";

const FINNHUB_API_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;
const TTL = 60_000;

export async function getLatestNews({ category = "general", limit = 8 } = {}) {
  if (!API_KEY) return [];

  const url = `${FINNHUB_API_URL}/news?category=${encodeURIComponent(category)}&token=${API_KEY}`;
  const { data } = await fetchJsonCached(url, { ttlMs: TTL });

  const items = Array.isArray(data) ? data.slice(0, limit) : [];
  return items.map((item, idx) => ({
    id: item.id ?? `${item.source ?? "src"}-${item.datetime ?? idx}`,
    headline: item.headline ?? item.title ?? "",
    summary: item.summary ?? "",
    url: item.url,
    image: item.image,
    source: item.source,
    datetime: item.datetime,
    category,
  }));
}

