'use client'

import React from "react";
import {useRightPanel} from "@/app/market-data-display/detail/hooks/useRightPanel";
import { ChevronRight } from "lucide-react"; // icon for minimize

export default function NewsSection() {
    const {setShowRight} = useRightPanel();
    // Fake news data
    const news = [
        {
            id: 1,
            title: "Apple shares rise after strong iPhone 15 sales",
            time: "2h ago",
        },
        {
            id: 2,
            title: "Tesla expands into India with new gigafactory plans",
            time: "4h ago",
        },
        {
            id: 3,
            title: "Amazon beats earnings expectations, stock jumps 8%",
            time: "6h ago",
        },
        {
            id: 4,
            title: "Nvidia unveils next-gen GPU, market reacts positively",
            time: "1d ago",
        },
        {
            id: 5,
            title: "Microsoft announces partnership with OpenAI",
            time: "2d ago",
        },
    ];

    return (
        <div className="h-full flex flex-col bg-white rounded-2xl shadow overflow-hidden px-4">
            {/* Header */}
            <div className="flex items-center justify-between pr-4 py-3 border-b bg-gray-50">
                {/* Left: Minimize Button */}
                <button
                    onClick={()=>{setShowRight(false)}}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    <ChevronRight className="w-5 h-5 text-gray-700"/>
                </button>

                {/* Right: Title */}
                <h2 className="text-lg font-semibold text-gray-800 ml-auto">
                    Market News
                </h2>
            </div>

            {/* News List */}
            <div className="flex-1 overflow-y-auto divide-y">
                {news.map((item) => (
                    <div key={item.id} className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-medium text-gray-900">{item.title}</p>
                        <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
