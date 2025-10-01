// src/app/market-data-display/detail/[stockSymbol]/components/mainSection.js
"use client";

import { ArrowLeft } from "lucide-react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import GraphSection from "./graphSection";
import PropTypes from "prop-types";
import WatchStar from "@/components/WatchStar";

export default function MainSection({ stockSymbol }) {
  const [stockData, setStockData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!stockSymbol) {
      setError("No stock symbol provided.");
      setIsLoading(false);
      return;
    }

    const fetchStockDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // ✅ call the real route directly
        const res = await fetch(`/api/marketdata/detail/${encodeURIComponent(stockSymbol)}`, { cache: "no-store" });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body?.error || `Server ${res.status}`);

        setStockData(body);
      } catch (err) {
        setError(err.message || "An unexpected error occurred while fetching data.");
        setStockData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockDetail();
  }, [stockSymbol]);

  if (isLoading) {
    return (
      <div className="p-8 text-center text-blue-50">
        Loading stock details for <strong>{stockSymbol}</strong>…
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-100">Error: {error}</div>;
  }

  if (!stockData || !stockData.name) {
    return (
      <div className="p-8 text-center text-white/90">
        No data found for <strong>{stockSymbol}</strong>.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col h-full shadow rounded-2xl overflow-hidden gap-y-2">
      {/* Top section */}
      <div className="flex items-center justify-between p-4 px-8 border-b bg-gray-50 rounded-2xl">
        <Link className="flex items-center gap-2 text-blue-600 hover:text-blue-800" href={"/market-data-display/"}>
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </Link>

        <div className="flex items-center gap-5">
          <span className="text-lg font-semibold text-gray-800">
            {stockData.symbol} — {stockData.name}
          </span>
          <span className="text-green-600 font-bold">{stockData.currentPrice}</span>
        </div>

        <div className="flex items-center gap-3">
          <WatchStar symbol={stockData.symbol} name={stockData.name} />
          <Link
            href={{
              pathname: "/trade",
              query: {
                symbol: stockData.symbol,
                name: stockData.name,
                price: String(stockData.currentPriceNum ?? 0),
              },
            }}
            className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition"
          >
            Trade
          </Link>
        </div>
      </div>

      {/* Bottom section */}
      <div className="flex-1 bg-white rounded-2xl p-8 overflow-hidden">
        {Array.isArray(stockData.historicalData) && stockData.historicalData.length > 0 ? (
          <GraphSection data={stockData.historicalData} />
        ) : (
          <div className="mb-6 rounded-lg border border-gray-200 p-4 text-sm text-gray-600">
            No historical data available for this symbol.
          </div>
        )}

        {stockData.description ? (
          <div className="mt-6 border-t border-gray-200 pt-4">
            <p className="text-gray-700">{stockData.description}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

MainSection.propTypes = {
  stockSymbol: PropTypes.string.isRequired,
};
