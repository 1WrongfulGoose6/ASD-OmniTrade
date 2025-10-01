// src/app/api/marketdata/route.js
import { NextResponse } from "next/server";
import { fetchJsonCached } from "@/lib/mcache";

const FINNHUB_API_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;
const TTL = 60_000; // news can be cached a minute

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "").toUpperCase();
  const days = Number(searchParams.get("days") ?? 7);
  const limit = Number(searchParams.get("limit") ?? 12);

  if (!symbol) return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  if (!API_KEY) return NextResponse.json({ error: "api_key" }, { status: 500 });

  // Basic date window
  const to = new Date();
  const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const url = `${FINNHUB_API_URL}/company-news?symbol=${encodeURIComponent(symbol)}&from=${iso(from)}&to=${iso(to)}&token=${API_KEY}`;
  try {
    const r = await fetchJsonCached(url, { ttlMs: TTL });
    const items = Array.isArray(r.data) ? r.data.slice(0, limit) : [];

    const news = items.map((n, i) => ({
      id: n.id ?? `${symbol}-${n.datetime ?? i}`,
      headline: n.headline ?? n.title ?? "",
      summary: n.summary ?? "",
      url: n.url,
      image: n.image,
      source: n.source,
      datetime: n.datetime,
      symbol,
    }));

    return NextResponse.json({ news });
  } catch (e) {
    return NextResponse.json({ error: e.message || "news_failed" }, { status: 500 });
  }
}
