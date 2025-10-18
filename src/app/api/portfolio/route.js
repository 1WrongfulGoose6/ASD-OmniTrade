// src/app/api/portfolio/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { requireUserId } from "@/utils/auth";
import logger from "@/utils/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userId = await requireUserId();

    // 1) holdings from trades
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      select: { symbol: true, side: true, qty: true, price: true },
    });

    const map = new Map();
    for (const t of trades) {
      const key = t.symbol.toUpperCase();
      const cur = map.get(key) || { symbol: key, shares: 0, costBasis: 0 };
      const signedQty = t.side === "BUY" ? t.qty : -t.qty;

      if (signedQty > 0) {
        const newShares = cur.shares + signedQty;
        const newCost =
          (cur.costBasis * cur.shares + t.price * signedQty) / (newShares || 1);
        cur.shares = newShares;
        cur.costBasis = newShares > 0 ? newCost : 0;
      } else {
        cur.shares = cur.shares + signedQty;
        if (cur.shares <= 0) { cur.shares = 0; cur.costBasis = 0; }
      }
      map.set(key, cur);
    }

    const positions = [...map.values()].filter(p => p.shares > 0);
    const rows = positions.map((p) => {
      const price = p.costBasis; 
      const value = price * p.shares;
      const profitLoss = (price - p.costBasis) * p.shares;
      return {
        symbol: p.symbol,
        price,
        change: 0,
        changePercent: 0,
        shares: Number(p.shares),
        avgCost: p.costBasis,
        value,
        profitLoss,
      };
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.totalValue += r.value;
        acc.totalProfitLoss += r.profitLoss;
        return acc;
      },
      { totalValue: 0, totalProfitLoss: 0 }
    );

    // 2) cash from deposits
    const agg = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { userId },
    });
    const cash = Number(agg._sum.amount || 0);

    return NextResponse.json(
      {
        holdings: rows,
        totals: {
          totalValue: totals.totalValue,
          totalProfitLoss: totals.totalProfitLoss,
          cashAud: cash, 
        },
        totalsWithCash: {
          totalValue: totals.totalValue + cash,
          totalProfitLoss: totals.totalProfitLoss,
        },
      },
      { status: 200 }
    );

  } catch (e) {
    logger.error({ err: e }, "[portfolio] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}