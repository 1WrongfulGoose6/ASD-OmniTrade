// src/app/trade/TradePageClient.js
"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

// "$517.95" -> 517.95 (number) | invalid -> null
function toNum(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (v == null) return null;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

export default function TradePageClient() {
  const searchParams = useSearchParams();

  const [symbol, setSymbol] = useState(null);
  const [name, setName] = useState(null);
  const [price, setPrice] = useState(null);          // numeric for OrderForm
  const [series, setSeries] = useState([]);          // [{ time, price }]
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  // Read query params exactly once per URL change
  useEffect(() => {
    const s = (searchParams?.get("symbol") || "AAPL").toUpperCase();
    const n = searchParams?.get("name") || null;
    const rawPrice = searchParams?.get("price");
    const qPrice = toNum(rawPrice);

    setSymbol(s);
    setName(n);
    if (qPrice != null) setPrice(qPrice);
  }, [searchParams]);

  // Fetch detail for chart + authoritative price
  useEffect(() => {
    if (!symbol) return;
    let off = false;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await fetch(
          `/api/marketdata/detail/${encodeURIComponent(symbol)}`,
          { cache: "no-store" }
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.error || `Failed ${res.status}`);
        }
        if (off) return;

        // graph
        const points = Array.isArray(data.historicalData)
          ? data.historicalData
          : [];
        setSeries(points);

        // prefer API price over query price
        const apiNum = toNum(data.currentPrice);
        if (apiNum != null) setPrice(apiNum);

        if (!name && data.name) setName(data.name);
      } catch (e) {
        if (!off) setErr(e.message || "Failed to load chart");
      } finally {
        if (!off) setLoading(false);
      }
    })();

    return () => {
      off = true;
    };
  }, [symbol, name]);

  if (!symbol) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-6 pb-16">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: chart + summary */}
          <section className="flex-1 flex flex-col gap-4">
            {/* Mini header */}
            <div className="relative bg-white/70 rounded-2xl p-4 shadow-sm flex flex-col items-center text-gray-800">
              <a
                href="/market-data-display/detail"
                className="absolute top-2 left-4 text-blue-600 hover:underline"
              >
                ← Back
              </a>
              <div className="text-center">
                <div className="text-sm text-gray-500">
                  {symbol}
                  {name ? ` • ${name}` : ""}
                </div>
                <div className="text-2xl font-semibold">
                  {price != null ? `$${price.toFixed(2)}` : "—"}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-blue-50 rounded-2xl shadow-lg p-4 h-[35vh] md:h-[30vh] overflow-hidden">
              {loading ? (
                <div className="h-full grid place-items-center text-gray-600">
                  Loading chart…
                </div>
              ) : err ? (
                <div className="h-full grid place-items-center text-red-600">
                  {err}
                </div>
              ) : series.length ? (
                <GraphSection data={series} />
              ) : (
                <div className="h-full grid place-items-center text-gray-600">
                  No chart data.
                </div>
              )}
            </div>
          </section>

          {/* Right: order form */}
          <aside className="w-full max-w-md">
            <div className="sticky top-8">
              <OrderForm symbol={symbol} price={price} />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
