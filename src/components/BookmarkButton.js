'use client';

import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'omni.bookmarks.v1';

function readStore() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
  catch { return []; }
}
function writeStore(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export default function BookmarkButton({ item, onChange }) {
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const list = readStore();
    setSaved(list.some(b => b.id === item.id));
  }, [item.id]);

  const toggle = () => {
    const list = readStore();
    if (saved) {
      writeStore(list.filter(b => b.id !== item.id));
      setSaved(false);
    } else {
      const toSave = {
        id: item.id,
        headline: item.headline,
        url: item.url,
        source: item.source,
        datetime: item.datetime,
        image: item.image,
        summary: item.summary,
      };
      writeStore([toSave, ...list].slice(0, 200));
      setSaved(true);
    }
    onChange?.();
    window.dispatchEvent(new Event('bookmark:changed'));
  };

  // Stronger, high-contrast styles
  const base =
    'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ' +
    'shadow-md ring-2 transition focus:outline-none focus:ring-4';
  const visibleIdle =
    'bg-white text-blue-700 ring-white/70 hover:bg-blue-50 hover:ring-white';
  const visibleSaved =
    'bg-blue-600 text-white ring-white/70 hover:bg-blue-700';

  return (
    <button
      type="button"
      title={saved ? 'Remove bookmark' : 'Save bookmark'}
      aria-label={saved ? 'Remove bookmark' : 'Save bookmark'}
      aria-pressed={saved}
      onClick={toggle}
      className={`${base} ${saved ? visibleSaved : visibleIdle}`}
    >
      {saved ? (
        <BookmarkCheck className="h-5 w-5" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
      {/* Show a small text label on md+ so it’s extra obvious */}
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
