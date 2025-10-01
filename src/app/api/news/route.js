// src/app/api/marketdata/route.js
import { NextResponse } from "next/server";
import { fetchJsonCached } from "@/lib/mcache";

const FINNHUB_API_URL = "https://finnhub.io/api/v1";
const API_KEY = process.env.FINNHUB_API_KEY;
const TTL = 60_000;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? "general";
    const limit = Number(searchParams.get("limit") ?? 8);

    const url = `${FINNHUB_API_URL}/news?category=${encodeURIComponent(category)}&token=${API_KEY}`;
    const r = await fetchJsonCached(url, { ttlMs: TTL });

    const items = Array.isArray(r.data) ? r.data.slice(0, limit) : [];
    const news = items.map((n, i) => ({
      id: n.id ?? `${n.source ?? "src"}-${n.datetime ?? i}`,
      headline: n.headline ?? n.title ?? "",
      summary: n.summary ?? "",
      url: n.url,
      image: n.image,
      source: n.source,
      datetime: n.datetime,
      category,
    }));

    return NextResponse.json({ news });
  } catch (e) {
    return NextResponse.json({ error: e.message || "news_failed" }, { status: 500 });
  }
}
