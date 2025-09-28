// src/components/WatchStar.js
'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { addToWatchlist, removeFromWatchlist, isWatched } from '@/lib/watchlist';
import PropTypes from 'prop-types';

export default function WatchStar({ symbol, name, className = '' }) {
  const [watched, setWatched] = React.useState(false);

  React.useEffect(() => {
    setWatched(isWatched(symbol));
    const onChange = () => setWatched(isWatched(symbol));
    window.addEventListener('watchlist:changed', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('watchlist:changed', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, [symbol]);

  const toggle = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    if (watched) {
      removeFromWatchlist(symbol);
      setWatched(false);
    } else {
      addToWatchlist(symbol, name);
      setWatched(true);
    }
    window.dispatchEvent(new Event('watchlist:changed'));
  };

  // Icon-only; no text; transparent background
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={watched}
      aria-label={watched ? 'Remove from watchlist' : 'Add to watchlist'}
      className={`inline-flex items-center justify-center rounded-full p-2 transition hover:bg-white/20 focus:outline-none ${className}`}
    >
      {/* not-watched: blue outline; watched: blue filled */}
      {watched ? (
        <Star className="h-5 w-5 text-blue-600 fill-current" />
      ) : (
        <Star className="h-5 w-5 text-blue-600" />
      )}
    </button>
  );
}

WatchStar.propTypes = {
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string,
  className: PropTypes.string,
};
