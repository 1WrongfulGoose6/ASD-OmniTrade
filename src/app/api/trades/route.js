// src/app/api/trades/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  const status = searchParams.get("status");
  const limit  = Math.min(Number(searchParams.get("limit") || 20), 100);

  const where = { userId: Number(userId) };
  if (symbol) where.symbol = symbol;
  if (status) where.status = status;

  const trades = await prisma.trade.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({ trades });
}

export async function POST(request) {
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  const { symbol, side, qty, price, status = "FILLED" } = body || {};
  if (!symbol || !side || !qty || !price) {
    return NextResponse.json({ error: "symbol, side, qty, price required" }, { status: 400 });
  }

  // 1) Create the Trade
  const trade = await prisma.trade.create({
    data: {
      userId: Number(userId),
      symbol: String(symbol).toUpperCase(),
      side: side === "SELL" ? "SELL" : "BUY",
      qty: Number(qty),
      price: Number(price),
      status,
    },
  });

  // 2) Mirror to TradeBacklog (best-effort)
  try {
    await prisma.tradeBacklog.create({
      data: {
        userId: Number(userId),
        asset: trade.symbol,
        type: trade.side === "BUY" ? "Buy" : "Sell",
        amount: Number(trade.qty) * Number(trade.price),
        status: trade.status,
        date: trade.createdAt, // keep timeline consistent
      },
    });
  } catch (e) {
    console.warn("[tradeBacklog mirror] failed:", e?.message);
  }

  return NextResponse.json({ ok: true, trade }, { status: 200 });
}
