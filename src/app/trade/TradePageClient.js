// app/trade/TradePageClient.js
"use client"; // client component

import React, { useState, useEffect } from "react";
import GraphSection from "@/app/market-data-display/detail/components/graphSection";
import OrderForm from "@/components/OrderForm";
import { useSearchParams } from "next/navigation";

export default function TradePageClient() {
  const searchParams = useSearchParams();

  const [symbol, setSymbol] = useState(null);
  const [name, setName] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    setSymbol(searchParams?.get("symbol") ?? "AAPL");
    setName(searchParams?.get("name") ?? "Apple Inc.");
    setPrice(searchParams?.get("price") ?? "65,500");
  }, [searchParams]);

  // Sample pending orders
  const [orders] = useState([
    { symbol: "BTC/AUD", position: "Buy", entryPrice: 65800, audCost: 131600 },
    { symbol: "ETH/AUD", position: "Sell", entryPrice: 4500, audCost: 9000 },
  ]);

  if (!symbol || !name || !price) return null; // wait for client-side hydration

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-200 p-6">
      <div className="mx-auto w-full max-w-[1200px] flex flex-col md:flex-row gap-6">
        {/* Left: Chart area */}
        <section className="flex-1 flex flex-col gap-4">
          {/* Mini-summary */}
          <div className="relative bg-white/80 rounded-2xl p-4 shadow-sm flex flex-col items-center">
            {/* Back button */}
            <a
              href="/market-data-display/detail"
              className="absolute top-2 left-4 text-blue-600 hover:underline"
            >
              ← Back
            </a>

            {/* Centered symbol & price */}
            <div className="text-center">
              <div className="text-sm text-gray-500">{symbol} • {name}</div>
              <div className="text-2xl font-semibold text-gray-800">${price}</div>
            </div>

            {/* Day change info */}
            <div className="text-center mt-2">
              <div className="text-green-600 font-semibold">+0.75%</div>
              <div className="text-sm text-gray-500">Day high • 65,800 • low 64,000</div>
            </div>
          </div>

          {/* Chart card */}
          <div className="bg-white rounded-2xl shadow-lg p-4 h-[35vh] md:h-[30vh] overflow-hidden">
            <GraphSection />
          </div>

          {/* Pending Orders Table */}
          <div className="bg-white rounded-2xl shadow-lg p-4 mt-4 overflow-x-auto">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Pending Orders</h3>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-300 text-gray-800">
                  <th className="py-2 px-3">Symbol</th>
                  <th className="py-2 px-3">Position</th>
                  <th className="py-2 px-3">Entry Price</th>
                  <th className="py-2 px-3">AUD Cost</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 text-gray-800">
                    <td className="py-2 px-3">{order.symbol}</td>
                    <td className={`py-2 px-3 font-semibold ${order.position === "Buy" ? "text-green-600" : "text-red-600"}`}>
                      {order.position}
                    </td>
                    <td className="py-2 px-3">{order.entryPrice.toLocaleString()}</td>
                    <td className="py-2 px-3">{order.audCost.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Order form */}
        <aside className="w-full max-w-md">
          <div className="sticky top-8">
            <OrderForm />
          </div>
        </aside>
      </div>
    </main>
  );
}
