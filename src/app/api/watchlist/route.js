// src/app/api/watchlist/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const rows = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { symbol: true },
  });

  const symbols = [...new Set(rows.map((r) => r.symbol.toUpperCase()))];
  if (symbols.length === 0) return NextResponse.json({ items: [] });

  const res = await fetch(
    `/api/marketdata?symbols=${encodeURIComponent(symbols.join(","))}`,
    { cache: "no-store" }
  );
  const data = await res.json().catch(() => []);

  if (!res.ok) {
    return NextResponse.json({
      items: symbols.map((s) => ({ symbol: s, name: s, price: null, change: "-", changePercent: 0 })),
      error: data?.error || "quotes_failed",
    });
  }

  const map = new Map(data.map((r) => [r.symbol, r]));
  const items = symbols.map((s) => {
    const q = map.get(s) || {};
    return {
      symbol: s,
      name: q.name || s,
      price: q.price ?? null,
      change: q.change ?? "-",
      changePercent: q.changePercent ?? 0,
      high: q.high ?? null,
      low: q.low ?? null,
    };
  });

  return NextResponse.json({ items });
}
