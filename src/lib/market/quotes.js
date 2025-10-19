import { fetchJsonCached } from "@/lib/mcache";

const FINNHUB_API_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;
const TTL = 15_000;

const DEFAULT_COMPANY_NAMES = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  AMZN: "Amazon.com, Inc.",
  GOOGL: "Alphabet Inc.",
  TSLA: "Tesla, Inc.",
  NVDA: "NVIDIA Corp.",
};

function toNum(value, fallback = null) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function withSign(n) {
  if (!Number.isFinite(n)) return "-";
  const sign = n >= 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

async function fetchQuote(symbol) {
  if (!API_KEY) return null;
  const url = `${FINNHUB_API_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`;
  const { data } = await fetchJsonCached(url, { ttlMs: TTL });
  return data;
}

export async function getQuotes(symbols = []) {
  if (!Array.isArray(symbols) || symbols.length === 0) return [];
  if (!API_KEY) {
    return symbols.map((symbol) => ({
      symbol,
      name: DEFAULT_COMPANY_NAMES[symbol] || symbol,
      price: null,
      changePercent: null,
      change: "-",
      changeAbs: null,
      high: null,
      low: null,
      stale: true,
      error: "FINNHUB_API_KEY is missing",
    }));
  }

  const uniqueSymbols = [...new Set(symbols.map((s) => String(s || "").toUpperCase()).filter(Boolean))];
  const results = await Promise.all(
    uniqueSymbols.map(async (symbol) => {
      try {
        const quote = await fetchQuote(symbol);
        const price = toNum(quote?.c, null);
        const changePct = toNum(quote?.dp, null);
        return {
          id: symbol,
          symbol,
          name: DEFAULT_COMPANY_NAMES[symbol] || symbol,
          price,
          changePercent: changePct,
          change: withSign(changePct ?? 0),
          changeAbs: toNum(quote?.d, null),
          high: toNum(quote?.h, null),
          low: toNum(quote?.l, null),
          previousClose: toNum(quote?.pc, null),
          stale: false,
        };
      } catch (error) {
        return {
          id: symbol,
          symbol,
          name: DEFAULT_COMPANY_NAMES[symbol] || symbol,
          price: null,
          changePercent: null,
          change: "-",
          changeAbs: null,
          high: null,
          low: null,
          stale: true,
          error: error?.message || "quote_fetch_failed",
        };
      }
    })
  );

  return results;
}

export const POPULAR_SYMBOLS = ["AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "NVDA"];
