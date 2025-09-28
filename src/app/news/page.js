// app/news/page.js
import React from "react";
import NavBar from "@/components/NavBar";
import { headers } from "next/headers";
import NewsLoadMore from "@/components/NewsLoadMore";

export const metadata = {
  title: "OmniTrade — News",
  description: "Latest market headlines",
};

async function fetchNews(limit = 24) {
  const h = await headers();
  const origin = process.env.NEXT_PUBLIC_BASE_URL || `http://${h.get("host")}`;
  const res = await fetch(`${origin}/api/news?category=general&limit=${limit}`, {
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
      {/* bg waves */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320,480,320,384,320,288,320,192,320,96,320,48,320L0,0Z" />
        </svg>
      </div>

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
