import {ArrowLeft} from "lucide-react"; // using lucide-react for icons
import React from "react";
import Link from "next/link";
import GraphSection from "@/app/market-data-display/detail/components/graphSection";

export default function MainSection() {
    return (
        <div className="w-full flex flex-col h-full shadow rounded-2xl overflow-hidden gap-y-2">
            {/* Top section */}
            <div className="flex items-center justify-between p-4 px-8 border-b bg-gray-50 rounded-2xl">
                {/* Back button */}
                <Link className="flex items-center gap-2 text-blue-600 hover:text-blue-800" href={"/market-data-display/"}>
                    <ArrowLeft className="w-5 h-5"/>
                    <span className="font-medium">Back</span>
                </Link>

                {/* Stock Info */}
                <div className="flex flex-row  rounded-2xl gap-5">
                    <span className="text-lg font-semibold text-gray-800">
                        AAPL (Apple Inc.)
                    </span>
                    <span className="text-green-600 font-bold flex items-end">$192.50</span>
                </div>

                {/* Buttons */}
                <div className="flex flex-row gap-4 ">
                    <button
                        className="px-6 py-2 bg-green-500 text-white font-semibold rounded-xl shadow-md hover:bg-green-300 transition">
                        Buy
                    </button>
                    <button
                        className="px-6 py-2 bg-red-500 text-white font-semibold rounded-xl shadow-md hover:bg-red-300 transition">
                        Sell
                    </button>
                </div>
            </div>

            {/* Bottom section (empty for now) */}
            <div className="flex-1 bg-white rounded-2xl p-8 overflow-hidden">
                <GraphSection/>

                {/* Description Section */}
                <div className="mt-6 border-t border-gray-200">
                    <p className="text-gray-700">
                        Here you can add a description of the stock, market analysis, or any
                        other information related to the chart above.
                    </p>
                </div>
            </div>
        </div>
    );
}