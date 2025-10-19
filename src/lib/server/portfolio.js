import { prisma } from "@/utils/prisma";
import { getQuotes } from "@/lib/market/quotes";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export async function buildPortfolioSnapshot(userId) {
  const trades = await prisma.trade.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { symbol: true, side: true, qty: true, price: true, createdAt: true },
  });

  const holdingsMap = new Map();
  let totalBuyCost = 0;
  let totalSellProceeds = 0;

  for (const trade of trades) {
    const symbol = (trade.symbol || "").toUpperCase();
    if (!symbol) continue;
    const qty = toNumber(trade.qty, 0);
    const price = toNumber(trade.price, 0);
    const value = qty * price;

    if (trade.side === "BUY") totalBuyCost += value;
    if (trade.side === "SELL") totalSellProceeds += value;

    const current =
      holdingsMap.get(symbol) || {
        symbol,
        shares: 0,
        avgCost: 0,
        firstHeldAt: null,
      };
    const signedQty = trade.side === "BUY" ? qty : -qty;

    if (signedQty > 0) {
      const newShares = current.shares + signedQty;
      const newCostBasis =
        (current.avgCost * current.shares + price * signedQty) / (newShares || 1);
      if (current.shares <= 0 && newShares > 0) {
        current.firstHeldAt = trade.createdAt;
      }
      current.shares = newShares;
      current.avgCost = newShares > 0 ? newCostBasis : 0;
    } else {
      current.shares = current.shares + signedQty;
      if (current.shares <= 0) {
        current.shares = 0;
        current.avgCost = 0;
        current.firstHeldAt = null;
      }
    }

    holdingsMap.set(symbol, current);
  }

  const activePositions = [...holdingsMap.values()].filter((position) => position.shares > 0);
  const symbols = activePositions.map((position) => position.symbol);

  const quotes = symbols.length ? await getQuotes(symbols) : [];
  const quoteMap = new Map(quotes.map((quote) => [quote.symbol?.toUpperCase(), quote]));

  const holdings = activePositions.map((position) => {
    const quote = quoteMap.get(position.symbol) || {};
    const marketPrice =
      quote.price != null ? Number(quote.price) : Number(position.avgCost);
    const changePerShare = marketPrice - Number(position.avgCost);
    const changePercent =
      position.avgCost > 0 ? (changePerShare / Number(position.avgCost)) * 100 : 0;
    const value = marketPrice * Number(position.shares);
    const profitLoss = changePerShare * Number(position.shares);

    return {
      symbol: position.symbol,
      price: marketPrice,
      change: changePerShare,
      changePercent,
      shares: Number(position.shares),
      avgCost: Number(position.avgCost),
      value,
      profitLoss,
      firstHeldAt: position.firstHeldAt,
    };
  });

  const totals = holdings.reduce(
    (acc, row) => {
      acc.totalValue += row.value;
      acc.totalProfitLoss += row.profitLoss;
      return acc;
    },
    { totalValue: 0, totalProfitLoss: 0 }
  );

  const cashMovements = await prisma.deposit.findMany({
    where: { userId },
    select: { amount: true, kind: true },
  });

  let totalDeposits = 0;
  let totalWithdrawals = 0;
  for (const entry of cashMovements) {
    const amount = Math.abs(Number(entry.amount) || 0);
    const kind = entry.kind || (Number(entry.amount) < 0 ? "WITHDRAW" : "DEPOSIT");
    if (kind === "WITHDRAW") totalWithdrawals += amount;
    else totalDeposits += amount;
  }

  const startingCash = totalDeposits - totalWithdrawals;
  const availableCash = startingCash - totalBuyCost + totalSellProceeds;

  return {
    holdings,
    totals,
    cash: availableCash,
    netWorth: totals.totalValue + availableCash,
    meta: {
      totalBuyCost,
      totalSellProceeds,
      totalDeposits,
      totalWithdrawals,
    },
  };
}

export async function getCashBalance(userId) {
  const [trades, cashMovements] = await Promise.all([
    prisma.trade.findMany({
      where: { userId },
      select: { side: true, qty: true, price: true },
    }),
    prisma.deposit.findMany({
      where: { userId },
      select: { amount: true, kind: true },
    }),
  ]);

  let totalBuyCost = 0;
  let totalSellProceeds = 0;
  for (const trade of trades) {
    const qty = toNumber(trade.qty, 0);
    const price = toNumber(trade.price, 0);
    const value = qty * price;
    if (trade.side === "BUY") totalBuyCost += value;
    if (trade.side === "SELL") totalSellProceeds += value;
  }

  let totalDeposits = 0;
  let totalWithdrawals = 0;
  for (const entry of cashMovements) {
    const amount = Math.abs(Number(entry.amount) || 0);
    const kind = entry.kind || (Number(entry.amount) < 0 ? "WITHDRAW" : "DEPOSIT");
    if (kind === "WITHDRAW") totalWithdrawals += amount;
    else totalDeposits += amount;
  }

  const startingCash = totalDeposits - totalWithdrawals;
  const availableCash = startingCash - totalBuyCost + totalSellProceeds;

  return {
    deposits: totalDeposits,
    withdrawals: totalWithdrawals,
    buys: totalBuyCost,
    sells: totalSellProceeds,
    availableCash,
  };
}

