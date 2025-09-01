// app/news/page.js
import React from "react";
import Link from "next/link";
import { MOCK_NEWS } from "./_data";

export const metadata = {
  title: "OmniTrade — News",
  description: "Latest market and stock news on OmniTrade",
};

export default function NewsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      {/* Wavy background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
        </svg>
      </div>

      {/* Top nav */}
      <header className="relative z-10 border-b border-white/15">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <Link href="/" className="text-3xl font-bold tracking-tight hover:opacity-90">OmniTrade</Link>
          <div className="hidden gap-8 text-xl md:flex">
            <Link href="/market-data-display" className="hover:opacity-90">Stock</Link>
            <Link href="/portfolio" className="hover:opacity-90">Portfolio</Link>
            <Link href="/profile" className="hover:opacity-90">Profile</Link>
            <Link href="/settings" className="hover:opacity-90">Settings</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20">Log in</Link>
            <Link href="/register" className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50">Get Started</Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-12">
        <h1 className="text-4xl font-bold">News</h1>
        <p className="mt-2 text-white/80">Latest market headlines and per-ticker updates.</p>
      </section>

      {/* News list */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pb-24 pt-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {MOCK_NEWS.map((n) => (
            <Link
              key={n.slug}
              href={`/news/${n.slug}`}
              className="group rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur transition hover:shadow-lg"
            >
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">{n.tag}</span>
                <span>{new Date(n.date).toLocaleDateString()}</span>
              </div>
              <h2 className="mt-3 text-xl font-semibold text-gray-900 group-hover:underline">{n.title}</h2>
              <p className="mt-2 text-sm text-gray-700">{n.summary}</p>
              <div className="mt-4 text-sm font-medium text-blue-700">Read article →</div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
