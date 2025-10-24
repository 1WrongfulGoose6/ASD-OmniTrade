'use client'

import React from "react";
import {useRightPanel} from "@/app/market-data-display/detail/[stockSymbol]/hooks/useRightPanel";
import {ChevronDown} from "lucide-react"; // icon for minimize

export default function NewsSectionMinimize() {
    const {setShowRight} = useRightPanel();
    // Fake news data
    return (
        <div className="w-12 h-full flex flex-col bg-white rounded-2xl justify-center shadow overflow-hidden">
            {/* Header */}
            <div className="w-full flex flex-row items-center justify-center bg-gray-50 transform rotate-90 origin-left translate-x-6">
                {/* Left: Minimize Button */}
                <button
                    onClick={() => {
                        setShowRight(true);
                    }}
                    className="p-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    <ChevronDown className="w-5 h-5 text-gray-700"/>
                </button>

                {/* Right: Vertical Title */}
                <h2 className="w-fit text-lg font-semibold text-gray-800 ml-auto whitespace-nowrap ">
                    Market News
                </h2>
            </div>
        </div>
    );
}
