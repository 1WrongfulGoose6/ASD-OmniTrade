'use client';

import React from 'react';
import BookmarkButton from '@/components/BookmarkButton';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'omni.bookmarks.v1';

function getBookmarkedIds() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return new Set(arr.map((n) => n.id));
  } catch { return new Set(); }
}

export default function NewsGridClient({ items }) {
  const [mode, setMode] = React.useState('all'); // 'all' | 'bookmarked'
  const [bookmarkedIds, setBookmarkedIds] = React.useState(new Set());

  React.useEffect(() => {
    setBookmarkedIds(getBookmarkedIds());
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setBookmarkedIds(getBookmarkedIds());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const shown = mode === 'all'
    ? items
    : items.filter((n) => bookmarkedIds.has(n.id));

  return (
    <>
      {/* Toggle */}
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => setMode('all')}
          className={`rounded-xl border px-3 py-1 text-sm backdrop-blur
            ${mode === 'all' ? 'bg-white text-blue-700 border-white' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
        >
          All
        </button>
        <button
          onClick={() => setMode('bookmarked')}
          className={`rounded-xl border px-3 py-1 text-sm backdrop-blur
            ${mode === 'bookmarked' ? 'bg-white text-blue-700 border-white' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
        >
          Bookmarked
        </button>
        <span className="text-white/70 text-sm ml-2">
          {mode === 'bookmarked' ? `${shown.length} saved` : `${items.length} headlines`}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {shown.map((n) => (
          <div
            key={n.id}
            className="group relative rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur transition hover:shadow-lg"
          >
            {/* Bookmark in top-right */}
            <div className="absolute right-3 top-3">
              <BookmarkButton item={n} />
            </div>

            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                {n.source ?? 'News'}
              </span>
              <span>{n.datetime ? new Date(n.datetime * 1000).toLocaleString() : ''}</span>
            </div>

            <a
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 block text-xl font-semibold text-gray-900 group-hover:underline"
            >
              {n.headline}
            </a>

            {n.summary ? <p className="mt-2 text-sm text-gray-700">{n.summary}</p> : null}
            <div className="mt-4 text-sm font-medium text-blue-700">Read article ↗</div>
          </div>
        ))}

        {shown.length === 0 && (
          <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
            {mode === 'bookmarked' ? 'No saved articles yet.' : 'No headlines right now.'}
          </div>
        )}
      </div>
    </>
  );
}

NewsGridClient.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      // Add shape details if known, otherwise leave generic
    })
  ).isRequired,
};
