// F04 - Ali Bonagdaran

import { NextResponse } from "next/server";
import { getUserIdFromCookies } from "@/utils/auth";
import { buildPortfolioSnapshot } from "@/lib/server/portfolio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RANGE_CONFIG = {
  "1h": {
    key: "1h",
    points: 12,
    interval: "minute",
    step: 5,
    volatility: 0.003,
    trendFactor: 0.0005,
    label(date) {
      return date.toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });
    },
  },
  "24h": {
    key: "24h",
    points: 24,
    interval: "hour",
    volatility: 0.01,
    trendFactor: 0.002,
    label(date) {
      return date.toLocaleTimeString("en-AU", { hour: "numeric" });
    },
  },
  "7d": {
    key: "7d",
    points: 7,
    interval: "day",
    volatility: 0.02,
    trendFactor: 0.0015,
    label(date) {
      return date.toLocaleDateString("en-AU", { weekday: "short" });
    },
  },
  "1m": {
    key: "1m",
    points: 30,
    interval: "day",
    volatility: 0.03,
    trendFactor: 0.0012,
    label(date) {
      return date.toLocaleDateString("en-AU", { month: "short", day: "numeric" });
    },
  },
  YTD: {
    key: "YTD",
    points: "ytd",
    interval: "month",
    volatility: 0.035,
    trendFactor: 0.0009,
    label(date) {
      return date.toLocaleDateString("en-AU", { month: "short" });
    },
  },
  "1y": {
    key: "1y",
    points: 12,
    interval: "month",
    volatility: 0.04,
    trendFactor: 0.001,
    label(date) {
      return date.toLocaleDateString("en-AU", { month: "short" });
    },
  },
};

function resolveRange(rangeParam) {
  if (!rangeParam) return RANGE_CONFIG["1m"];
  const normalized = rangeParam.toUpperCase() === "YTD" ? "YTD" : rangeParam;
  return RANGE_CONFIG[normalized] || RANGE_CONFIG["1m"];
}

function getRangeStart(rangeConfig, now) {
  switch (rangeConfig.key) {
    case "1h":
      return new Date(now.getTime() - 60 * 60 * 1000);
    case "24h":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "1m":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case "1y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "YTD":
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }
}

function addInterval(date, interval, step = 1) {
  const next = new Date(date);
  if (interval === "hour") {
    next.setHours(next.getHours() + step);
  } else if (interval === "day") {
    next.setDate(next.getDate() + step);
  } else if (interval === "month") {
    next.setMonth(next.getMonth() + step);
  } else if (interval === "minute") {
    next.setMinutes(next.getMinutes() + step);
  }
  return next;
}

function buildTimeline(rangeConfig, start, end) {
  const maxPoints =
    typeof rangeConfig.points === "number" ? Math.max(rangeConfig.points, 2) : 12;
  const timeline = [];
  let cursor = new Date(start);

  while (cursor < end && timeline.length < maxPoints - 1) {
    timeline.push(new Date(cursor));
    cursor = addInterval(cursor, rangeConfig.interval, rangeConfig.step || 1);
  }

  timeline.push(new Date(end));
  return timeline;
}

function calculateHistoricalSeries(rangeConfig, currentPortfolioValue, { hasActiveHoldings, firstHoldingDate } = {}) {
  const now = new Date();
  const rangeStart = getRangeStart(rangeConfig, now);

  if (!hasActiveHoldings) {
    const price = Number(Math.max(0, currentPortfolioValue).toFixed(2));
    return {
      data: [
        {
          time: "Now",
          price,
          timestamp: now.toISOString(),
        },
      ],
      startValue: price,
      change: 0,
      changePercent: 0,
      firstHoldingTimestamp: null,
    };
  }

  const firstHeld = firstHoldingDate ? new Date(firstHoldingDate) : now;
  const effectiveStart = new Date(Math.max(rangeStart.getTime(), firstHeld.getTime()));
  const timeline = buildTimeline(rangeConfig, effectiveStart, now);
  const shouldFlatten = timeline.length <= 2;

  const values = timeline.map((pointDate, idx) => {
    const isLastPoint = idx === timeline.length - 1;
    let value = currentPortfolioValue;

    if (!shouldFlatten && !isLastPoint) {
      const progress = timeline.length > 1 ? idx / (timeline.length - 1) : 0;
      const distanceFromEnd = 1 - progress;
      const noise = (Math.random() - 0.5) * rangeConfig.volatility;
      const trendAdjustment = distanceFromEnd * rangeConfig.trendFactor;
      const baseDrift = 1 - distanceFromEnd * 0.05 - trendAdjustment;
      const multiplier = Math.max(0.1, baseDrift + noise);
      value = currentPortfolioValue * multiplier;
    }

    return {
      time: isLastPoint ? "Now" : rangeConfig.label(pointDate),
      price: Number(Math.max(0, value).toFixed(2)),
      timestamp: pointDate.toISOString(),
    };
  });

  if (values.length > 0) {
    values[values.length - 1] = {
      ...values[values.length - 1],
      price: Number(Math.max(0, currentPortfolioValue).toFixed(2)),
      time: "Now",
      timestamp: now.toISOString(),
    };
  }

  const startValue = values.length > 0 ? values[0].price : Number(currentPortfolioValue.toFixed(2));
  const change = Number((currentPortfolioValue - startValue).toFixed(2));
  const changePercent = startValue ? Number(((change / startValue) * 100).toFixed(2)) : 0;

  return {
    data: values,
    startValue,
    change,
    changePercent,
    firstHoldingTimestamp: firstHeld.toISOString(),
  };
}

export async function GET(request) {
  const searchRange = request?.nextUrl?.searchParams?.get("range") || "1m";
  const userId = await getUserIdFromCookies();
  if (!userId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const snapshot = await buildPortfolioSnapshot(userId);
    const currentPortfolioValue = snapshot.netWorth;

    const firstHoldingDate = snapshot.holdings.reduce((earliest, holding) => {
      if (!holding.firstHeldAt) return earliest;
      const ts = new Date(holding.firstHeldAt).getTime();
      if (Number.isNaN(ts)) return earliest;
      if (!earliest) return new Date(ts);
      return ts < earliest.getTime() ? new Date(ts) : earliest;
    }, null);

    const hasActiveHoldings = snapshot.holdings.length > 0;

    const rangeConfig = resolveRange(searchRange);
    const { data, startValue, change, changePercent, firstHoldingTimestamp } = calculateHistoricalSeries(
      rangeConfig,
      currentPortfolioValue,
      { hasActiveHoldings, firstHoldingDate }
    );

<<<<<<< HEAD
    // 2) Get cash from deposits
    const agg = await prisma.deposit.aggregate({
      _sum: { amount: true },
      where: { userId },
    });
    const cash = Number(agg._sum.amount || 0);

    // 3) Total portfolio value (matching the Net Worth calculation)
    const currentPortfolioValue = holdingsValue + cash;

    // Generate 30 days of historical data leading up to the current value
    const dailyValues = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      
      // Create realistic historical variation that leads to current value
      const daysFromNow = 29 - i;
      const baseVariation = (Math.random() - 0.5) * 0.03; // ±1.5% daily variation
      const trendAdjustment = (daysFromNow * 0.0008); // Slight downward trend towards past
      
      // Calculate historical value
      const multiplier = 1 + baseVariation - trendAdjustment;
      const historicalValue = currentPortfolioValue * multiplier;
      
      const timeStr = i === 29 ? "Now" : 
        date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      dailyValues.push({
        time: timeStr,
        price: Number(Math.max(0, historicalValue).toFixed(2))
      });
    }

    // Ensure the last point matches exactly the current portfolio value
    if (dailyValues.length > 0) {
      dailyValues[dailyValues.length - 1] = {
        time: "Now",
        price: Number(currentPortfolioValue.toFixed(2))
      };
    }

    return NextResponse.json({ 
      historicalData: dailyValues,
      period: "30d",
      currentValue: currentPortfolioValue
=======
    return NextResponse.json({
      historicalData: data,
      range: rangeConfig.key,
      currentValue: Number(currentPortfolioValue.toFixed(2)),
      startValue,
      change,
      changePercent,
      firstHoldingTimestamp,
>>>>>>> main
    });

  } catch (e) {
    logger.error({ err: e }, "[portfolio/history] error");
    if (e.message.includes("unauthorized")) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
