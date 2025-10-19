// app/market-data-display/page.js
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import WatchStar from "@/components/WatchStar";
import WaveBackground from "@/components/WaveBackground";

export default function MarketListPage() {
    const router = useRouter();

    const [coins, setCoins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [helper, setHelper] = useState("");

    useEffect(() => {
        const fetchMarketData = async () => {
            try {
                const response = await fetch("/api/marketdata");
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setCoins(data);
            } catch (e) {
                console.error("Failed to fetch market data:", e);
                setError("Failed to load market data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchMarketData();
    }, []);

    const filteredCoins = coins.filter(
        (coin) =>
            coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (searchTerm.length > 12) {
            setHelper("Search is limited to 12 characters for performance.");
        } else if (searchTerm && filteredCoins.length === 0) {
            setHelper("No matching results. Try a different ticker or name.");
        } else {
            setHelper("");
        }
    }, [searchTerm, filteredCoins]);

    function ViewDetail(symbol) {
        router.push("/market-data-display/detail/" + symbol);
    }

    return (
        <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
            <WaveBackground />
            <NavBar />

            <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-6 pb-16">
                {/* subheader */}
                <div className="flex items-center justify-between rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md px-4 sm:px-6 py-3">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-90">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="font-medium">Back</span>
                    </Link>
                    <h1 className="text-2xl font-semibold">Market Data</h1>
                    <div className="w-14" />
                </div>

                {/* Search Bar */}
                <div className="mb-2 flex justify-center">
                    <input
                        type="text"
                        placeholder="Search stock..."
                        className="w-full max-w-md rounded-lg border border-white/30 bg-white/80 px-4 py-2 text-gray-800 placeholder:text-gray-500 backdrop-blur focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {helper && (
                    <p className="mb-4 text-center text-sm text-white/80">
                        {helper}
                    </p>
                )}

                {isLoading ? (
                    <div className="text-center py-8 text-gray-200">
                        <p>Loading market data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="mt-6 rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-xl text-gray-900">
                        <div className="overflow-x-auto">
                            <table className="w-full table-auto border-collapse">
                                <thead>
                                <tr className="border-b border-gray-200 text-sm uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-3 text-left">Watch</th>
                                    <th className="px-4 py-3 text-left">Name</th>
                                    <th className="px-4 py-3 text-left">Symbol</th>
                                    <th className="px-4 py-3 text-right">Current Price</th>
                                    <th className="px-4 py-3 text-right">24h</th>
                                    <th className="px-4 py-3 text-right">Market Cap</th>
                                    <th className="px-4 py-3 text-right">Trade Volume</th>
                                </tr>
                                </thead>
                                <tbody className="text-sm">
                                {filteredCoins.map((coin) => (
                                    <tr
                                        key={coin.id}
                                        className="cursor-pointer transition hover:bg-gray-100/70"
                                        onClick={() => {
                                            ViewDetail(coin.symbol);
                                        }}
                                    >
                                        <td
                                            className="px-4 py-3"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <WatchStar symbol={coin.symbol} name={coin.name} />
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                                                    {coin.symbol[0]}
                                                </div>
                                                {coin.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {coin.symbol}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-900">
                                            {coin.price}
                                        </td>
                                        <td
                                            className={`px-4 py-3 text-right font-medium ${
                                                coin.change.startsWith("+")
                                                    ? "text-emerald-600"
                                                    : "text-red-600"
                                            }`}
                                        >
                                            {coin.change}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">
                                            {coin.marketCap}
                                        </td>
                                        <td className="px-4 py-3 text-right text-gray-600">
                                            {coin.volume}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
