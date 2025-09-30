// TradeBacklog.js
'use client'

import React, { useState, useEffect, useRef } from 'react';
import NavBar from "@/components/NavBar";
import { ArrowLeft, Calendar } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DayPicker } from "react-day-picker";
import 'react-day-picker/dist/style.css';

// Custom hook to detect clicks outside of a component
const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, callback]);
};

// Function to convert JSON array to a CSV string
const convertToCSV = (data) => {
  if (data.length === 0) return '';

  // 1. Get the headers (keys from the first object)
  const headers = Object.keys(data[0]);

  // 2. Format the headers row
  const headerRow = headers.join(',');

  // 3. Format the data rows
  const dataRows = data.map(row => {
    return headers.map(fieldName => {
      // Ensure fields containing commas or new lines are quoted
      let field = row[fieldName];
      if (typeof field === 'string' && (field.includes(',') || field.includes('\n'))) {
        // Double-up internal quotes and wrap the whole field in quotes
        field = `"${field.replace(/"/g, '""')}"`;
      }
      return field;
    }).join(',');
  });

  // 4. Combine headers and rows
  return [headerRow, ...dataRows].join('\n');
};

// Function to trigger the download in the browser
const downloadCSV = (csvString, fileName) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url); // Clean up the URL object
};

export default function TradeBacklog() {
  const [allTradesData, setAllTradesData] = useState([]); // Stores the original fetched data
  const [trades, setTrades] = useState([]); // Stores the filtered data displayed in the table
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  // The mock data array is removed, as it's now fetched.

  const [filters, setFilters] = useState({
    searchQuery: '',
    tradeType: 'All',
    dateRange: {
      from: undefined,
      to: undefined,
    },
  });

  // Use the custom hook to close the date picker when clicking outside
  useOutsideClick(datePickerRef, () => {
    if (showDatePicker) {
      setShowDatePicker(false);
    }
  });

  function handleExportCSV(){
    if (trades.length === 0) {
      alert("No trades found matching current criteria to export!");
      return;
    }

    // 1. Convert the filtered JSON data to a CSV string
    const csvData = convertToCSV(trades);

    // 2. Define the file name
    const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
    const fileName = `Trade_Backlog_${timestamp}`;

    // 3. Trigger the download
    downloadCSV(csvData, fileName);
  }

  // -----------------------------------------------------------
  // 1. DATA FETCHING EFFECT (Runs only on mount)
  // -----------------------------------------------------------
  useEffect(() => {
    const fetchTradeBacklog = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Use the new endpoint
        const response = await fetch('/api/tradeBacklog');

        if (!response.ok) {
          throw new Error(`Failed to fetch trades: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        // Store both the raw data and set the displayed trades (before filters apply)
        setAllTradesData(data);
        setTrades(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message || "Could not load trade history.");
        setAllTradesData([]);
        setTrades([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTradeBacklog();
  }, []); // Empty dependency array means this runs once on mount


  // -----------------------------------------------------------
  // 2. FILTERING EFFECT (Runs on filter change)
  // -----------------------------------------------------------
  useEffect(() => {
    // Start with the full, fetched dataset
    let filteredTrades = allTradesData;

    // Apply Search Filter
    if (filters.searchQuery) {
      filteredTrades = filteredTrades.filter(trade =>
          trade.asset.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
          trade.id.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Apply Trade Type Filter
    if (filters.tradeType !== 'All') {
      filteredTrades = filteredTrades.filter(trade => trade.type === filters.tradeType);
    }

    // Apply Date Filter
    if (filters.dateRange.from) {
      const fromDate = new Date(filters.dateRange.from);
      // To ensure the filter includes the whole end day, set the time to 23:59:59
      const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : fromDate;
      if (filters.dateRange.to) {
        toDate.setHours(23, 59, 59, 999);
      } else {
        // If only 'from' is selected, include the whole single day
        fromDate.setHours(0, 0, 0, 0);
        toDate.setHours(23, 59, 59, 999);
      }


      filteredTrades = filteredTrades.filter(trade => {
        // Note: Trade date from API should ideally be converted to Date object
        const tradeDate = new Date(trade.date);
        return tradeDate >= fromDate && tradeDate <= toDate;
      });
    }

    // Update the state for the table
    setTrades(filteredTrades);

  }, [filters, allTradesData]); // Reruns when filters change or when new data is fetched (allTradesData changes)

  const handleSearchChange = (event) => {
    setFilters(prev => ({ ...prev, searchQuery: event.target.value }));
  };

  const handleTradeTypeChange = (event) => {
    setFilters(prev => ({ ...prev, tradeType: event.target.value }));
  };

  const handleDateChange = (range) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  // -----------------------------------------------------------
  // 3. RENDER LOGIC
  // -----------------------------------------------------------

  if (isLoading) {
    return (
        <main className="flex-col min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex gap-4 items-center justify-center px-32">
          <NavBar />
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full p-8 text-center text-blue-600 font-semibold">
            Loading trade history...
          </div>
        </main>
    );
  }

  if (error) {
    return (
        <main className="flex-col min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex gap-4 items-center justify-center px-32">
          <NavBar />
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full p-8 text-center text-red-600 font-semibold">
            Error: {error}
          </div>
        </main>
    );
  }

  return (
      <main
          className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white"
      >
        {/* Background SVGs and NavBar (unchanged) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"/>
          </svg>
          <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
          </svg>
        </div>
        <NavBar />
        <div className={'flex items-center flex-col px-32 gap-3'}>
          <div className="w-full flex items-center justify-between p-4 px-8 border-b bg-gray-50 rounded-2xl">
            <Link className="flex items-center gap-2 text-blue-600 hover:text-blue-800" href={"/"}>
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>
            <h1 className="text-2xl font-semibold text-gray-700 text-center">
              Trade Backlog
            </h1>
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full p-8">
            {/* Filters Section (Modified to include Export button) */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">

              {/* Left Side: Search Bar and Trade Type Filter */}
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-3/5">
                {/* Search Bar */}
                <input
                    type="text"
                    placeholder="Search by Asset or ID..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                />
                {/* Trade Type Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label htmlFor="tradeType" className="font-medium text-gray-700 hidden md:block">Type:</label>
                  <select
                      id="tradeType"
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
                      value={filters.tradeType}
                      onChange={handleTradeTypeChange}
                  >
                    <option value="All">All</option>
                    <option value="Buy">Buy</option>
                    <option value="Sell">Sell</option>
                  </select>
                </div>
              </div>

              {/* Right Side: Date Filter and Export Button */}
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/5 justify-end">
                {/* Date Filter */}
                <div className="flex items-center gap-2 w-full md:w-auto relative" ref={datePickerRef}>
                  <label htmlFor="dateRange" className="font-medium text-gray-700 hidden md:block">Date:</label>
                  <div
                      className="relative w-full cursor-pointer flex items-center px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
                      onClick={() => setShowDatePicker(!showDatePicker)}
                  >
                    <input
                        id="dateRange"
                        type="text"
                        className="w-full bg-transparent outline-none cursor-pointer"
                        placeholder="Select date range"
                        value={
                          filters.dateRange.from
                              ? `${format(filters.dateRange.from, 'PP')} - ${filters.dateRange.to ? format(filters.dateRange.to, 'PP') : ''}`
                              : ''
                        }
                        readOnly
                    />
                    <Calendar className="w-5 h-5 text-gray-400 absolute right-3" />
                  </div>
                  {/* Conditional Rendering for DayPicker */}
                  {showDatePicker && (
                      <div className="absolute top-full right-0 z-10 mt-2 bg-white rounded-lg shadow-lg">
                        <DayPicker
                            mode="range"
                            selected={filters.dateRange}
                            onSelect={handleDateChange}
                            showOutsideDays
                            min={1}
                        />
                      </div>
                  )}
                </div>

                <button
                    onClick={handleExportCSV} // You must define this handler
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
                >
                  Export CSV
                </button>
              </div>
            </div>
            {/* End Filters Section */}
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                <tr className="text-gray-500 uppercase text-sm tracking-wider border-b border-gray-200">
                  <th className="py-3 px-4 text-left">Trade ID</th>
                  <th className="py-3 px-4 text-left">Asset</th>
                  <th className="py-3 px-4 text-left">Type</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Status</th>
                  <th className="py-3 px-4 text-right">Date</th>
                </tr>
                </thead>
                <tbody className="text-gray-700">
                {trades.length > 0 ? (
                    trades.map((trade) => (
                        <tr key={trade.id} className="transition transform hover:bg-gray-100">
                          <td className="py-4 px-4 font-medium">{trade.id}</td>
                          <td className="py-4 px-4">{trade.asset}</td>
                          <td
                              className={`py-4 px-4 font-semibold ${
                                  trade.type === "Buy" ? "text-green-600" : "text-red-600"
                              }`}
                          >
                            {trade.type}
                          </td>
                          <td className="py-4 px-4 text-right">{trade.amount}</td>
                          <td className="py-4 px-4 text-right">{trade.status}</td>
                          <td className="py-4 px-4 text-right">{trade.date}</td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan="6" className="py-4 text-center text-gray-500">
                        No trades found matching your criteria.
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
  );
}