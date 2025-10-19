'use client';

import React from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';
import NavBar from '@/components/NavBar';
import WaveBackground from '@/components/WaveBackground';
import { useAuth } from '@/components/providers/AuthProvider';
import { formatEpochDateShort } from '@/lib/formatUtc';

function funGreeting(nameLike) {
  if (!nameLike) return 'Welcome to OmniTrade';
  const name = String(nameLike).split('@')[0];
  const options = [
    `Hey ${name}, ready to outsmart the market?`,
    `Welcome back, ${name}! Let's make some moves.`,
    `${name}, your portfolio called—it wants a win today.`,
    `Good to see you, ${name}. Charts are looking spicy.`,
    `Let’s trade smart, ${name}. Onward!`,
  ];
  const idx = Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % options.length;
  return options[idx];
}

export default function HomeView({
  news = [],
  initialWatchItems = [],
  trending = [],
}) {
  const { user } = useAuth();
  const top = news.slice(0, 3);

  const [watchItems, setWatchItems] = React.useState(initialWatchItems);
  const [watchErr, setWatchErr] = React.useState(null);
  const [watchLoading, setWatchLoading] = React.useState(false);

  const prefetched = React.useRef(initialWatchItems.length > 0);

  const loadWatchlist = React.useCallback(async () => {
    setWatchLoading(true);
    setWatchErr(null);
    try {
      const res = await fetch('/api/watchlist', { cache: 'no-store' });
      if (res.status === 401) {
        setWatchItems([]);
        setWatchErr(null);
        return;
      }
      if (!res.ok) throw new Error(`watchlist ${res.status}`);
      const data = await res.json().catch(() => ({}));
      const items = Array.isArray(data.items) ? data.items : [];
      setWatchItems(items);
    } catch (error) {
      setWatchErr(error.message || 'Failed to load watchlist');
      setWatchItems([]);
    } finally {
      setWatchLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (prefetched.current) {
      prefetched.current = false;
    } else {
      loadWatchlist();
    }

    const onChanged = () => loadWatchlist();
    window.addEventListener('watchlist:changed', onChanged);
    return () => window.removeEventListener('watchlist:changed', onChanged);
  }, [loadWatchlist]);

  const headline = funGreeting(user?.name || user?.email);
  const hasWatch = watchItems.length > 0;

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
          <Link
            href="/portfolio"
            className="inline-block rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-700 shadow hover:bg-blue-50"
          >
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

          {watchLoading && (
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <li key={idx} className="rounded-lg bg-white/70 p-4">
                  <div className="flex animate-pulse items-center justify-between gap-4">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="flex flex-col items-end gap-2">
                      <div className="h-4 w-12 rounded bg-gray-200" />
                      <div className="h-3 w-10 rounded bg-gray-200" />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {!watchLoading && watchErr && (
            <p className="mt-3 text-sm text-red-700">{watchErr}</p>
          )}

          {!watchLoading && !watchErr && !hasWatch && (
            <p className="mt-3 text-sm text-gray-600">
              You haven’t added any tickers yet. Visit{' '}
              <Link href="/market-data-display" className="text-blue-600 underline">
                Stocks
              </Link>{' '}
              and tap the ⭐ to add some.
            </p>
          )}

          {!watchLoading && !watchErr && hasWatch && (
            <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {watchItems.slice(0, 6).map((row) => {
                const change = (row.change ?? '').toString();
                const isUp = change.trim().startsWith('+') || Number(row.changePercent ?? 0) > 0;
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
                          {row.price != null ? `$${Number(row.price).toFixed(2)}` : '—'}
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
              {top.length > 0 ? (
                top.map((n) => (
                  <li key={n.id} className="rounded-md bg-white/60 p-3">
                    <a
                      href={n.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:underline"
                    >
                      • {n.headline}
                    </a>
                    <div className="mt-1 text-xs text-gray-500">
                      {n.source ? `${n.source} • ` : ''}
                      {n.datetime ? formatEpochDateShort(n.datetime) : ''}
                    </div>
                  </li>
                ))
              ) : (
                <li className="rounded-md bg-white/60 p-3">• No headlines right now</li>
              )}
            </ul>
            <div className="mt-6">
              <Link href="/news" className="text-sm font-medium text-blue-700 hover:underline">
                View all news →
              </Link>
            </div>
          </div>

          {/* Trending Stocks */}
          <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
            <h2 className="text-lg font-semibold">Trending Stocks</h2>
            {trending.length === 0 ? (
              <p className="mt-3 text-sm text-gray-600">
                We couldn’t load trending data right now. Check back soon.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {trending.slice(0, 4).map((item) => {
                  const change = (item.change ?? '').toString();
                  const isUp = change.trim().startsWith('+') || Number(item.changePercent ?? 0) > 0;
                  return (
                    <Link
                      key={item.symbol}
                      href={`/market-data-display/detail/${item.symbol}`}
                      className="rounded-md bg-white/60 p-3 transition hover:bg-white/80"
                    >
                      <div className="font-medium">{item.symbol}</div>
                      <div className="text-sm text-gray-600">{item.name}</div>
                      <div className="mt-2 text-gray-900">
                        {item.price != null ? `$${Number(item.price).toFixed(2)}` : '—'}
                      </div>
                      <div className={`text-sm font-semibold ${isUp ? 'text-emerald-600' : 'text-red-600'}`}>
                        {change || '—'}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
            <div className="mt-6">
              <Link
                href="/market-data-display"
                className="text-sm font-medium text-blue-700 hover:underline"
              >
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
  news: PropTypes.array,
  initialWatchItems: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      name: PropTypes.string,
      price: PropTypes.number,
      change: PropTypes.string,
      changePercent: PropTypes.number,
    })
  ),
  trending: PropTypes.arrayOf(
    PropTypes.shape({
      symbol: PropTypes.string.isRequired,
      name: PropTypes.string,
      price: PropTypes.number,
      change: PropTypes.string,
      changePercent: PropTypes.number,
    })
  ),
};
