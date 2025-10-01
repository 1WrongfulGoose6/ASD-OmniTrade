// src/app/api/marketdata/route.js
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Symbols and display names for your grid.
 * You can add more or even accept ?symbols=AAPL,MSFT via query param.
 */
const DEFAULT_SYMBOLS = ["AAPL", "MSFT", "AMZN", "GOOGL", "TSLA", "NVDA"];
const COMPANY_NAMES = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corp.",
  AMZN: "Amazon.com, Inc.",
  GOOGL: "Alphabet Inc.",
  TSLA: "Tesla, Inc.",
  NVDA: "NVIDIA Corp.",
};

function toNum(v, fallback = null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function withSign(n) {
  if (!Number.isFinite(n)) return "-";
  const s = n >= 0 ? "+" : "";
  return `${s}${n.toFixed(2)}%`;
}

async function fetchQuote(symbol, token) {
  try {
    const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(
      symbol
    )}&token=${token}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const j = await res.json(); // { c, d, dp, h, l, o, pc }
    return {
      price: toNum(j?.c, null),          // current
      changeAbs: toNum(j?.d, 0),         // absolute change
      changePct: toNum(j?.dp, 0),        // percent change
      high: toNum(j?.h, null),
      low: toNum(j?.l, null),
    };
  } catch {
    return null;
  }
}

export async function GET(request) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is missing" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const symParam = searchParams.get("symbols");
    const symbols = (symParam ? symParam.split(",") : DEFAULT_SYMBOLS)
      .map((s) => (s || "").trim().toUpperCase())
      .filter(Boolean);

    // Fetch quotes in parallel
    const results = await Promise.all(symbols.map((s) => fetchQuote(s, key)));

    // Build rows; if a symbol failed, we still return a row with placeholders
    const rows = symbols.map((symbol, i) => {
      const q = results[i] || {};
      const priceNum = toNum(q?.price, null);
      const changePctNum = toNum(q?.changePct, 0);

      return {
        id: symbol,                      // <-- add this so key={coin.id} is valid
        name: COMPANY_NAMES[symbol] || symbol,
        symbol,
        price: priceNum,                 // number (or null)
        changePercent: changePctNum,     // number
        change: withSign(changePctNum),  // e.g. "+0.75%"
        high: q?.high ?? null,
        low: q?.low ?? null,
        changeAbs: toNum(q?.changeAbs, 0),
      };
    });

    return NextResponse.json(rows, { status: 200 });
  } catch (e) {
    console.error("Error fetching data from Finnhub:", e);
    return NextResponse.json({ error: "failed_to_fetch_quotes" }, { status: 500 });
  }
}
