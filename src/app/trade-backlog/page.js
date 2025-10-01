// src/app/trade-backlog/page.js
'use client';

import React, { useState, useEffect, useRef } from 'react';
import NavBar from '@/components/NavBar';
import { ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import WaveBackground from '@/components/WaveBackground';
import fetchTradeBacklog from '@/app/trade-backlog/lib/fetchTradeBacklog';

// ---- helpers ----
function fmtDateSafe(value) {
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value ?? '');
    return format(d, 'PP p'); // e.g. "Oct 1, 2025 3:42 PM"
  } catch {
    return String(value ?? '');
  }
}

// click-outside helper
const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) callback();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
};

// CSV helpers
const convertToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const headerRow = headers.join(',');
  const dataRows = data.map((row) =>
    headers
      .map((field) => {
        let v = row[field];
        if (typeof v === 'string' && (v.includes(',') || v.includes('\n') || v.includes('"'))) {
          v = `"${v.replace(/"/g, '""')}"`;
        }
        return v;
      })
      .join(',')
  );
  return [headerRow, ...dataRows].join('\n');
};

const downloadCSV = (csvString, fileName) => {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.setAttribute('download', `${fileName}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// ---- page ----
export default function TradeBacklog() {
  const [allTradesData, setAllTradesData] = useState([]);
  const [trades, setTrades] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validationWarning, setValidationWarning] = useState(null);

  const [filters, setFilters] = useState({
    searchQuery: '',
    tradeType: 'All',
    dateRange: { from: null, to: null }, // safe shape
  });

  const datePickerRef = useRef(null);
  useOutsideClick(datePickerRef, () => {
    if (showDatePicker) setShowDatePicker(false);
  });

  // derive once for rendering
  const range = filters?.dateRange ?? { from: null, to: null };

  // 1) fetch data once
  useEffect(() => {
    const fetchTradeBacklogClient = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data, error } = await fetchTradeBacklog();
        if (error) throw error;
        setAllTradesData(data || []);
        setTrades(data || []);
      } catch (err) {
        console.error('trade-backlog fetch error:', err);
        setError(err.message || 'Could not load trade history.');
        setAllTradesData([]);
        setTrades([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTradeBacklogClient();
  }, []);

  // 2) apply filters
  useEffect(() => {
    let filtered = Array.isArray(allTradesData) ? [...allTradesData] : [];
    let warn = validationWarning;

    // Search
    if (filters.searchQuery) {
      const valid = /^[a-z0-9\s-]*$/i.test(filters.searchQuery);
      if (valid) {
        const q = filters.searchQuery.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            String(t.asset || '').toLowerCase().includes(q) ||
            String(t.id || '').toLowerCase().includes(q)
        );
        if (warn?.includes('search query')) warn = null;
      } else {
        if (!warn || !warn.includes('search query')) {
          warn = 'Invalid search query: Please use only letters, numbers, spaces, and hyphens.';
        }
        filtered = [];
      }
    } else if (warn?.includes('search query')) {
      warn = null;
    }

    // Trade type
    if (filters.tradeType !== 'All') {
      filtered = filtered.filter((t) => t.type === filters.tradeType);
    }

    // Date range
    const { from, to } = filters?.dateRange ?? { from: null, to: null };
    if (from) {
      const fromDate = new Date(from);
      if (to && fromDate > new Date(to)) {
        warn = "Invalid date range: 'From' date cannot be after 'To' date.";
        filtered = [];
      } else {
        const toDate = to ? new Date(to) : new Date(fromDate);
        if (to) {
          toDate.setHours(23, 59, 59, 999);
        } else {
          fromDate.setHours(0, 0, 0, 0);
          toDate.setHours(23, 59, 59, 999);
        }
        filtered = filtered.filter((t) => {
          const td = new Date(t.date);
          return td >= fromDate && td <= toDate;
        });
        if (warn?.includes('date range')) warn = null;
      }
    } else if (warn?.includes('date range')) {
      warn = null;
    }

    setTrades(filtered);
    setValidationWarning(warn);
  }, [filters, allTradesData]);

  // handlers
  const handleSearchChange = (e) => {
    const value = e.target.value;
    const ok = /^[a-z0-9\s-]*$/i.test(value);
    setFilters((prev) => ({ ...prev, searchQuery: value }));
    if (ok) setValidationWarning(null);
    else
      setValidationWarning(
        'Invalid search query: Please use only letters, numbers, spaces, and hyphens.'
      );
  };

  const handleTradeTypeChange = (e) => {
    setFilters((prev) => ({ ...prev, tradeType: e.target.value }));
    if (validationWarning && (validationWarning.includes('search query') || validationWarning.includes('date range'))) {
      setValidationWarning(null);
    }
  };

  const handleDateChange = (r) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        from: r?.from ?? null,
        to: r?.to ?? null,
      },
    }));
  };

  const handleExportCSV = () => {
    if (!trades.length) {
      setValidationWarning('Cannot export: No trades found matching the current filters.');
      return;
    }
    setValidationWarning(null);
    const csv = convertToCSV(trades);
    const ts = format(new Date(), 'yyyyMMdd_HHmmss');
    downloadCSV(csv, `Trade_Backlog_${ts}`);
  };

  // render states
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
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      <div className="flex items-center flex-col px-6 md:px-12 lg:px-32 gap-3">
        <div className="w-full flex items-center justify-between p-4 px-8 border-b bg-gray-50 rounded-2xl">
          <Link className="flex items-center gap-2 text-blue-600 hover:text-blue-800" href={'/public'}>
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Home</span>
          </Link>
          <h1 className="text-2xl font-semibold text-gray-700 text-center">Trade Backlog</h1>
          <div className="w-5" />
        </div>

        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full p-8 text-gray-900">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            {/* Left: search + type */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-3/5">
              <input
                type="text"
                placeholder="Search by Asset or ID..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
                value={filters.searchQuery}
                onChange={handleSearchChange}
              />
              <div className="flex items-center gap-2 w-full md:w-auto">
                <label htmlFor="tradeType" className="font-medium text-gray-700 hidden md:block">
                  Type:
                </label>
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

            {/* Right: date + export */}
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-2/5 justify-end">
              <div className="flex items-center gap-2 w-full md:w-auto relative" ref={datePickerRef}>
                <label htmlFor="dateRange" className="font-medium text-gray-700 hidden md:block">
                  Date:
                </label>
                <div
                  className="relative w-full cursor-pointer flex items-center px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
                  onClick={() => setShowDatePicker((v) => !v)}
                >
                  <input
                    id="dateRange"
                    type="text"
                    className="w-full bg-transparent outline-none cursor-pointer"
                    placeholder="Select date range"
                    value={
                      range.from
                        ? `${format(new Date(range.from), 'PP')} - ${
                            range.to ? format(new Date(range.to), 'PP') : ''
                          }`
                        : ''
                    }
                    readOnly
                  />
                  <Calendar className="w-5 h-5 text-gray-400 absolute right-3" />
                </div>

                {showDatePicker && (
                  <div className="absolute top-full right-0 z-10 mt-2 bg-white rounded-lg shadow-lg p-2">
                    <DayPicker
                      mode="range"
                      selected={filters.dateRange}
                      onSelect={handleDateChange}
                      showOutsideDays
                      styles={{
                        caption: { color: '#111827' }, // gray-900
                        head_cell: { color: '#374151', fontWeight: 600 }, // gray-700
                        day: { color: '#111827' },
                        day_outside: { color: '#9CA3AF' }, // gray-400
                        day_today: { border: '1px solid #2563EB' }, // blue-600
                        day_selected: { backgroundColor: '#2563EB', color: 'white' },
                        day_range_start: { backgroundColor: '#2563EB', color: 'white' },
                        day_range_end: { backgroundColor: '#2563EB', color: 'white' },
                        day_range_middle: { backgroundColor: '#DBEAFE', color: '#1F2937' }, // blue-100 / gray-800
                        nav_button_next: { color: '#374151' },
                        nav_button_prev: { color: '#374151' },
                        months: { background: 'white', borderRadius: 12, padding: 8 },
                      }}
                    />
                  </div>
                )}
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition duration-150 focus:outline-none focus:ring-2 focus:ring-green-400"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* warning */}
          {validationWarning && (
            <div className="mb-6 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg font-medium text-sm">
              ⚠️ {validationWarning}
            </div>
          )}

          {/* table */}
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
                          trade.type === 'Buy' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {trade.type}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {Number(trade.amount).toLocaleString('en-AU', {
                          style: 'currency',
                          currency: 'AUD',
                        })}
                      </td>
                      <td className="py-4 px-4 text-right">{trade.status}</td>
                      <td className="py-4 px-4 text-right">{fmtDateSafe(trade.date)}</td>
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
