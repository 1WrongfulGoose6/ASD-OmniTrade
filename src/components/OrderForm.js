// src/components/OrderForm.js
"use client";

import React, { useState } from "react";
import PropTypes from "prop-types";
import { csrfFetch } from "@/lib/csrfClient";

function toNum(v) {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (v == null) return null;
  const n = Number(String(v).replace(/[^\d.-]/g, "")); // strip $ , spaces
  return Number.isFinite(n) ? n : null;
}

export default function OrderForm({ symbol, price }) {
  const [side, setSide] = useState("Buy");           // "Buy" | "Sell"
  const [orderType, setOrderType] = useState("Market");
  const [quantity, setQuantity] = useState("");      // shares
  const [limitPrice, setLimitPrice] = useState("");

  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!symbol) return alert("No symbol selected");

    const shares = Number(quantity);
    if (!Number.isFinite(shares) || shares <= 0) {
      return alert("Enter a valid share quantity");
    }

    // Market order uses the current price prop; Limit uses the limitPrice input
    const marketPrice = toNum(price);
    const limit = toNum(limitPrice);
    const execPrice = orderType === "Limit" ? limit : marketPrice;

    if (!execPrice || execPrice <= 0) {
      return alert("Invalid price");
    }

    setBusy(true);
    try {
      const res = await csrfFetch("/api/trades", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          symbol,
          side: side.toUpperCase(),  // BUY/SELL
          qty: shares,
          price: execPrice,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) return alert("Please log in to place trades.");
        return alert(data.error || "Trade failed");
      }
      // success
      setQuantity("");
      setLimitPrice("");
      alert(`Trade submitted: ${side} ${shares} ${symbol} @ ${execPrice}`);
    } catch {
      alert("Network error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="flex flex-col bg-blue-50 rounded-2xl p-6 shadow-xl border-0">
      <h2 className="text-lg font-bold text-gray-800">
        Place Order {symbol ? `• ${symbol}` : ""}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSide("Buy")}
            className={`flex-1 py-2 rounded-xl font-semibold shadow-sm transition ${
              side === "Buy" ? "bg-green-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide("Sell")}
            className={`flex-1 py-2 rounded-xl font-semibold shadow-sm transition ${
              side === "Sell" ? "bg-red-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Sell
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-lg text-gray-800">Order Type</label>
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
          >
            <option>Market</option>
            <option>Limit</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-lg text-gray-800">Quantity (shares)</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            min="0"
            step="0.000001"
            placeholder="e.g. 1.5"
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
          />
        </div>

        {orderType === "Limit" && (
          <div className="flex flex-col gap-1">
            <label className="text-lg text-gray-800">Limit Price</label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              min="0"
              step="0.0001"
              placeholder="Enter price"
              className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
            />
          </div>
        )}

        {/* Toggles kept for UI parity */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setUseStopLoss(!useStopLoss)}
            className={`flex-1 py-2 rounded-xl font-semibold shadow-sm transition ${
              useStopLoss ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Stop Loss
          </button>
          <button
            type="button"
            onClick={() => setUseTakeProfit(!useTakeProfit)}
            className={`flex-1 py-2 rounded-xl font-semibold shadow-sm transition ${
              useTakeProfit ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            Take Profit
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="Stop Loss Price"
            disabled={!useStopLoss}
            className={`w-full max-w-md px-4 py-2 rounded-lg border text-gray-700 shadow-sm ${
              useStopLoss ? "border-gray-300" : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>

        <div className="flex flex-col gap-1">
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="Take Profit Price"
            disabled={!useTakeProfit}
            className={`w-full max-w-md px-4 py-2 rounded-lg border text-gray-700 shadow-sm ${
              useTakeProfit ? "border-gray-300" : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className={`mt-4 py-3 rounded-xl font-bold shadow-md transition ${
            side === "Buy"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          {busy ? "Submitting…" : `Place ${side} Order`}
        </button>
      </form>
    </section>
  );
}

OrderForm.propTypes = {
  symbol: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired
};
