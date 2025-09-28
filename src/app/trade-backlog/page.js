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

export default function TradeBacklog() {
  const [trades, setTrades] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const allTrades = [
    { id: '#T12345', asset: 'BTC/USDT', type: 'Buy', amount: '0.5 BTC', status: 'Completed', date: '2025-08-28' },
    { id: '#T12346', asset: 'ETH/USDT', type: 'Sell', amount: '10 ETH', status: 'Pending', date: '2025-08-27' },
    { id: '#T12347', asset: 'ADA/USDT', type: 'Buy', amount: '500 ADA', status: 'Failed', date: '2025-08-25' },
    { id: '#T12348', asset: 'SOL/USDT', type: 'Buy', amount: '5 SOL', status: 'Completed', date: '2025-08-24' },
    { id: '#T12349', asset: 'DOGE/USDT', type: 'Sell', amount: '1000 DOGE', status: 'Completed', date: '2025-08-23' },
  ];

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

  useEffect(() => {
    let filteredTrades = allTrades;

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
      const toDate = filters.dateRange.to ? new Date(filters.dateRange.to) : fromDate;

      filteredTrades = filteredTrades.filter(trade => {
        const tradeDate = new Date(trade.date);
        return tradeDate >= fromDate && tradeDate <= toDate;
      });
    }

    setTrades(filteredTrades);
  }, [filters]);

  const handleSearchChange = (event) => {
    setFilters(prev => ({ ...prev, searchQuery: event.target.value }));
  };

  const handleTradeTypeChange = (event) => {
    setFilters(prev => ({ ...prev, tradeType: event.target.value }));
  };

  const handleDateChange = (range) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  };

  return (
      <main
          className="flex-col min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex gap-4 items-center justify-center px-32"
      >
        {/* Background SVGs and NavBar */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"/>
          </svg>
          <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>
          </svg>
        </div>
        <NavBar />
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
          {/* Filters Section */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search by Asset or ID..."
                className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
                value={filters.searchQuery}
                onChange={handleSearchChange}
            />
            {/* Trade Type Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <label htmlFor="tradeType" className="font-medium text-gray-700">Type:</label>
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
            {/* Date Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto relative" ref={datePickerRef}>
              <label htmlFor="dateRange" className="font-medium text-gray-700">Date:</label>
              <div
                  className="relative w-full cursor-pointer flex items-center px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
                  onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <input
                    id="dateRange"
                    type="text"
                    className="w-full bg-transparent outline-none cursor-pointer"
                    placeholder="Select a date range"
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
                  <div className="absolute top-full z-10 mt-2 bg-white rounded-lg shadow-lg">
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
      </main>
  );
}