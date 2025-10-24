import { NextResponse } from "next/server";
import { getLatestNews } from "@/lib/server/news";
import { errorLog } from "@/utils/logger";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? "general";
    const limit = Number(searchParams.get("limit") ?? 8);
    const symbolsParam = searchParams.get("symbols");
    const days = Number(searchParams.get("days") ?? 7);

    const symbols = symbolsParam
      ? symbolsParam
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s.length > 0)
      : undefined;

    const news = await getLatestNews({ category, limit, symbols, days });
    return NextResponse.json({ news });
  } catch (e) {
    // Bubble up the failure but preserve a log entry for production debugging.
    errorLog("news.route.failed", e);
    return NextResponse.json({ error: e.message || "news_failed" }, { status: 500 });
  }
}
