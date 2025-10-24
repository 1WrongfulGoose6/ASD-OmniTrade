import { NextResponse } from "next/server";
import { getQuotes, POPULAR_SYMBOLS } from "@/lib/market/quotes";
import { errorLog } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  if (!process.env.FINNHUB_API_KEY) {
    return NextResponse.json({ error: "FINNHUB_API_KEY is missing" }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const requested = searchParams.get("symbols");
    const symbols = (requested ? requested.split(",") : POPULAR_SYMBOLS)
      .map((s) => (s || "").trim().toUpperCase())
      .filter(Boolean);

    const rows = await getQuotes(symbols);

    return NextResponse.json(rows, { status: 200 });
  } catch (e) {
    errorLog("marketdata.fetch.failed", e);
    return NextResponse.json({ error: "failed_to_fetch_quotes" }, { status: 500 });
  }
}
