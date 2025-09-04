// app/trade/TradePageClient.js
"use client";

import React, { useState, useEffect } from "react";
import GraphSection from "@/app/market-data-display/detail/components/graphSection";
import OrderForm from "@/components/OrderForm";
import { useSearchParams } from "next/navigation";
import NavBar from "@/components/NavBar";

export default function TradePageClient() {
  const searchParams = useSearchParams();

  const [symbol, setSymbol] = useState(null);
  const [name, setName] = useState(null);
  const [price, setPrice] = useState(null);

  useEffect(() => {
    setSymbol(searchParams?.get("symbol") ?? "AAPL");
    setName(searchParams?.get("name") ?? "Apple Inc.");
    setPrice(searchParams?.get("price") ?? "192.50");
  }, [searchParams]);

  const [orders] = useState([
    { symbol: "BTC/AUD", position: "Buy", entryPrice: 65800, audCost: 131600 },
    { symbol: "ETH/AUD", position: "Sell", entryPrice: 4500, audCost: 9000 },
  ]);

  if (!symbol || !name || !price) return null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      {/* Background waves */}
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

      {/* Top nav */}
      <NavBar />

      {/* Content */}
      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-6 pb-16">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Chart + Orders */}
          <section className="flex-1 flex flex-col gap-4">
            {/* Mini-summary */}
            <div className="relative bg-white/70 rounded-2xl p-4 shadow-sm flex flex-col items-center text-gray-800">
              <a
                href="/market-data-display/detail"
                className="absolute top-2 left-4 text-blue-600 hover:underline"
              >
                ← Back
              </a>
              <div className="text-center">
                <div className="text-sm text-gray-500">
                  {symbol} • {name}
                </div>
                <div className="text-2xl font-semibold">${price}</div>
              </div>
              <div className="text-center mt-2">
                <div className="text-green-600 font-semibold">+0.75%</div>
                <div className="text-sm text-gray-500">
                  Day high • 65,800 • low 64,000
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-blue-50 rounded-2xl shadow-lg p-4 h-[35vh] md:h-[30vh] overflow-hidden">
              <GraphSection />
            </div>

            {/* Pending Orders */}
            <div className="bg-blue-50 rounded-2xl shadow-lg p-4 mt-4 overflow-x-auto">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                Pending Orders
              </h3>
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
                    <tr
                      key={idx}
                      className="border-b border-gray-200 hover:bg-gray-100 text-gray-800"
                    >
                      <td className="py-2 px-3">{order.symbol}</td>
                      <td
                        className={`py-2 px-3 font-semibold ${
                          order.position === "Buy"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {order.position}
                      </td>
                      <td className="py-2 px-3">
                        {order.entryPrice.toLocaleString()}
                      </td>
                      <td className="py-2 px-3">
                        {order.audCost.toLocaleString()}
                      </td>
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
      </section>
    </main>
  );
}
