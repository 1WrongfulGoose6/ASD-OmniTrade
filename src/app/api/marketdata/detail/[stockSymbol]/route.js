// app/api/stock/[stockSymbol]/route.js

import { NextResponse } from 'next/server';

const FINNHUB_API_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

// Helper function to generate a random number within a range
const getRandomInRange = (min, max) => {
    return Math.random() * (max - min) + min;
};

export async function GET(request, { params }) {
    const {stockSymbol} = await params;

    if (!API_KEY) {
        return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    if (!stockSymbol) {
        return NextResponse.json({ error: 'Stock symbol parameter is missing' }, { status: 400 });
    }

    try {
        // 1. Fetch current quote
        const quoteRes = await fetch(`${FINNHUB_API_URL}/quote?symbol=${stockSymbol}&token=${API_KEY}`);
        const quoteData = await quoteRes.json();

        if (quoteData.c === 0 || quoteData.c === null) {
            return NextResponse.json({ error: 'Stock not found or data not available' }, { status: 404 });
        }

        // 2. Fetch company profile (includes name and description)
        const profileRes = await fetch(`${FINNHUB_API_URL}/stock/profile2?symbol=${stockSymbol}&token=${API_KEY}`);
        const profileData = await profileRes.json();

        // Extract required data
        const companyName = profileData.name || 'Unknown Company';
        const stockDescription = profileData.weburl ? `Visit the company website for more details: ${profileData.weburl}` : 'Description not available.'; // Often, a short description field might be empty/missing. Using website URL as a substitute.
        const currentPrice = quoteData.c;

        // Generate 24 hours of random mock data points
        const mockHistoricalData = [];
        let lastPrice = currentPrice * getRandomInRange(0.98, 1.02);

        for (let i = 0; i < 24; i++) {
            const fluctuation = getRandomInRange(-0.02, 0.02);
            lastPrice = lastPrice * (1 + fluctuation);

            if (lastPrice < currentPrice * 0.9) {
                lastPrice = currentPrice * 0.9;
            }

            const hour = (i + 10) % 24;
            const timeString = `${hour.toString().padStart(2, '0')}:00`;

            mockHistoricalData.push({
                time: timeString,
                price: parseFloat(lastPrice.toFixed(2))
            });
        }

        // Add the current price as the last point
        mockHistoricalData.push({
            time: "Now",
            price: currentPrice
        });

        // Format the final response with the added description
        const responseData = {
            name: companyName,
            description: stockDescription,
            currentPrice: `$${currentPrice.toFixed(2)}`,
            historicalData: mockHistoricalData.map(item => ({
                time: item.time,
                price: item.price
            })),
            symbol: stockSymbol,
        };

        return NextResponse.json(responseData);
    } catch (error) {
        console.error('Error fetching data from Finnhub:', error);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}