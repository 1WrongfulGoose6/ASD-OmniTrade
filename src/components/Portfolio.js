// src/components/Portfolio.js
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import WaveBackground from "@/components/WaveBackground";
import PortfolioChart from "@/components/PortfolioChart";

export default function Portfolio() {
  const [range, setRange] = useState("24h");
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState({ totalValue: 0, totalProfitLoss: 0, cashAud: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historySummary, setHistorySummary] = useState({
    change: 0,
    changePercent: 0,
    currentValue: 0,
    startValue: 0,
    firstHoldingTimestamp: null,
  });
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyErr, setHistoryErr] = useState(null);

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

  useEffect(() => {
    let off = false;
    (async () => {
      setHistoryLoading(true);
      setHistoryErr(null);
      try {
        const res = await fetch(`/api/portfolio/history?range=${encodeURIComponent(range)}`, { cache: "no-store" });
        const ct = res.headers.get("content-type") || "";
        let data;
        if (ct.includes("application/json")) {
          data = await res.json();
        } else {
          const text = await res.text();
          throw new Error(`Non-JSON response (${res.status}). First 120 chars: ${text.slice(0, 120)}`);
        }
        if (!res.ok) {
          throw new Error(data?.error || "Failed to load portfolio history");
        }
        if (!off) {
          setHistoryData(data.historicalData || []);
          setHistorySummary({
            change: Number(data.change || 0),
            changePercent: Number(data.changePercent || 0),
            currentValue: Number(data.currentValue || 0),
            startValue: Number(data.startValue || 0),
            firstHoldingTimestamp: data.firstHoldingTimestamp || null,
          });
        }
      } catch (e) {
        if (!off) setHistoryErr(e.message || "Failed to load portfolio history");
      } finally {
        if (!off) setHistoryLoading(false);
      }
    })();
    return () => {
      off = true;
    };
  }, [range]);

  const holdingsValue = Number(totals.totalValue || 0);
  const cashAud = Number(totals.cashAud || 0);
  const netWorth = holdingsValue + cashAud;

  const performanceReady = !historyLoading && !historyErr;
  const performancePercent = performanceReady ? historySummary.changePercent : null;
  const performanceValue = performanceReady ? historySummary.change : null;
  const percentSign =
    performancePercent == null
      ? ""
      : performancePercent > 0
      ? "+"
      : performancePercent < 0
      ? "-"
      : "";
  const valueSign =
    performanceValue == null
      ? ""
      : performanceValue > 0
      ? "+"
      : performanceValue < 0
      ? "-"
      : "";
  const performanceClass =
    performancePercent == null
      ? "text-gray-900"
      : performancePercent > 0
      ? "text-emerald-600"
      : performancePercent < 0
      ? "text-red-600"
      : "text-gray-900";
  const rangeDisplayMap = {
    "1h": "1 Hour",
    "24h": "24 Hours",
    "7d": "7 Days",
    "1m": "1 Month",
    YTD: "Year-to-Date",
    "1y": "1 Year",
  };
  const rangeLabel = rangeDisplayMap[range] || range;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      {/* Header */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-12">
        <h1 className="text-4xl font-bold drop-shadow">Portfolio Overview</h1>
        <p className="mt-2 text-blue-100/90">Track your holdings, cash, and performance over time.</p>
      </section>

      {/* Stats + Performance */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/20 bg-white/85 p-6 text-gray-900 backdrop-blur">
            {loading ? (
              <div>Loading…</div>
            ) : err ? (
              <div className="text-red-700">{err}</div>
            ) : (
              <div className="flex h-full flex-col gap-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/70 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Holdings Value</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      ${holdingsValue.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Cash (AUD)</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      ${cashAud.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-4 shadow-sm sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Net Worth</p>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      ${netWorth.toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/70 p-4 shadow-sm sm:col-span-2">
                    <p className="text-xs uppercase tracking-wide text-gray-500">Performance ({rangeLabel})</p>
                    <p className={`mt-2 text-2xl font-semibold ${performanceClass}`}>
                      {historyLoading && !historyErr && "Loading…"}
                      {!historyLoading && historyErr && "-"}
                      {performanceReady && (
                        <>
                          {percentSign}
                          {Math.abs(performancePercent).toFixed(2)}%
                          <span className="ml-2 text-base font-semibold">
                            ({valueSign}$
                            {Math.abs(performanceValue).toFixed(2)})
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div>
                    <span className="block text-xs uppercase tracking-wide text-gray-500">Range</span>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {["1h", "24h", "7d", "1m", "YTD", "1y"].map((r) => (
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
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center">
                    <Link
                      href="/deposit"
                      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Deposit
                    </Link>
                    <Link
                      href="/withdraw"
                      className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Withdraw
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/20 bg-white/90 p-6 text-gray-900 backdrop-blur lg:col-span-2">
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold">Portfolio Performance</h2>
              <p className="text-sm text-gray-500">Showing {rangeLabel} performance window</p>
            </div>
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-200">
                <div className="text-gray-600">Loading chart...</div>
              </div>
            ) : err ? (
              <div className="flex h-64 items-center justify-center rounded-2xl bg-gray-200">
                <div className="text-red-600">Unable to load chart: {err}</div>
              </div>
            ) : (
              <PortfolioChart
                range={range}
                data={historyData}
                loading={historyLoading}
                error={historyErr}
                change={historySummary.change}
                changePercent={historySummary.changePercent}
                currentValue={historySummary.currentValue}
                firstHoldingTimestamp={historySummary.firstHoldingTimestamp}
              />
            )}
          </div>
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
                        {r.price != null ? `$${r.price.toFixed(2)}` : "-"}
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
