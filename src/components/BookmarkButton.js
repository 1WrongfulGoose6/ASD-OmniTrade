// src/components/BookmarkButton.js
'use client';

import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import PropTypes from 'prop-types';

function keyFor(uid) {
  return uid ? `omni.bookmarks.v1.u${uid}` : 'omni.bookmarks.v1.anon';
}
function readStore(uid) {
  try { return JSON.parse(localStorage.getItem(keyFor(uid)) || '[]'); } catch { return []; }
}
function writeStore(uid, list) {
  localStorage.setItem(keyFor(uid), JSON.stringify(list));
}

export default function BookmarkButton({ item, onChange }) {
  const [saved, setSaved] = React.useState(false);
  const [uid, setUid] = React.useState(null); // current user id for namespacing

  // get current user id once
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch('/api/auth/me', { cache: 'no-store' });
        if (!res.ok) throw new Error('auth');
        const me = await res.json();
        if (alive) setUid(me?.id ?? null);
      } catch { setUid(null); }
    })();
    return () => { alive = false; };
  }, []);

  // reflect whether this article is saved for this user
  React.useEffect(() => {
    const list = readStore(uid);
    setSaved(list.some((b) => String(b.id) === String(item.id)));
  }, [uid, item.id]);

  const toggle = async () => {
    const list = readStore(uid);

    if (saved) {
      // optimistic remove
      writeStore(uid, list.filter((b) => String(b.id) !== String(item.id)));
      setSaved(false);
      // persist to DB
      try {
        const u = new URL('/api/bookmarks', window.location.origin);
        u.searchParams.set('articleId', String(item.id));
        await fetch(u, { method: 'DELETE' });
      } catch (err) {
        console.error('Failed to delete bookmark:', err);
      }
    } else {
      const toSave = {
        id: String(item.id),
        headline: item.headline,
        url: item.url,
        source: item.source,
        datetime: item.datetime,
        image: item.image,
        summary: item.summary,
      };
      writeStore(uid, [toSave, ...list].slice(0, 200));
      setSaved(true);
      try {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            articleId: String(item.id),
            title: item.headline,
            url: item.url,
          }),
        });
      } catch (err) {
        console.error('Failed to save bookmark:', err);
      }
    }

    onChange?.();
    window.dispatchEvent(new Event('bookmark:changed'));
  };

  const base =
    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium shadow-md ring-2 transition focus:outline-none focus:ring-4';
  const visibleIdle = 'bg-white text-blue-700 ring-white/70 hover:bg-blue-50 hover:ring-white';
  const visibleSaved = 'bg-blue-600 text-white ring-white/70 hover:bg-blue-700';

  return (
    <button
      type="button"
      title={saved ? 'Remove bookmark' : 'Save bookmark'}
      aria-pressed={saved}
      onClick={toggle}
      className={`${base} ${saved ? visibleSaved : visibleIdle}`}
    >
      {saved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
      <span className="hidden md:inline">{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}

BookmarkButton.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.any.isRequired,
    headline: PropTypes.string,
    url: PropTypes.string,
    source: PropTypes.string,
    datetime: PropTypes.any,
    image: PropTypes.string,
    summary: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func,
};
