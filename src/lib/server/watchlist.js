import { prisma } from "@/utils/prisma";
import { getQuotes } from "@/lib/market/quotes";

export async function getWatchlistWithQuotes(userId) {
  const rows = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { symbol: true },
  });

  const symbols = [...new Set(rows.map((row) => row.symbol?.toUpperCase()).filter(Boolean))];
  if (symbols.length === 0) return [];

  const quotes = await getQuotes(symbols);
  const map = new Map(quotes.map((quote) => [quote.symbol?.toUpperCase(), quote]));

  return symbols.map((symbol) => {
    const q = map.get(symbol) || {};
    return {
      symbol,
      name: q.name || symbol,
      price: q.price ?? null,
      change: q.change ?? "-",
      changePercent: q.changePercent ?? 0,
      marketCap: q.marketCap ?? null,
    };
  });
}

