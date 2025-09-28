// app/api/news/route.js
import { NextResponse } from "next/server";
import { getMarketNews } from "@/lib/finnhub/news";
import { fetchWithBackoff } from "@/lib/http/fetchWithBackoff";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? "general";
    const limit = Number(searchParams.get("limit") ?? 8);

    // If getMarketNews uses fetch internally, inject the helper there.
    const items = await getMarketNews(category, { limit, fetchFn: fetchWithBackoff });

    const news = items.map(n => ({
      id: n.id ?? `${n.source}-${n.datetime}`,
      headline: n.headline,
      summary: n.summary,
      url: n.url,
      image: n.image,
      source: n.source,
      datetime: n.datetime,
      category,
    }));

    console.info(`[news] Delivered ${news.length} items (category=${category}).`);
    return NextResponse.json({ news });
  } catch (e) {
    console.error("[news] Failure:", e?.message);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
