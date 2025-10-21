import { fetchJsonCached } from "@/lib/mcache";
import { POPULAR_SYMBOLS } from "@/lib/market/quotes";
import { getCompanyNews as fetchCompanyNews } from "@/lib/finnhub/news";
import { errorLog } from "@/utils/logger";

const FINNHUB_API_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;
const TTL = 60_000;
// Simple in-memory cache so company-news fan out does not hammer Finnhub.
const COMPANY_CACHE = new Map();

function normalizeNewsItem(item, fallbackId, overrides = {}) {
  return {
    id: item.id ?? fallbackId,
    headline: item.headline ?? item.title ?? "",
    summary: item.summary ?? "",
    url: item.url,
    image: item.image,
    source: item.source,
    datetime: item.datetime,
    ...overrides,
  };
}

async function fetchCompanyHeadlines({ symbols = POPULAR_SYMBOLS, limit = 24, days = 7 } = {}) {
  if (!API_KEY) return [];

  const uniqueSymbols = Array.isArray(symbols)
    ? [...new Set(symbols.map((s) => String(s || "").toUpperCase()).filter(Boolean))]
    : POPULAR_SYMBOLS;

  if (uniqueSymbols.length === 0) return [];

  const perSymbol = Math.max(2, Math.ceil(limit / uniqueSymbols.length));

  const results = await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      const cacheKey = `${symbol}:${days}`;
      const cached = COMPANY_CACHE.get(cacheKey);
      const isFresh = cached && Date.now() - cached.at < TTL;

      if (isFresh) {
        return cached.items.slice(0, perSymbol);
      }

      try {
        const entries = await fetchCompanyNews(symbol, { days, limit: perSymbol });
        const normalized = entries.map((item, idx) =>
          normalizeNewsItem(item, `${symbol}-${item.datetime ?? idx}`, {
            category: "company",
            symbol,
          })
        );
        COMPANY_CACHE.set(cacheKey, { at: Date.now(), items: normalized });
        return normalized;
      } catch (error) {
        errorLog("news.company.fetch_failed", error, { symbol });
        // Fall back to stale cache if we have anything, otherwise drop symbol.
        if (cached?.items) {
          return cached.items.slice(0, perSymbol);
        }
        return [];
      }
    })
  );

  const flattened = results.flat();
  const deduped = [];
  const seen = new Set();

  for (const item of flattened) {
    const key = item.url || `${item.headline}-${item.datetime}`;
    if (!item.headline || seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  deduped.sort((a, b) => Number(b.datetime || 0) - Number(a.datetime || 0));
  return deduped.slice(0, limit);
}

export async function getLatestNews({
  category = "general",
  limit = 8,
  symbols,
  days = 7,
} = {}) {
  if (!API_KEY) return [];

  if (category === "company" || category === "companies") {
    return fetchCompanyHeadlines({ symbols, limit, days });
  }

  const url = `${FINNHUB_API_URL}/news?category=${encodeURIComponent(category)}&token=${API_KEY}`;
  const { data } = await fetchJsonCached(url, { ttlMs: TTL });

  const items = Array.isArray(data) ? data.slice(0, limit) : [];
  return items.map((item, idx) =>
    normalizeNewsItem(item, `${item.source ?? "src"}-${item.datetime ?? idx}`, {
      category,
    })
  );
}
