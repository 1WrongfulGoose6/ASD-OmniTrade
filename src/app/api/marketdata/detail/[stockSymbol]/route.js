// src/app/api/marketdata/detail/[stockSymbol]/route.js
import { NextResponse } from "next/server";
import { errorLog } from "@/utils/logger";

const FINNHUB_API_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;

// --- simple module-scope cache ---
const CACHE_TTL_MS = 15_000;              // 15s is plenty for UIs
const cache = new Map();                  // symbol -> { at, payload }
const last = (sym) => cache.get(sym.toUpperCase());
const put  = (sym, payload) =>
  cache.set(sym.toUpperCase(), { at: Date.now(), payload });
const fresh = (rec) => rec && Date.now() - rec.at < CACHE_TTL_MS;

const rand = (min, max) => Math.random() * (max - min) + min;

export async function GET(_req, { params }) {
  try {
    if (!API_KEY) {
      return NextResponse.json({ error: "API key not found" }, { status: 500 });
    }

    const { stockSymbol } = await params;
    if (!stockSymbol) {
      return NextResponse.json({ error: "Stock symbol parameter is missing" }, { status: 400 });
    }
    const sym = stockSymbol.toUpperCase();

    // Serve fresh cache (avoid duplicate hits during dev StrictMode + fast refresh)
    const cached = last(sym);
    if (fresh(cached)) {
      return NextResponse.json(cached.payload, { status: 200 });
    }

    // 1) Quote
    const quoteRes = await fetch(
      `${FINNHUB_API_URL}/quote?symbol=${encodeURIComponent(sym)}&token=${API_KEY}`,
      { cache: "no-store" }
    );

    // Handle 429 by falling back to cache if we have *any* recent-ish data
    if (quoteRes.status === 429) {
      if (cached?.payload) {
        return NextResponse.json(
          { ...cached.payload, _stale: true, _note: "served from cache due to rate-limit" },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Upstream rate-limited (Finnhub 429). Try again shortly." },
        { status: 503 }
      );
    }

    if (!quoteRes.ok) {
      // If other upstream error and we have cached data, serve it.
      if (cached?.payload) {
        return NextResponse.json(
          { ...cached.payload, _stale: true, _note: `served from cache (upstream ${quoteRes.status})` },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: `Quote fetch failed (${quoteRes.status})` },
        { status: 502 }
      );
    }

    const quoteData = await quoteRes.json();
    const currentPriceNum = Number(quoteData?.c);
    if (!Number.isFinite(currentPriceNum) || currentPriceNum <= 0) {
      // fallback to cache if we can
      if (cached?.payload) {
        return NextResponse.json(
          { ...cached.payload, _stale: true, _note: "served from cache (invalid price)" },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { error: "Stock not found or data not available" },
        { status: 404 }
      );
    }

    // 2) Profile (best-effort)
    let name = sym;
    let weburl = null;
    try {
      const profileRes = await fetch(
        `${FINNHUB_API_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${API_KEY}`,
        { cache: "no-store" }
      );
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        name = profileData?.name || name;
        weburl = profileData?.weburl || null;
      }
    } catch { /* ignore */ }

    const description = weburl
      ? `Visit the company website for more details: ${weburl}`
      : "Description not available.";

    // 3) Lightweight mock series (24 pts + Now)
    const historicalData = [];
    let lastPrice = currentPriceNum * rand(0.98, 1.02);
    for (let i = 0; i < 24; i++) {
      const fluct = rand(-0.02, 0.02);
      lastPrice = Math.max(currentPriceNum * 0.9, lastPrice * (1 + fluct));
      const hour = (i + 10) % 24;
      historicalData.push({
        time: `${String(hour).padStart(2, "0")}:00`,
        price: Number(lastPrice.toFixed(2)),
      });
    }
    historicalData.push({ time: "Now", price: Number(currentPriceNum.toFixed(2)) });

    const payload = {
      symbol: sym,
      name,
      description,
      currentPrice: `$${currentPriceNum.toFixed(2)}`,
      currentPriceNum,
      historicalData,
    };

    put(sym, payload); // save to cache
    return NextResponse.json(payload, { status: 200 });
  } catch (error) {
    errorLog("marketdata.detail.failed", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}
