// src/app/api/alerts/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireUserId, verifyCsrf } from "@/utils/auth";
import logger from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/alerts?symbol=MSFT   -> list current user's alerts (optionally filter by symbol)
export async function GET(request) {
  try {
    const userId = await requireUserId();

    const { searchParams } = new URL(request.url);
    const symbol = (searchParams.get("symbol") || "").toUpperCase();

    const rows = await prisma.alert.findMany({
      where: { userId, ...(symbol ? { symbol } : {}) },
      orderBy: { createdAt: "desc" },
      select: { id: true, symbol: true, operator: true, threshold: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ alerts: rows }, { status: 200 });
  } catch (e) {
    logger.error({ err: e }, "[alerts GET] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// POST /api/alerts
// body: { symbol, operator, threshold }
export async function POST(request) {
  try {
    await verifyCsrf(request.headers);
    const userId = await requireUserId();

    let body;
    try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

    const symbol = String(body?.symbol || "").toUpperCase().trim();
    const operator = String(body?.operator || "").trim();   // ">" "<" ">=" "<=" "=="
    const threshold = Number(body?.threshold);

    const allowed = new Set([">", "<", ">=", "<=", "=="]);
    if (!symbol) return NextResponse.json({ error: "symbol_required" }, { status: 400 });
    if (!allowed.has(operator)) return NextResponse.json({ error: "operator_invalid" }, { status: 400 });
    if (!Number.isFinite(threshold)) return NextResponse.json({ error: "threshold_invalid" }, { status: 400 });

    const row = await prisma.alert.create({
      data: { userId, symbol, operator, threshold, isActive: true },
      select: { id: true, symbol: true, operator: true, threshold: true, isActive: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, alert: row }, { status: 201 });
  } catch (e) {
    logger.error({ err: e }, "[alerts POST] error");
    if (e.message.includes("csrf") || e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}