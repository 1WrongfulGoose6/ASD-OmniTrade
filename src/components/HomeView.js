// src/components/HomeView.js
'use client';

import React from 'react';
import Link from 'next/link';
import NavBar from '@/components/NavBar';
import PropTypes from 'prop-types';
import WaveBackground from '@/components/WaveBackground';

function funGreeting(nameLike) {
  if (!nameLike) return "Welcome to OmniTrade";
  const name = String(nameLike).split('@')[0];
  const options = [
    `Hey ${name}, ready to outsmart the market? 📈`,
    `Welcome back, ${name}! Let's make some moves. 🚀`,
    `${name}, your portfolio called—it wants a win today. 💪`,
    `Good to see you, ${name}. Charts are looking spicy. 🌶️`,
    `Let’s trade smart, ${name}. Onward! 🧭`,
  ];
  const idx = Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % options.length;
  return options[idx];
}

export default function HomeView({ news = [] }) {
  const top = news.slice(0, 3);

  const [user, setUser] = React.useState(null);
  const [watch, setWatch] = React.useState([]);
  const [watchRows, setWatchRows] = React.useState([]);
  const [watchErr, setWatchErr] = React.useState(null);

  async function loadMe() {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      const data = await res.json();
      setUser(data.user || null);
    } catch {
      setUser(null);
    }
  }

  // Who's logged in? + react to global auth changes
  React.useEffect(() => {
    let off = false;
    (async () => { if (!off) await loadMe(); })();
    const onAuth = () => loadMe();
    window.addEventListener('auth:changed', onAuth);
    return () => { off = true; window.removeEventListener('auth:changed', onAuth); };
  }, []);

  // Load & sync local watchlist (client-side storage)
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
      setWatchErr(null);
      try {
        if (!watch.length) { setWatchRows([]); return; }

        const res = await fetch('/api/marketdata', { cache: 'no-store' });
        if (!res.ok) throw new Error(`marketdata ${res.status}`);
        const all = await res.json();

        const setSymbols = new Set(
          watch.map(w => (w.symbol || '').toUpperCase())
        );

        const filtered = (Array.isArray(all) ? all : []).filter(
          r => setSymbols.has((r.symbol || '').toUpperCase())
        );

        if (!cancelled) setWatchRows(filtered);
      } catch (e) {
        if (!cancelled) {
          setWatchErr(e.message || 'Failed to load watchlist quotes');
          setWatchRows([]);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [watch]);

  const headline = funGreeting(user?.name || user?.email);

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      {/* Hero */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-20 text-center">
        <h1 className="mx-auto max-w-4xl text-6xl font-bold leading-tight drop-shadow">
          {headline}
        </h1>
        <div className="mt-8">
          <Link href="/portfolio" className="inline-block rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 shadow hover:bg-blue-50">
            View Portfolio
          </Link>
        </div>
      </section>

      {/* Watchlist quick view */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pt-10">
        <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your Watchlist</h2>
            <Link href="/watchlist" className="text-sm font-medium text-blue-700 hover:underline">
              Open watchlist →
            </Link>
          </div>

          {watchErr ? (
            <p className="mt-3 text-sm text-red-700">{watchErr}</p>
          ) : watch.length === 0 ? (
            <p className="mt-3 text-sm text-gray-600">
              You haven’t added any tickers yet. Visit{' '}
              <Link href="/market-data-display" className="text-blue-600 underline">Stocks</Link>
              {' '}and tap the ⭐ to add some.
            </p>
          ) : (
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {watchRows.slice(0, 6).map((row) => {
                const change = (row.change ?? row.change24h ?? '').toString();
                const isUp = change.trim().startsWith('+') || Number(row.change ?? 0) > 0;
                return (
                  <li key={row.symbol} className="rounded-lg bg-white/70 p-4">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/market-data-display/detail/${row.symbol}`}
                        className="font-semibold hover:underline"
                      >
                        {row.symbol}{row.name ? ` — ${row.name}` : ''}
                      </Link>
                      <div className="text-right">
                        <div className="text-sm text-gray-900">
                          {row.price ?? row.currentPrice ?? '—'}
                        </div>
                        <div className={`text-xs font-medium ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                          {change || '—'}
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      {/* Content cards */}
      <section className="relative z-10 mx-auto max-w-6xl px-8 pb-24 pt-16">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Market News */}
          <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
            <h2 className="text-lg font-semibold">Market News</h2>
            <ul className="mt-4 space-y-3 text-sm text-gray-700">
              {top.length > 0 ? top.map((n) => (
                <li key={n.id} className="rounded-md bg-white/60 p-3">
                  <a href={n.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                    • {n.headline}
                  </a>
                  <div className="mt-1 text-xs text-gray-500">
                    {n.source ? `${n.source} • ` : ''}
                    {n.datetime ? new Date(n.datetime * 1000).toLocaleDateString() : ''}
                  </div>
                </li>
              )) : (
                <li className="rounded-md bg-white/60 p-3">• No headlines right now</li>
              )}
            </ul>
            <div className="mt-6">
              <Link href="/news" className="text-sm font-medium text-blue-700 hover:underline">
                View all news →
              </Link>
            </div>
          </div>

          {/* Trending Stocks (simple placeholder) */}
          <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
            <h2 className="text-lg font-semibold">Trending Stocks</h2>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-md bg-white/60 p-3">
                <div className="font-medium">AAPL</div>
                <div className="text-gray-600">$172.39</div>
                <div className="text-emerald-600">+1.25%</div>
              </div>
              <div className="rounded-md bg-white/60 p-3">
                <div className="font-medium">MSFT</div>
                <div className="text-gray-600">$310.65</div>
                <div className="text-emerald-600">+0.98%</div>
              </div>
              <div className="rounded-md bg-white/60 p-3">
                <div className="font-medium">AMZN</div>
                <div className="text-gray-600">$153.76</div>
                <div className="text-red-600">-0.74%</div>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/market-data-display" className="text-sm font-medium text-blue-700 hover:underline">
                Explore stocks →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

HomeView.propTypes = {
  news: PropTypes.any,
};
