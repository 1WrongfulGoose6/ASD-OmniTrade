'use client'

import React from "react";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {ArrowLeft} from "lucide-react";

export default function MarketDataList() {
    const router = useRouter();
    // Demo data (you could later replace with API fetch)
    const coins = [
        { id: 1, name: "Bitcoin", symbol: "BTC", price: "$64,520", change: "+2.5%", marketCap: "$1.2T" },
        { id: 2, name: "Ethereum", symbol: "ETH", price: "$3,150", change: "-1.2%", marketCap: "$380B" },
        { id: 3, name: "Cardano", symbol: "ADA", price: "$0.52", change: "+0.8%", marketCap: "$18B" },
        { id: 4, name: "Solana", symbol: "SOL", price: "$132", change: "+4.1%", marketCap: "$56B" },
        { id: 5, name: "Dogecoin", symbol: "DOGE", price: "$0.089", change: "-0.6%", marketCap: "$12B" },
    ];

    function ViewDetail(){
        router.push("/market-data-display/detail");
    }

    return (
        <main className="flex-col min-h-screen bg-gradient-to-br from-blue-500 to-blue-200 flex gap-4 items-center justify-center p-8">
            {/* Top section */}
            <div className="w-full flex items-center justify-between p-4 px-8 border-b bg-gray-50 rounded-2xl">
                {/* Back button */}
                <Link className="flex items-center gap-2 text-blue-600 hover:text-blue-800" href={"/market-data-display/"}>
                    <ArrowLeft className="w-5 h-5"/>
                    <span className="font-medium">Back</span>
                </Link>

                <h1 className="text-2xl font-bold text-gray-800 text-center">
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
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full table-auto border-collapse">
                        <thead>
                        <tr className="text-gray-500 uppercase text-sm tracking-wider border-b border-gray-200">
                            <th className="py-3 px-4 text-left">Name</th>
                            <th className="py-3 px-4 text-left">Symbol</th>
                            <th className="py-3 px-4 text-right">Current Price</th>
                            <th className="py-3 px-4 text-right">24h</th>
                            <th className="py-3 px-4 text-right">Market Cap</th>
                            <th className="py-3 px-4 text-right">Trade Volume</th>
                        </tr>
                        </thead>
                        <tbody>
                        {coins.map((coin) => (
                            <tr
                                key={coin.id}
                                className="transition transform hover:bg-gray-300 cursor-pointer"
                                onClick={() => ViewDetail()}
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
                                <td className="py-4 px-4 text-gray-500 text-right">{coin.volume}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
