import React from "react";
import NavBar from "@/components/NavBar";
import { headers } from "next/headers";
import NewsLoadMore from "@/components/NewsLoadMore";
import WaveBackground from "@/components/WaveBackground";
import { POPULAR_SYMBOLS } from "@/lib/market/quotes";

export const metadata = {
  title: "OmniTrade - News",
  description: "Latest market headlines",
};

async function fetchNews(limit = 24) {
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_BASE_URL || `http://${h.get("host")}`;
  const symbolParam = encodeURIComponent(POPULAR_SYMBOLS.join(","));
  const res = await fetch(`${origin}/api/news?category=company&limit=${limit}&symbols=${symbolParam}`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return { news: [] };
  return res.json();
}

export default async function NewsPage() {
  const { news = [] } = await fetchNews(40);

  // Add a stable ISO string for each item to avoid SSR/CSR locale mismatches
  const withIso = news.map(n => ({
    ...n,
    iso: n?.datetime ? new Date(n.datetime * 1000).toISOString() : null,
  }));

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-12">
        <h1 className="text-4xl font-bold">News</h1>
        <p className="mt-2 text-white/80">Latest market headlines.</p>
      </section>

      {/* List with “Load more” */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pb-24 pt-8">
        <NewsLoadMore items={withIso} initialCount={8} step={6} />
      </section>
    </main>
  );
}
