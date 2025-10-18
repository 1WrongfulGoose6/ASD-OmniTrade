// src/components/WatchStar.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

// Helper to get a cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchWatchlist() {
  const res = await fetch('/api/watchlist', { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return Array.isArray(data.items) ? data.items : [];
}

export default function WatchStar({ symbol, name }) {
  const sym = String(symbol || '').toUpperCase();
  const [watched, setWatched] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    let off = false;
    (async () => {
      const items = await fetchWatchlist();
      if (!off) setWatched(items.some(i => i.symbol?.toUpperCase() === sym));
    })();
    return () => { off = true; };
  }, [sym]);

  const toggle = async (e) => {
    e?.stopPropagation?.();
    if (!sym || busy) return;

    setWatched(v => !v); // optimistic
    setBusy(true);
    try {
      const res = await fetch('/api/watchlist/toggle', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'X-CSRF-Token': getCookie('csrf-token'),
        },
        body: JSON.stringify({ symbol: sym, name }),
      });
      if (!res.ok) setWatched(v => !v); // revert on failure
      window.dispatchEvent(new Event('watchlist:changed'));
    } catch {
      setWatched(v => !v); // revert
    } finally {
      setBusy(false);
    }
  };

  // Pure icon; filled when watched, outline otherwise.
  // No circular background.
  const iconClass = "h-5 w-5 transition-transform";
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={watched}
      className="p-1 hover:scale-110 active:scale-95"
      title={watched ? "Unwatch" : "Watch"}
    >
      <Star
        className={iconClass + " text-blue-600"}
        stroke="currentColor"
        fill={watched ? "currentColor" : "none"}
      />
    </button>
  );
}

WatchStar.propTypes = {
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string,
};
