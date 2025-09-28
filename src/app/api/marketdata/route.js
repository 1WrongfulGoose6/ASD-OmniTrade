// app/api/marketdata/route.js

import { NextResponse } from 'next/server';

const FINNHUB_API_URL = 'https://finnhub.io/api/v1';
const API_KEY = process.env.FINNHUB_API_KEY;

// A list of Australian stock symbols from the ASX.
// The Finnhub API requires the exchange code (e.g., .AX for Australia)
// and a specific symbology for some markets.
const US_SYMBOLS = [
    'AAPL', // Apple Inc.
    'MSFT', // Microsoft Corp.
    'GOOGL', // Alphabet Inc. (Google)
    'AMZN', // Amazon.com Inc.
    'TSLA'  // Tesla Inc.
];

// Helper function to format market cap and other large numbers
function formatLargeNumber(value) {
    if (value >= 1e12) {
        return `$${(value / 1e12).toFixed(1)}T`;
    }
    if (value >= 1e9) {
        return `$${(value / 1e9).toFixed(1)}B`;
    }
    return `$${value.toFixed(2)}`;
}

export async function GET() {
    if (!API_KEY) {
        return NextResponse.json({ error: 'API key not found' }, { status: 500 });
    }

    try {
        const fetchPromises = US_SYMBOLS.map(symbol =>
            fetch(`${FINNHUB_API_URL}/quote?symbol=${symbol}&token=${API_KEY}`)
        );

        const responses = await Promise.all(fetchPromises);
        const data = await Promise.all(responses.map(res => res.json()));

        // Process and format the data
        const stocks = data.map((item, index) => {
            const symbol = US_SYMBOLS[index];

            // Finnhub's free tier provides a limited 'quote' response.
            // Some data (like market cap) is only available on paid plans.
            // We will use mock data for demonstration purposes.
            const price = item.c; // Current price
            const change = item.dp; // Daily percentage change
            const mockMarketCap = price * 1e9 * (index + 2); // Mock market cap for demonstration

            // Fetch company name separately (this is an extra API call per stock)
            // For simplicity, we will hardcode the names. A better solution would be to
            // store them in a local JSON or use a more comprehensive API endpoint.
            const companyNames = {
                'AAPL': 'Apple Inc.',
                'MSFT': 'Microsoft Corp.',
                'GOOGL': 'Alphabet Inc.',
                'AMZN': 'Amazon.com Inc.',
                'TSLA': 'Tesla Inc.'
            };

            return {
                id: index + 1,
                name: companyNames[symbol],
                symbol: symbol,
                price: `$${price.toFixed(2)}`,
                change: `${change > 0 ? '+' : ''}${change.toFixed(2)}%`,
                marketCap: formatLargeNumber(mockMarketCap),
            };
        });

        return NextResponse.json(stocks);
    } catch (error) {
        console.error('Error fetching data from Finnhub:', error);
        return NextResponse.json({ error: 'Failed to fetch stock data' }, { status: 500 });
    }
}