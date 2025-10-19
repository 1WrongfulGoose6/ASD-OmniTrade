// src/app/api/news/route.js
import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/server/news";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? "general";
    const limit = Number(searchParams.get("limit") ?? 8);

    const news = await getLatestNews({ category, limit });
    return NextResponse.json({ news });
  } catch (e) {
    return NextResponse.json({ error: e.message || "news_failed" }, { status: 500 });
  }
}
