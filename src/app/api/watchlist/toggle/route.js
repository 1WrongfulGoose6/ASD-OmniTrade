// src/app/api/watchlist/toggle/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireUserId, verifyCsrf } from "@/utils/auth";
import logger from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/watchlist/toggle  body: { symbol, name? }
export async function POST(req) {
  try {
    await verifyCsrf(req.headers);
    const userId = await requireUserId();

    const body = await req.json().catch(() => ({}));
    const symbol = String(body?.symbol || "").toUpperCase().trim();
    if (!symbol) return NextResponse.json({ error: "symbol required" }, { status: 400 });

    // check if exists
    const existing = await prisma.watchlist.findFirst({
      where: { userId, symbol },
      select: { id: true },
    });

    if (existing) {
      await prisma.watchlist.delete({ where: { id: existing.id } });
      return NextResponse.json({ ok: true, action: "removed", symbol });
    } else {
      await prisma.watchlist.create({ data: { userId, symbol } });
      return NextResponse.json({ ok: true, action: "added", symbol });
    }
  } catch (e) {
    logger.error({ err: e }, "[watchlist/toggle] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
