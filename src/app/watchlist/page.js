// src/app/watchlist/page.js
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import WatchStar from '@/components/WatchStar';

export default function WatchlistPage() {
  const router = useRouter();

  const [watch, setWatch] = React.useState([]);        // [{symbol, name}]
  const [rows, setRows] = React.useState([]);          // market rows filtered by watchlist
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // Load/sync watchlist from helper
  React.useEffect(() => {
    let off = false;

    (async () => {
      const mod = await import('@/lib/watchlist');
      if (off) return;

      const refresh = () => setWatch(mod.readWatchlist());
      refresh();

      const onChange = () => refresh();
      window.addEventListener('watchlist:changed', onChange);
      window.addEventListener('storage', onChange);

      return () => {
        window.removeEventListener('watchlist:changed', onChange);
        window.removeEventListener('storage', onChange);
      };
    })();

    return () => { off = true; };
  }, []);

  // Fetch market data and filter to watchlist symbols
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/marketdata', { cache: 'no-store' });
        if (!res.ok) throw new Error(`marketdata ${res.status}`);
        const all = await res.json(); // expects array like your MarketListPage uses

        const setSymbols = new Set(watch.map(w => (w.symbol || '').toUpperCase()));
        const filtered = (Array.isArray(all) ? all : []).filter(
          r => setSymbols.has((r.symbol || '').toUpperCase())
        );

        if (!cancelled) setRows(filtered);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load market data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [watch]);

  const viewDetail = (symbol) => router.push(`/market-data-display/detail/${symbol}`);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      {/* bg waves */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <svg className="absolute top-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,128L48,133.3C96,139,192,149,288,160C384,171,480,181,576,192C672,203,768,213,864,192C960,171,1056,117,1152,117.3C1248,117,1344,171,1392,197.3L1440,224L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
        </svg>
        <svg className="absolute bottom-0 left-0 h-64 w-full text-white/20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,288L48,266.7C96,245,192,203,288,170.7C384,139,480,117,576,133.3C672,149,768,203,864,224C960,245,1056,235,1152,213.3C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320,480,320,384,320,288,320,192,320,96,320,48,320L0,0Z" />
        </svg>
      </div>

      <NavBar />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-6 pb-16">
        {/* subheader */}
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md px-4 sm:px-6 py-3">
          <h1 className="text-2xl font-semibold">Watchlist</h1>
        </div>

        {/* empty / loading / error states */}
        {loading && (
          <div className="rounded-2xl bg-white/90 p-6 text-gray-900">Loading…</div>
        )}
        {error && (
          <div className="rounded-2xl bg-white/90 p-6 text-red-700">Error: {error}</div>
        )}
        {!loading && !error && watch.length === 0 && (
          <div className="rounded-2xl bg-white/90 p-6 text-gray-900">
            Your watchlist is empty. Visit <Link href="/market-data-display" className="text-blue-700 underline">Stocks</Link>.
          </div>
        )}

        {/* table */}
        {!loading && !error && watch.length > 0 && (
          <div className="mt-2 rounded-2xl bg-white/90 backdrop-blur-md p-6 shadow-xl text-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full table-auto border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 text-sm uppercase tracking-wider text-gray-500">
                    <th className="px-4 py-3 text-left">Watch</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Symbol</th>
                    <th className="px-4 py-3 text-right">Current Price</th>
                    <th className="px-4 py-3 text-right">24h</th>
                    <th className="px-4 py-3 text-right">Market Cap</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {rows.map((row) => (
                    <tr
                      key={row.symbol}
                      className="cursor-pointer transition hover:bg-gray-100/70"
                      onClick={() => viewDetail(row.symbol)}
                    >
                      {/* Star (no separate Remove button) */}
                      <td className="px-4 py-3">
                        <WatchStar symbol={row.symbol} name={row.name} />
                      </td>

                      <td className="px-4 py-3 font-semibold text-gray-900">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-bold">
                            {(row.symbol || '?')[0]}
                          </div>
                          {row.name || row.symbol}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-gray-600">{row.symbol}</td>
                      <td className="px-4 py-3 text-right text-gray-900">{row.price ?? row.currentPrice ?? '-'}</td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          (row.change || '').toString().trim().startsWith('+')
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {row.change ?? row.change24h ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">{row.marketCap ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
