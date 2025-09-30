// app/api/trades/route.js

import { NextResponse } from 'next/server';
import { supabase } from '@/utils/DBClient'; // <-- Import the client

/**
 * Handles GET requests to /api/trades
 * Fetches stock trade history from Supabase PostgreSQL.
 */
export async function GET() {
    // 1. Query the 'stock_trades' table
    // Ordering by 'date' descending to show recent trades first
    const { data: trades, error } = await supabase
        .from('Trade Backlog')
        .select('*') // Selects all columns
        .order('date', { ascending: false });

    // 2. Handle potential errors from Supabase
    if (error) {
        console.error('Supabase fetch error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trades from database' },
            { status: 500 }
        );
    }

    // 3. Return the fetched data
    // The data returned from Supabase is already an array of objects
    return NextResponse.json(trades);
}