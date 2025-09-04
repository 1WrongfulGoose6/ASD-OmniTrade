// app/page.js
import React from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";

export const metadata = {
  title: "OmniTrade",
  description: "OmniTrade Home Page",
};

function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      {/* Wavy background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg
          className="absolute top-0 left-0 h-64 w-full text-white/20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </svg>
        <svg
          className="absolute bottom-0 left-0 h-64 w-full text-white/20"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>

      {/* NavBar */}
      <NavBar />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-20 text-center">
        <h1 className="mx-auto max-w-4xl text-6xl font-bold leading-tight drop-shadow">
          Welcome to <span className="whitespace-nowrap">OmniTrade</span>
        </h1>
        <div className="mt-8">
          <Link href="/portfolio" className="inline-block rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 shadow hover:bg-blue-50">
            View Portfolio
          </Link>
        </div>
      </section>

      {/* Content cards */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pb-24 pt-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
            <h2 className="text-lg font-semibold">Stock News</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              <li className="rounded-md bg-white/60 p-3">• Market opens higher on tech strength</li>
              <li className="rounded-md bg-white/60 p-3">• Energy stocks rally on crude move</li>
              <li className="rounded-md bg-white/60 p-3">• Fed commentary: inflation watch</li>
            </ul>
            <div className="mt-6">
              <Link href="/news" className="text-sm font-medium text-blue-700 hover:underline">View all news →</Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
            <h2 className="text-lg font-semibold">Trending Stocks</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-white/60 p-3">
                <div className="font-medium">AAPL</div>
                <div className="text-gray-600">$172.39</div>
                <div className="text-emerald-600">+1.25%</div>
              </div>
              <div className="rounded-md bg-white/60 p-3">
                <div className="font-medium">MSFT</div>
                <div className="text-gray-600">$310.65</div>
                <div className="text-emerald-600">+0.98%</div>
              </div>
              <div className="rounded-md bg-white/60 p-3">
                <div className="font-medium">AMZN</div>
                <div className="text-gray-600">$153.76</div>
                <div className="text-red-600">-0.74%</div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/market-data-display" className="text-sm font-medium text-blue-700 hover:underline">Explore stocks →</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
