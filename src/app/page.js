// app/page.js
import React from "react";
import HomeView from "@/components/HomeView";
import { headers } from "next/headers";

export const dynamic = "force-dynamic"; // ← disables SSG for this route
export const revalidate = 0;             // ← ensure no build-time caching

async function fetchHomeNews() {
  try {
    const h = await headers();
    const origin =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (h?.get("host") ? `http://${h.get("host")}` : null);

    if (!origin) return { news: [] }; // CI build has no host

    const res = await fetch(`${origin}/api/news?category=general&limit=6`, {
      // this cache hint affects runtime, not build (since we disabled SSG)
      next: { revalidate: 300 },
    });
    if (!res.ok) return { news: [] };
    return res.json(); // { news: [...] }
  } catch {
    return { news: [] };
  }
}

export default async function HomePage() {
  const { news = [] } = await fetchHomeNews();
  return <HomeView news={news} />;
}
