// src/components/Portfolio.js
"use client";

import { useState, useEffect } from "react";

export default function Portfolio() {
  const [range, setRange] = useState("24h");
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ totalValue: 0, totalProfitLoss: 0, cashAud: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let off = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch("/api/portfolio", { cache: "no-store" });
        const ct = res.headers.get("content-type") || "";
        let data;
        if (ct.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Non-JSON response (${res.status}). First 120 chars: ${text.slice(0, 120)}`);
        }
        if (!res.ok) {
          if (res.status === 401) throw new Error("Please log in to view your portfolio.");
          throw new Error(data?.error || "Failed to load portfolio");
        }
        if (!off) {
          setRows(data.holdings || []);
          setTotals(data.totals || { totalValue: 0, totalProfitLoss: 0, cashAud: 0 });
        }
      } catch (e) {
        if (!off) setErr(e.message || "Failed to load portfolio");
      } finally {
        if (!off) setLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, []);

  const holdingsValue = Number(totals.totalValue || 0);
  const cashAud = Number(totals.cashAud || 0);
  const netWorth = holdingsValue + cashAud;

  const rangePerf = {
    "24h": holdingsValue ? (Number(totals.totalProfitLoss || 0) / holdingsValue) * 100 : 0,
    "7d": 2.35,
    "1m": 5.62,
    YTD: 12.14,
    "1y": 18.42,
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      {/* Header */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-12">
        <h1 className="text-4xl font-bold drop-shadow">Portfolio Overview</h1>
        <p className="mt-2 text-blue-100/90">Track your holdings, cash, and performance over time.</p>
      </section>

      {/* Stats */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-6">
        <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
          {loading ? (
            <div>Loading…</div>
          ) : err ? (
            <div className="text-red-700">{err}</div>
          ) : (
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 text-center">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Holdings Value</p>
                  <p className="mt-1 text-3xl font-bold">
                    ${holdingsValue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Cash (AUD)</p>
                  <p className="mt-1 text-3xl font-bold">
                    ${cashAud.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Net Worth</p>
                  <p className="mt-1 text-3xl font-bold">
                    ${netWorth.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Performance ({range})</p>
                  <p
                    className={`mt-1 text-3xl font-bold ${
                      rangePerf[range] >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {rangePerf[range].toFixed(2)}%
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {["24h", "7d", "1m", "YTD", "1y"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                      range === r ? "bg-blue-700 text-white" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    }`}
                  >
                    {r}
                  </button>
                ))}
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
          )}
        </div>
      </section>

      {/* Portfolio Chart */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 py-4">
        <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
          <h2 className="text-lg font-semibold mb-4">Portfolio Performance</h2>
          {loading ? (
            <div className="h-64 flex items-center justify-center bg-gray-200 rounded-2xl">
              <div className="text-gray-600">Loading chart...</div>
            </div>
          ) : err ? (
            <div className="h-64 flex items-center justify-center bg-gray-200 rounded-2xl">
              <div className="text-red-600">Unable to load chart: {err}</div>
            </div>
          ) : (
            <PortfolioChart />
          )}
        </div>
      </section>

      {/* Holdings */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 py-8">
        <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
          <h2 className="text-lg font-semibold">Your Holdings</h2>

          {loading ? (
            <div className="mt-4">Loading…</div>
          ) : err ? (
            <div className="mt-4 text-red-700">{err}</div>
          ) : rows.length === 0 ? (
            <div className="mt-4 text-gray-700">No positions yet. Place a trade to get started.</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-600">
                    <th className="p-3">Symbol</th>
                    <th className="p-3">Price</th>
                    <th className="p-3">Change</th>
                    <th className="p-3">Shares</th>
                    <th className="p-3">Avg Cost</th>
                    <th className="p-3">Value</th>
                    <th className="p-3">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.symbol} className="border-b border-gray-200/80 last:border-0">
                      <td className="p-3 font-semibold text-gray-900">{r.symbol}</td>
                      <td className="p-3 text-gray-700">
                        {r.price != null ? `$${r.price.toFixed(2)}` : "—"}
                      </td>
                      <td className={`p-3 ${r.change >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        {r.change.toFixed(2)} ({r.changePercent.toFixed(2)}%)
                      </td>
                      <td className="p-3 text-gray-700">{r.shares}</td>
                      <td className="p-3 text-gray-700">${r.avgCost.toFixed(2)}</td>
                      <td className="p-3 text-gray-700">
                        ${r.value.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`p-3 ${r.profitLoss >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                        ${r.profitLoss.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
