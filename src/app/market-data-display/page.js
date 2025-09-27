'use client'

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import NavBar from "@/components/NavBar";

export default function MarketDataList() {
    const router = useRouter();

    // State to hold the fetched and filtered data
    const [coins, setCoins] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // Asynchronous function to fetch data from the API route
        const fetchMarketData = async () => {
            try {
                // Fetch from your internal API endpoint
                const response = await fetch('/api/marketdata');

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
    }, []); // Empty dependency array ensures this effect runs only once on mount

    // Function to filter coins based on the search term
    const filteredCoins = coins.filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function ViewDetail(symbol) {
        router.push("/market-data-display/detail/"+symbol);
    }

    return (
        <main
            className="flex-col min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex gap-4 items-center justify-center px-32"
        >
            <div className="absolute inset-0 z-0 overflow-hidden">
                <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="currentColor"
                          d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"/>
                </svg>
                <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="currentColor"
                          d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
                </svg>
            </div>

            <NavBar/>

            {/* Top section */}
            <div className="w-full flex items-center justify-between p-4 px-8 border-b bg-gray-50 rounded-2xl">
                {/* Back button */}
                <Link className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                      href={"/market-data-display/"}>
                    <ArrowLeft className="w-5 h-5"/>
                    <span className="font-medium">Back</span>
                </Link>

                <h1 className="text-2xl font-semibold text-gray-700 text-center">
                    Market Data
                </h1>
            </div>
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full p-8">

                {/* Search Bar */}
                <div className="mb-6 flex justify-center">
                    <input
                        type="text"
                        placeholder="Search coin..."
                        className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {isLoading ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Loading market data...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full table-auto border-collapse">
                            <thead>
                            <tr className="text-gray-500 uppercase text-sm tracking-wider border-b border-gray-200">
                                <th className="py-3 px-4 text-left">Name</th>
                                <th className="py-3 px-4 text-left">Symbol</th>
                                <th className="py-3 px-4 text-right">Current Price</th>
                                <th className="py-3 px-4 text-right">24h</th>
                                <th className="py-3 px-4 text-right">Market Cap</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredCoins.map((coin) => (
                                <tr
                                    key={coin.id}
                                    className="transition transform hover:bg-gray-300 cursor-pointer"
                                    onClick={() => ViewDetail(coin.symbol)}
                                >
                                    <td className="py-4 px-4 flex items-center gap-3 text-gray-800 font-semibold">
                                        <div
                                            className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold">
                                            {coin.symbol[0]}
                                        </div>
                                        {coin.name}
                                    </td>
                                    <td className="py-4 px-4 text-gray-500">{coin.symbol}</td>
                                    <td className="py-4 px-4 text-gray-800 text-right">{coin.price}</td>
                                    <td
                                        className={`py-4 px-4 text-right font-medium ${
                                            coin.change.startsWith("+") ? "text-green-600" : "text-red-600"
                                        }`}
                                    >
                                        {coin.change}
                                    </td>
                                    <td className="py-4 px-4 text-gray-500 text-right">{coin.marketCap}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}