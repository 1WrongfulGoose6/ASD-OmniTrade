// src/components/NewsLoadMore.js
'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import BookmarkButton from './BookmarkButton';
import PropTypes from 'prop-types';
import { read as readStore, isBookmarkKey, getUid } from '@/lib/bookmarksStore';
import { formatEpochDateShort } from '@/lib/formatUtc';

export default function NewsLoadMore({ items = [], initialCount = 8, step = 6 }) {
  const [visible, setVisible] = useState(initialCount);
  const [mode, setMode] = useState('all');       // 'all' | 'bookmarked'
  const [uid, setUid] = useState(null);
  const [bookmarks, setBookmarks] = useState([]); // per-user

  useEffect(() => {
    let alive = true;
    (async () => { if (alive) setUid(await getUid()); })();
    return () => { alive = false; };
  }, []);

  const refreshBookmarks = useCallback(() => {
    setBookmarks(readStore(uid));
  }, [uid]);

  useEffect(() => { refreshBookmarks(); }, [uid, refreshBookmarks]);

  useEffect(() => {
    const onStorage = (e) => { if (isBookmarkKey(e.key)) refreshBookmarks(); };
    const onCustom = () => refreshBookmarks();
    window.addEventListener('storage', onStorage);
    window.addEventListener('bookmark:changed', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('bookmark:changed', onCustom);
    };
  }, [refreshBookmarks]);

  const baseList = Array.isArray(items) ? items : [];
  const source = mode === 'bookmarked' ? bookmarks : baseList;
  const safeSource = Array.isArray(source) ? source : [];
  const shown = useMemo(() => safeSource.slice(0, visible), [safeSource, visible]);

  return (
    <>
      <div className="mb-4 flex items-center gap-3 justify-start">
        <button
          onClick={() => setMode('all')}
          className={`rounded-xl border px-3 py-1 text-sm backdrop-blur transition
            ${mode === 'all' ? 'bg-white text-blue-700 border-white' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
        >
          All
        </button>
        <button
          onClick={() => setMode('bookmarked')}
          className={`rounded-xl border px-3 py-1 text-sm backdrop-blur transition
            ${mode === 'bookmarked' ? 'bg-white text-blue-700 border-white' : 'bg-white/10 text-white border-white/30 hover:bg-white/20'}`}
        >
          Bookmarked
        </button>
        <span className="text-white/80 text-sm ml-2">
          {mode === 'bookmarked' ? `${shown.length} saved` : `${baseList.length} headlines`}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {shown.map((n) => (
          <div
            key={n.id}
            className="group relative rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur transition hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                  {n.source ?? 'News'}
                </span>
                {n.datetime ? (
                  <time dateTime={new Date(n.datetime * 1000).toISOString()} suppressHydrationWarning>
                    {formatEpochDateShort(n.datetime)}
                  </time>
                ) : null}
              </div>
              <BookmarkButton item={n} onChange={refreshBookmarks} />
            </div>

            <a href={n.url} target="_blank" rel="noopener noreferrer"
               className="mt-3 block text-xl font-semibold text-gray-900 group-hover:underline">
              {n.headline}
            </a>
            {n.summary ? <p className="mt-2 text-sm text-gray-700">{n.summary}</p> : null}
            <div className="mt-4 flex items-center justify-between">
              <a href={n.url} target="_blank" rel="noopener noreferrer"
                 className="text-sm font-medium text-blue-700">
                Read article ↗
              </a>
              <div />
            </div>
          </div>
        ))}

        {shown.length === 0 && (
          <div className="rounded-2xl border border-white/25 bg-white/85 p-6 text-gray-900 backdrop-blur">
            {mode === 'bookmarked' ? 'No saved articles yet.' : 'No headlines right now.'}
          </div>
        )}
      </div>

      {visible < safeSource.length && mode !== 'bookmarked' && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisible((v) => Math.min(v + step, safeSource.length))}
            className="rounded-xl border border-white/30 bg-white/10 px-5 py-2 text-sm backdrop-blur hover:bg-white/20"
          >
            Load {Math.min(step, safeSource.length - visible)} more
          </button>
        </div>
      )}
    </>
  );
}

NewsLoadMore.propTypes = {
  items: PropTypes.array.isRequired,
  initialCount: PropTypes.number,
  step: PropTypes.number,
};

NewsLoadMore.defaultProps = {
  initialCount: 8,
  step: 6,
};
