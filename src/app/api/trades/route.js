// src/app/api/trades/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";
import { getCashBalance } from "@/lib/server/portfolio";
import { validateRequestCsrf } from "@/utils/csrf";
import { auditLog, errorLog } from "@/utils/logger";

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
  const csrfFailure = validateRequestCsrf(request);
  if (csrfFailure) return csrfFailure;

  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json();
  let { symbol, side, qty, price, status = "FILLED" } = body || {};
  if (!symbol || !side || !qty || !price) {
    return NextResponse.json({ error: "symbol, side, qty, price required" }, { status: 400 });
  }

  symbol = String(symbol).toUpperCase();
  side = side === "SELL" ? "SELL" : "BUY";
  qty = Number(qty);
  price = Number(price);

  if (qty <= 0 || price <= 0) {
    return NextResponse.json({ error: "Quantity and price must be greater than 0" }, { status: 400 });
  }

  if (side === "BUY") {
    const { availableCash } = await getCashBalance(userId);
    const totalCost = qty * price;

    if (totalCost > availableCash) {
      return NextResponse.json(
        { error: `Insufficient funds. Available cash: ${availableCash.toFixed(2)} AUD` },
        { status: 400 }
      );
    }
  }


  if (side === "SELL") {
    const trades = await prisma.trade.findMany({ where: { userId, symbol } });
    let ownedShares = 0;
    for (const t of trades) {
      ownedShares += t.side === "BUY" ? t.qty : -t.qty;
    }
    if (qty > ownedShares) {
      return NextResponse.json(
        { error: `Not enough shares to sell. Owned: ${ownedShares}` },
        { status: 400 }
      );
    }
  }


  const trade = await prisma.trade.create({
    data: {
      userId: Number(userId),
      symbol,
      side,
      qty,
      price,
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
    errorLog("tradeBacklog.mirror.failed", e, { userId, tradeId: trade.id });
  }

  auditLog("trade.create", userId, {
    tradeId: trade.id,
    symbol,
    side,
    qty,
    price,
  });

  return NextResponse.json({ ok: true, trade }, { status: 200 });
}
