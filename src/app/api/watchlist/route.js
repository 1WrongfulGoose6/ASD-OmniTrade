// src/app/api/watchlist/route.js
import { NextResponse } from "next/server";
import { getUserIdFromCookies } from "@/utils/auth";
import { getWatchlistWithQuotes } from "@/lib/server/watchlist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/watchlist  -> current user's watchlist + lightweight quotes
export async function GET() {
  try {
    const userId = await requireUserId();

    const watchlist = await prisma.watchlist.findMany({
      where: { userId },
      select: { symbol: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ items: watchlist }, { status: 200 });
  } catch (e) {
    logger.error({ err: e }, "[watchlist GET] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  const items = await getWatchlistWithQuotes(userId);

  return NextResponse.json({ items });
}
