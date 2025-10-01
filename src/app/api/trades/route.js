// src/app/api/trades/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Optional mirror to Supabase backlog (safe to keep as no-op)
async function mirrorToSupabase(payload) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE) return;
    await fetch(`${process.env.SUPABASE_URL}/rest/v1/Trade Backlog`, {
      method: "POST",
      headers: {
        apikey: process.env.SUPABASE_SERVICE_ROLE,
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });
  } catch { /* ignore */ }
}

export async function GET(request) {
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol")?.toUpperCase();
  const status = searchParams.get("status"); // e.g., PENDING | FILLED | CANCELLED
  const limit  = Math.min(Number(searchParams.get("limit") || 20), 100);

  const where = { userId };
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

  const trade = await prisma.trade.create({
    data: {
      userId,
      symbol: String(symbol).toUpperCase(),
      side: side === "SELL" ? "SELL" : "BUY",
      qty: Number(qty),
      price: Number(price),
      status,
    },
  });

  // best-effort mirror
  await mirrorToSupabase({
    user_id: userId,
    symbol: trade.symbol,
    side: trade.side,
    qty: trade.qty,
    price: trade.price,
    status: trade.status,
    created_at: trade.createdAt,
  });

  return NextResponse.json({ ok: true, trade }, { status: 200 });
}
