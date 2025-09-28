// app/api/news/company/route.js
import { NextResponse } from "next/server";
import { getCompanyNews } from "@/lib/finnhub/news";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const days = Number(searchParams.get("days") ?? 7);
  const limit = Number(searchParams.get("limit") ?? 12);

  if (!symbol) {
    return NextResponse.json({ error: "symbol is required" }, { status: 400 });
  }

  try {
    const items = await getCompanyNews(symbol, { days, limit });

    const news = items.map((n, i) => ({
      id: n.id ?? `${symbol}-${n.datetime ?? i}`,
      headline: n.headline ?? n.title ?? "",
      summary: n.summary ?? "",
      url: n.url,
      image: n.image,
      source: n.source,
      datetime: n.datetime, // seconds since epoch from Finnhub
      symbol,
    }));

    return NextResponse.json({ news });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
