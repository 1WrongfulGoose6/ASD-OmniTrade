// src/app/api/watchlist/toggle/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getUserIdFromCookies } from "@/utils/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/watchlist  -> current user's watchlist + lightweight quotes
export async function GET() {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // read symbols for this user
  const rows = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { symbol: true },
  });

  const symbols = [...new Set(rows.map(r => r.symbol.toUpperCase()))];
  if (symbols.length === 0) return NextResponse.json({ items: [] });

  // fetch quotes once for all symbols
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/marketdata`);
  url.searchParams.set("symbols", symbols.join(","));

  const res = await fetch(url.toString(), { cache: "no-store" });
  const data = await res.json().catch(() => []);

  const map = new Map((Array.isArray(data) ? data : []).map(r => [r.symbol?.toUpperCase(), r]));
  const items = symbols.map(s => {
    const q = map.get(s) || {};
    return {
      symbol: s,
      name: q.name || s,
      price: q.price ?? null,
      change: q.change ?? "-",
      changePercent: q.changePercent ?? 0,
      marketCap: q.marketCap ?? null,
    };
  });

  return NextResponse.json({ items });
}
