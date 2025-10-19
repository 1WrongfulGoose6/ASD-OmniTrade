// app/page.js
import React from "react";
import HomeView from "@/components/HomeView";
import { getLatestNews } from "@/lib/server/news";
import { getQuotes, POPULAR_SYMBOLS } from "@/lib/market/quotes";
import { getUserSession } from "@/utils/auth";
import { getWatchlistWithQuotes } from "@/lib/server/watchlist";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [news, session] = await Promise.all([
    getLatestNews({ category: "general", limit: 6 }),
    getUserSession(),
  ]);

  let initialWatchItems = [];
  if (session?.id) {
    initialWatchItems = await getWatchlistWithQuotes(session.id);
  }

  const trendingCandidates = await getQuotes(POPULAR_SYMBOLS);
  const trending = trendingCandidates
    .filter((item) => item.price != null && item.changePercent != null)
    .sort((a, b) => (b.changePercent ?? 0) - (a.changePercent ?? 0));

  return (
    <HomeView
      news={news}
      initialWatchItems={initialWatchItems}
      trending={trending}
    />
  );
}

