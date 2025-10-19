'use client';

import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import WaveBackground from '@/components/WaveBackground';
import fetchTradeBacklog from '@/app/trade-backlog/lib/fetchTradeBacklog';
import { convertToCSV, downloadCSV } from '@/app/trade-backlog/lib/csv';

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

const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) callback();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [ref, callback]);
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
    dateRange: { from: null, to: null },
  });

  const datePickerRef = useRef(null);
  useOutsideClick(datePickerRef, () => {
    if (showDatePicker) setShowDatePicker(false);
  });

  const range = filters?.dateRange ?? { from: null, to: null };

  // ---- fetch trades ----
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
      } finally {
        setIsLoading(false);
      }
    };
    fetchTradeBacklogClient();
  }, []);

  // ---- filter logic ----
  useEffect(() => {
    let filtered = Array.isArray(allTradesData) ? [...allTradesData] : [];
    let warn = null;

    const query = filters.searchQuery.trim();

    // 🔸 Warn for invalid input
    if (/\d/.test(query)) {
      warn = 'Search should not contain numbers.';
      filtered = [];
    } else if (query.length > 6) {
      warn = 'Search query too long (max 6 characters).';
      filtered = [];
    } else if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(
          (t) =>
              String(t.asset || '').toLowerCase().includes(q) ||
              String(t.id || '').toLowerCase().includes(q)
      );
      if (filtered.length === 0) {
        warn = 'No trades found matching your search.';
      }
    }

    // Trade type
    if (filters.tradeType !== 'All') {
      filtered = filtered.filter((t) => t.type === filters.tradeType);
    }

    // Date range
    const { from, to } = filters.dateRange || {};
    if (from) {
      const fromDate = new Date(from);
      const toDate = to ? new Date(to) : new Date(from);
      if (to && fromDate > toDate) {
        warn = "Invalid date range: 'From' date cannot be after 'To' date.";
        filtered = [];
      } else {
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter((t) => {
          const td = new Date(t.date);
          return td >= fromDate && td <= toDate;
        });
      }
    }

    setTrades(filtered);
    setValidationWarning(warn);
  }, [filters, allTradesData]);

  // ---- handlers ----
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters((prev) => ({ ...prev, searchQuery: value }));
  };

  const handleTradeTypeChange = (e) => {
    setFilters((prev) => ({ ...prev, tradeType: e.target.value }));
  };

  const handleDateChange = (r) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: { from: r?.from ?? null, to: r?.to ?? null },
    }));
  };

  const handleExportCSV = () => {
    if (!trades.length) {
      setValidationWarning('Cannot export: No trades found matching current filters.');
      return;
    }
    const csv = convertToCSV(trades);
    const ts = format(new Date(), 'yyyyMMdd_HHmmss');
    downloadCSV(csv, `Trade_Backlog_${ts}`);
  };

  // ---- render ----
  if (isLoading)
    return (
        <main className="flex-col min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
          <NavBar />
          <p className="text-white text-lg font-semibold">Loading trade history...</p>
        </main>
    );

  if (error)
    return (
        <main className="flex-col min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
          <NavBar />
          <p className="text-red-200 text-lg font-semibold">Error: {error}</p>
        </main>
    );

  return (
      <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
        <WaveBackground />
        <NavBar />

        <div className="flex flex-col items-center px-6 md:px-12 lg:px-32 gap-3">
          <div className="w-full flex items-center justify-between p-4 px-8 border-b bg-gray-50 rounded-2xl">
            <Link className="flex items-center gap-2 text-blue-600 hover:text-blue-800" href="/">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Home</span>
            </Link>
            <h1 className="text-2xl font-semibold text-gray-700 text-center">Trade Backlog</h1>
            <div className="w-5" />
          </div>

          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full p-8 text-gray-900">
            {/* Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4 w-full md:w-3/5">
                <input
                    type="text"
                    placeholder="Search by Asset or ID..."
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 shadow-sm"
                    value={filters.searchQuery}
                    onChange={handleSearchChange}
                />
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <label htmlFor="tradeType" className="font-medium text-gray-700 hidden md:block">
                    Type:
                  </label>
                  <select
                      id="tradeType"
                      className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 shadow-sm"
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
                <div className="relative w-full md:w-auto" ref={datePickerRef}>
                  <div
                      onClick={() => setShowDatePicker((v) => !v)}
                      className="relative flex items-center px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400 text-gray-700 shadow-sm cursor-pointer"
                  >
                    <input
                        readOnly
                        className="w-full bg-transparent outline-none cursor-pointer"
                        placeholder="Select date range"
                        value={
                          range.from
                              ? `${format(new Date(range.from), 'PP')} - ${
                                  range.to ? format(new Date(range.to), 'PP') : ''
                              }`
                              : ''
                        }
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
                        />
                      </div>
                  )}
                </div>

                <button
                    onClick={handleExportCSV}
                    className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 transition"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Warning Feedback */}
            {validationWarning && (
                <div className="mb-6 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg font-medium text-sm">
                  ⚠️ {validationWarning}
                </div>
            )}

            {/* Table */}
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
                        <tr key={trade.id} className="hover:bg-gray-100 transition">
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
