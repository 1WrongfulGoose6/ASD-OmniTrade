// src/app/api/tradeBacklog/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireUserId } from "@/utils/auth";
import logger from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUserId();

    const tradeBacklogs = await prisma.tradeBacklog.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(tradeBacklogs, { status: 200 });
  } catch (e) {
    logger.error({ err: e }, "[tradeBacklog GET] error");

    if (e.message === "unauthorized") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Helpful error for missing table in dev:
    // P2021: "The table `main.TradeBacklog` does not exist..."
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
