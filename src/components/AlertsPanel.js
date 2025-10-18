// src/components/AlertsPanel.js
"use client";

import React from "react";
import PropTypes from "prop-types";

const OPS = [">", "<", ">=", "<=", "=="];

// Helper to get a cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default function AlertsPanel({ symbol }) {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState(null);

  const [operator, setOperator] = React.useState(">=");
  const [threshold, setThreshold] = React.useState("");

  async function load() {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`/api/alerts?symbol=${encodeURIComponent(symbol)}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed ${res.status}`);
      setItems(Array.isArray(data.alerts) ? data.alerts : []);
    } catch (e) {
      setErr(e.message || "Failed to load alerts");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); /* on mount/symbol change */ }, [symbol]);

  async function createAlert(e) {
    e?.preventDefault();
    const n = Number(threshold);
    if (!Number.isFinite(n)) return alert("Enter a numeric threshold");
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-CSRF-Token": getCookie("csrf-token"),
        },
        body: JSON.stringify({ symbol, operator, threshold: n }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed ${res.status}`);
      setThreshold("");
      await load();
    } catch (e) {
      alert(e.message || "Failed to create alert");
    }
  }

  async function removeAlert(id) {
    if (!confirm("Delete this alert?")) return;
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-Token": getCookie("csrf-token"),
        },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed ${res.status}`);
      setItems((prev) => prev.filter((a) => a.id !== id));
    } catch (e) {
      alert(e.message || "Failed to delete alert");
    }
  }

  return (
    <section className="mt-6 rounded-xl border border-gray-200 bg-white/90 p-4">
      <h3 className="text-base font-semibold text-gray-800">Price Alerts</h3>

      {/* Create */}
      <form onSubmit={createAlert} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="text-sm text-gray-700">When {symbol} price is</div>
        <select
          value={operator}
          onChange={(e) => setOperator(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {OPS.map((op) => <option key={op}>{op}</option>)}
        </select>
        <input
          type="number"
          step="0.01"
          value={threshold}
          onChange={(e) => setThreshold(e.target.value)}
          placeholder="e.g. 185.50"
          className="w-36 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700"
        >
          Add Alert
        </button>
      </form>

      {/* List */}
      <div className="mt-4">
        {loading && <div className="text-sm text-gray-500">Loading alerts…</div>}
        {err && <div className="text-sm text-red-600">Error: {err}</div>}
        {!loading && !err && items.length === 0 && (
          <div className="text-sm text-gray-600">No alerts for {symbol} yet.</div>
        )}
        {items.length > 0 && (
          <ul className="divide-y divide-gray-200">
            {items.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-2">
                <div className="text-sm text-gray-800">
                  Trigger when <span className="font-semibold">{symbol}</span> {a.operator}{" "}
                  <span className="font-semibold">{a.threshold}</span>
                  {!a.isActive && <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-xs">inactive</span>}
                </div>
                <button
                  onClick={() => removeAlert(a.id)}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                >
                  Trash
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

AlertsPanel.propTypes = { symbol: PropTypes.string.isRequired };
