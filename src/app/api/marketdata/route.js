// src/app/api/marketdata/route.js
import { NextResponse } from "next/server";
import { fetchJsonCached } from "@/lib/mcache";

const FINNHUB_API_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "NVDA"];
const COMPANY_NAMES = {
  AAPL: "Apple Inc.", MSFT: "Microsoft Corp.", AMZN: "Amazon.com, Inc.",
  GOOGL: "Alphabet Inc.", TSLA: "Tesla, Inc.", NVDA: "NVIDIA Corp.",
};

const TTL = 15_000;

function toNum(v, fb = null) { const n = Number(v); return Number.isFinite(n) ? n : fb; }
function withSign(n) { if (!Number.isFinite(n)) return "-"; const s = n >= 0 ? "+" : ""; return `${s}${n.toFixed(2)}%`; }

async function fetchQuoteCached(symbol) {
  const url = `${FINNHUB_API_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`;
  const r = await fetchJsonCached(url, { ttlMs: TTL });
  const j = r.data || {};
  return {
    price: toNum(j.c, null),
    changeAbs: toNum(j.d, 0),
    changePct: toNum(j.dp, 0),
    high: toNum(j.h, null),
    low: toNum(j.l, null),
  };
}

export async function GET(request) {
  if (!API_KEY) return NextResponse.json({ error: "FINNHUB_API_KEY is missing" }, { status: 500 });

  try {
    const { searchParams } = new URL(request.url);
    const symParam = searchParams.get("symbols");
    const symbols = (symParam ? symParam.split(",") : DEFAULT_SYMBOLS)
      .map((s) => (s || "").trim().toUpperCase()).filter(Boolean);

    const results = await Promise.all(symbols.map((s) => fetchQuoteCached(s)));

    const rows = symbols.map((symbol, i) => {
      const q = results[i] || {};
      const priceNum = toNum(q.price, null);
      const changePctNum = toNum(q.changePct, 0);
      return {
        id: symbol,
        name: COMPANY_NAMES[symbol] || symbol,
        symbol,
        price: priceNum,
        changePercent: changePctNum,
        change: withSign(changePctNum),
        high: q.high ?? null,
        low: q.low ?? null,
        changeAbs: toNum(q.changeAbs, 0),
      };
    });

    return NextResponse.json(rows, { status: 200 });
  } catch (e) {
    console.error("[marketdata] error", e);
    return NextResponse.json({ error: "failed_to_fetch_quotes" }, { status: 500 });
  }
}
