'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import WatchStar from '@/components/WatchStar';
import WaveBackground from '@/components/WaveBackground';

export default function WatchlistPage() {
  const router = useRouter();

  // ✅ state (includes the missing setWatch)
  const [watch, setWatch] = React.useState([]);   // [{symbol, name}]
  const [rows, setRows] = React.useState([]);     // market rows filtered by watchlist
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // ✅ Load watchlist from server (per-user)
  React.useEffect(() => {
    let off = false;

    const load = async () => {
      try {
        const res = await fetch('/api/watchlist', { cache: 'no-store' });
        const data = await res.json().catch(() => ({}));
        const items = Array.isArray(data.items) ? data.items : [];
        const list = items.map(i => ({ symbol: i.symbol, name: i.name || i.symbol }));
        if (!off) setWatch(list);
      } catch {
        if (!off) setWatch([]);        // ← this was throwing when setWatch wasn't defined
      }
    };

    load();

    // refresh when any star toggles elsewhere
    const onChanged = () => load();
    window.addEventListener('watchlist:changed', onChanged);

    return () => {
      off = true;
      window.removeEventListener('watchlist:changed', onChanged);
    };
  }, []);

  // ✅ Fetch market data and filter to watchlist symbols
  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);
      try {
        if (!watch.length) {
          if (!cancelled) { setRows([]); setLoading(false); }
          return;
        }

        const res = await fetch('/api/marketdata', { cache: 'no-store' });
        if (!res.ok) throw new Error(`marketdata ${res.status}`);
        const all = await res.json();

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
      <WaveBackground />
      <NavBar />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-6 pb-16">
        <div className="mb-6 flex items-center justify-between rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md px-4 sm:px-6 py-3">
          <h1 className="text-2xl font-semibold">Watchlist</h1>
          <Link href="/market-data-display" className="text-sm underline">Browse stocks →</Link>
        </div>

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
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
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
                      <td className="px-4 py-3 text-right text-gray-900">
                        {row.price ?? row.currentPrice ?? '-'}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-medium ${
                          (row.change || '').toString().trim().startsWith('+')
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}
                      >
                        {row.change ?? row.change24h ?? '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {row.marketCap ?? '-'}
                      </td>
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
