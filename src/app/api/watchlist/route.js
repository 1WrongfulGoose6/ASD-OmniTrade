import { NextResponse } from "next/server";
import { getUserIdFromCookies } from "@/utils/auth";
import { getWatchlistWithQuotes } from "@/lib/server/watchlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/watchlist  -> current user's watchlist + lightweight quotes
export async function GET() {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const items = await getWatchlistWithQuotes(userId);

  return NextResponse.json({ items });
}
