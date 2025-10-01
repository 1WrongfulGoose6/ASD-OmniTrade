// src/app/market-data-display/detail/[stockSymbol]/components/newsSection.js
"use client";

import React, { useEffect, useState } from "react";
import { useRightPanel } from "../hooks/useRightPanel"; // ✅ relative path
import { ChevronRight } from "lucide-react";
import PropTypes from "prop-types";

export default function NewsSection({ symbol = "AAPL" }) {
  const { setShowRight } = useRightPanel();
  const [items, setItems] = useState([]);
  const [state, setState] = useState({ loading: true, error: null });

  useEffect(() => {
    let active = true;
    setState({ loading: true, error: null });

    (async () => {
      try {
        const res = await fetch(
          `/api/news/company?symbol=${encodeURIComponent(symbol)}&days=7&limit=15`,
          { cache: "no-store" }
        );
        if (!res.ok) throw new Error(`Company news failed: ${res.status}`);
        const { news = [] } = await res.json();
        if (active) {
          setItems(news);
          setState({ loading: false, error: null });
        }
      } catch (e) {
        if (active) setState({ loading: false, error: e.message || "Error" });
      }
    })();

    return () => {
      active = false;
    };
  }, [symbol]);

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl shadow overflow-hidden">
      <div className="flex items-center justify-between pr-4 py-3 border-b bg-gray-50">
        <button onClick={() => setShowRight(false)} className="p-2 bg-gray-200 rounded hover:bg-gray-300">
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 ml-auto">{symbol} News</h2>
      </div>

      <div className="flex-1 overflow-y-auto divide-y">
        {state.loading && <div className="p-4 text-sm text-gray-500">Loading news…</div>}
        {state.error && <div className="p-4 text-sm text-red-600">Failed to load: {state.error}</div>}
        {!state.loading && !state.error && items.length === 0 && (
          <div className="p-4 text-sm text-gray-500">No recent articles.</div>
        )}
        {items.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-3 hover:bg-gray-50 cursor-pointer"
          >
            <p className="text-sm font-medium text-gray-900 line-clamp-2">{item.headline}</p>
            <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
              <span>{item.source || "News"}</span>
              {item.datetime ? <time>{new Date(item.datetime * 1000).toLocaleString()}</time> : null}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

NewsSection.propTypes = {
  symbol: PropTypes.string.isRequired,
};
