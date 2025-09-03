"use client";
import React, { useState } from "react";
import Link from "next/link";

const holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 10,
    price: 175.29,
    change: 2.15,
    changePercent: 1.24,
    value: 1752.9,
    profitLoss: 215.0,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp.",
    shares: 5,
    price: 315.75,
    change: -1.5,
    changePercent: -0.47,
    value: 1578.75,
    profitLoss: -7.5,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    shares: 8,
    price: 155.23,
    change: 1.8,
    changePercent: 1.17,
    value: 1241.84,
    profitLoss: 14.4,
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 12,
    price: 140.76,
    change: -0.24,
    changePercent: -0.17,
    value: 1689.12,
    profitLoss: -2.88,
  },
];

const totalValue = holdings.reduce((acc, holding) => acc + holding.value, 0);
const totalProfitLoss = holdings.reduce(
  (acc, holding) => acc + holding.profitLoss,
  0
);

export default function Portfolio() {
  const [range, setRange] = useState("24h");

  const rangePerf = {
    "24h": (totalProfitLoss / totalValue) * 100,
    "7d": 2.35,
    "1m": 5.62,
    YTD: 12.14,
    "1y": 18.42,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      {/* Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Top wave */}
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
        {/* Bottom wave */}
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

      {/* Header */}
      <header className="relative z-10 border-b border-white/15">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-5">
          <Link
            href="/"
            className="text-3xl font-bold tracking-tight hover:opacity-90"
          >
            OmniTrade
          </Link>
          <div className="hidden gap-8 text-xl md:flex">
            <Link href="/market-data-display" className="hover:opacity-90">
              Stock
            </Link>
            <Link href="/portfolio" className="hover:opacity-90">
              Portfolio
            </Link>
            <Link href="/profile" className="hover:opacity-90">
              Profile
            </Link>
            <Link href="/settings" className="hover:opacity-90">
              Settings
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm backdrop-blur hover:bg-white/20"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Overview Title */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-12">
        <h1 className="text-4xl font-bold drop-shadow">Portfolio Overview</h1>
        <p className="mt-2 text-blue-100/90">
          Track your holdings and performance over time.
        </p>
      </section>

      {/* Stats Card */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-6">
        <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-center">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Total Value
                </p>
                <p className="mt-1 text-3xl font-bold">
                  $
                  {totalValue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  P/L (Today)
                </p>
                <p
                  className={`mt-1 text-3xl font-bold ${
                    totalProfitLoss >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  $
                  {totalProfitLoss.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Performance ({range})
                </p>
                <p
                  className={`mt-1 text-3xl font-bold ${
                    rangePerf[range] >= 0
                      ? "text-emerald-600"
                      : "text-red-600"
                  }`}
                >
                  {rangePerf[range].toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Actions: ranges + buttons */}
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              {["24h", "7d", "1m", "YTD", "1y"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                    range === r
                      ? "bg-blue-700 text-white"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                  }`}
                >
                  {r}
                </button>
              ))}

              {/* Deposit & Withdraw */}
              <Link
                href="/deposit"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Deposit
              </Link>
              <Link
                href="/withdraw"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
              >
                Withdraw
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Holdings Table */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 py-8">
        <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
          <h2 className="text-lg font-semibold">Your Holdings</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-gray-600">
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Change</th>
                  <th className="p-3 hidden md:table-cell">Shares</th>
                  <th className="p-3 hidden md:table-cell">Value</th>
                  <th className="p-3">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr
                    key={holding.symbol}
                    className="border-b border-gray-200/80 last:border-0"
                  >
                    <td className="p-3 font-semibold text-gray-900">
                      {holding.symbol}
                    </td>
                    <td className="p-3 text-gray-700">
                      ${holding.price.toFixed(2)}
                    </td>
                    <td
                      className={`p-3 ${
                        holding.change >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      {holding.change.toFixed(2)} (
                      {holding.changePercent.toFixed(2)}%)
                    </td>
                    <td className="p-3 hidden md:table-cell text-gray-700">
                      {holding.shares}
                    </td>
                    <td className="p-3 hidden md:table-cell text-gray-700">
                      $
                      {holding.value.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td
                      className={`p-3 ${
                        holding.profitLoss >= 0
                          ? "text-emerald-600"
                          : "text-red-600"
                      }`}
                    >
                      ${holding.profitLoss.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
