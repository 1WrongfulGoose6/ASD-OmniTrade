"use client";

import React, { useState } from "react";

export default function OrderForm() {
  const [side, setSide] = useState("Buy");
  const [orderType, setOrderType] = useState("Limit");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  // Stop Loss & Take Profit toggles
  const [useStopLoss, setUseStopLoss] = useState(false);
  const [useTakeProfit, setUseTakeProfit] = useState(false);

  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const orderData = {
      side,
      orderType,
      quantity,
      ...(orderType === "Limit" ? { limitPrice } : {}),
      ...(useStopLoss ? { stopLoss } : {}),
      ...(useTakeProfit ? { takeProfit } : {}),
    };
    console.log("Order submitted:", orderData);
  };

  return (
    <section className="flex flex-col bg-white rounded-2xl p-6 shadow-xl border-0">
      <h2 className="text-lg font-bold text-gray-800">Place Order</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 flex-1">
        {/* Buy/Sell Toggle */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSide("Buy")}
            className={`flex-1 py-2 rounded-xl font-semibold shadow-sm transition ${
              side === "Buy"
                ? "bg-green-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide("Sell")}
            className={`flex-1 py-2 rounded-xl font-semibold shadow-sm transition ${
              side === "Sell"
                ? "bg-red-500 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            }`}
          >
            Sell
          </button>
        </div>

        {/* Order Type */}
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

        {/* Amount */}
        <div className="flex flex-col gap-1">
          <label className="text-lg text-gray-800">Amount (AUD)</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter amount"
            className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
          />
        </div>

        {/* Limit Price */}
        {orderType === "Limit" && (
          <div className="flex flex-col gap-1">
            <label className="text-lg text-gray-800">Limit Price</label>
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Enter price"
              className="w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm"
            />
          </div>
        )}

        {/* Stop Loss & Take Profit toggles */}
        <div className="flex gap-4">
          {/* Stop Loss */}
          <button
            type="button"
            onClick={() => setUseStopLoss(!useStopLoss)}
            className={`flex-1 py-2 rounded-xl font-semibold shadow-sm transition ${
              useStopLoss
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Stop Loss
          </button>

          {/* Take Profit */}
          <button
            type="button"
            onClick={() => setUseTakeProfit(!useTakeProfit)}
            className={`flex-1 py-2 rounded-xl font-semibold shadow-sm transition ${
              useTakeProfit
                ? "bg-blue-500 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Take Profit
          </button>
        </div>

        {/* Stop Loss Input */}
        <div className="flex flex-col gap-1">
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            placeholder="Stop Loss Price"
            disabled={!useStopLoss}
            className={`w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm ${
              useStopLoss
                ? "border-gray-300"
                : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>

        {/* Take Profit Input */}
        <div className="flex flex-col gap-1">
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            placeholder="Take Profit Price"
            disabled={!useTakeProfit}
            className={`w-full max-w-md px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-gray-700 shadow-sm ${
              useTakeProfit
                ? "border-gray-300"
                : "border-gray-200 bg-gray-100 cursor-not-allowed"
            }`}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          className={`mt-4 py-3 rounded-xl font-bold shadow-md transition ${
            side === "Buy"
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          Place {side} Order
        </button>
      </form>
    </section>
  );
}
