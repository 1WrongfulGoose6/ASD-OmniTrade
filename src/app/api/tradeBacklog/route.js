// src/app/api/tradeBacklog/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";
import { errorLog } from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await getUserIdFromCookies();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const userIdNum = Number(userId);
    if (!Number.isInteger(userIdNum)) {
      return NextResponse.json({ error: "invalid_user" }, { status: 400 });
    }

    const MAX_ROWS = 500;
    const tradeBacklogs = await prisma.tradeBacklog.findMany({
      where: { userId: userIdNum },
      orderBy: { date: "desc" },
      take: MAX_ROWS,
    });

    return NextResponse.json(tradeBacklogs, { status: 200 });
  } catch (e) {
    errorLog("tradeBacklog.fetch.failed", e);
    // Helpful error for missing table in dev:
    // P2021: "The table `main.TradeBacklog` does not exist..."
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
