"use client";

import React from "react";
import MainSection from "@/app/market-data-display/detail/components/mainSection";
import NewsSection from "@/app/market-data-display/detail/components/newsSection";
import {useRightPanel} from "@/app/market-data-display/detail/hooks/useRightPanel";
import NewsSectionMinimize from "@/app/market-data-display/detail/components/newsSectionMinimize"; // icon for minimize

export default function MarketDetail() {
    const {showRight, } = useRightPanel();

    return (
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-500 to-blue-200">
            {/* Left Section */}
            <div
                className={`transition-all duration-500 ease-in-out ${
                    showRight ? "basis-7/10" : "basis-full"
                } p-4 pr-0`}
            >
                <MainSection/>
            </div>

            {/* Right Section */}
            {showRight? (
                <div className="basis-3/10 p-4 transition-all">
                    <NewsSection/>
                </div>
            ) : (
                <div className="w-fit p-4 transition-all">
                    <NewsSectionMinimize/>
                </div>
            )}
        </div>
    );
}
