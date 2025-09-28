import {ArrowLeft} from "lucide-react"; // using lucide-react for icons
import React, {useState, useEffect} from "react";
import Link from "next/link";
import GraphSection from "@/app/market-data-display/detail/[stockSymbol]/components/graphSection";
import PropTypes from 'prop-types';

export default function MainSection({stockSymbol}) {
    // 1. State for data and status
    const [stockData, setStockData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. useEffect hook for data fetching
    useEffect(() => {
        if (!stockSymbol) {
            setError("No stock symbol provided.");
            setIsLoading(false);
            return;
        }

        const fetchStockDetail = async () => {
            setIsLoading(true);
            setError(null);

            // Construct the API endpoint URL using the dynamic parameter
            const apiUrl = `/api/marketdata/detail/${stockSymbol}`;

            try {
                const response = await fetch(apiUrl);

                if (!response.ok) {
                    // Get the error message from the server response if available
                    const errorBody = await response.json().catch(() => ({ error: 'Unknown server error' }));
                    throw new Error(`Failed to fetch data: ${errorBody.error || response.statusText}`);
                }

                const data = await response.json();
                setStockData(data);

            } catch (err) {
                console.error("Fetch error:", err);
                setError(err.message || "An unexpected error occurred while fetching data.");
                setStockData(null); // Clear old data on error
            } finally {
                setIsLoading(false);
            }
        };

        fetchStockDetail();
        // Re-run the effect whenever the stockSymbol prop changes
    }, [stockSymbol]);

    if (isLoading) {
        return <div className="text-center p-8 text-blue-500">Loading stock details for **{stockSymbol}**...</div>;
    }

    if (error) {
        return <div className="text-center p-8 text-red-600">Error: {error}</div>;
    }

    if (!stockData || !stockData.name) {
        return <div className="text-center p-8 text-gray-500">No data found for **{stockSymbol}**.</div>;
    }

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
                        {stockData.symbol + " - " + stockData.name}
                    </span>
                    <span className="text-green-600 font-bold flex items-end">{stockData.currentPrice}</span>
                </div>

                {/* Buttons - links to trade order form (Ashwin)*/}
                <div className="flex flex-row gap-4 ">
                    <Link
                        href={{
                            pathname: "/trade", // or wherever your order form page lives
                            query: {
                                symbol: stockData.symbol,
                                name: stockData.name,
                                price: stockData.currentPrice,
                            },
                        }}
                        className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-xl shadow-md hover:bg-blue-600 transition"
                    >
                        Trade
                    </Link>
                </div>
            </div>

            {/* Bottom section (empty for now) */}
            <div className="flex-1 bg-white rounded-2xl p-8 overflow-hidden">
                <GraphSection data={stockData.historicalData} />

                {/* Description Section */}
                <div className="mt-6 border-t border-gray-200">
                    <p className="text-gray-700">
                        {stockData.description}
                    </p>
                </div>
            </div>
        </div>
    );
}

MainSection.propTypes = {
    // Define that 'stockSymbol' must be a string and is required
    stockSymbol: PropTypes.string.isRequired,
};
