// TODO
// - add option to pay in btc
// - format text boxes better with error mesgs and text/negative restrictions
// - add stoploss/takeprofit
// - some sort of confirmation screen for order being filled or not
"use client";

import React from "react";
import { useState } from "react";

export default function OrderForm() {
  const [side, setSide] = useState("Buy");
  const [orderType, setOrderType] = useState("Limit");
  const [quantity, setQuantity] = useState("");
  const [limitPrice, setLimitPrice] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // stop reloading
    const orderData = {
      side,
      orderType,
      quantity,
      ...(orderType === "Limit" ? { limitPrice } : {}),
    };
    console.log("Order submitted:", orderData);
  };

  return (
    <section className="p-6 bg-white dark:bg-neutral-900">
      <h2 className="text-xl font-bold mb-4">Trade</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Buy/Sell Toggle */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide("Buy")}
            className={`OrderForm-button ${
              side === "Buy"
                ? "bg-emerald-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            }`}
          >
            Buy
          </button>
          <button
            type="button"
            onClick={() => setSide("Sell")}
            className={`OrderForm-button ${
              side === "Sell"
                ? "bg-red-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-200"
            }`}
          >
            Sell
          </button>
        </div>

        {/* Order Type */}
        <label className="OrderForm-label">
          Order Type
          <select
            value={orderType}
            onChange={(e) => setOrderType(e.target.value)}
            className="OrderForm-ArrowInput"
          >
            <option>Market</option>
            <option>Limit</option>
          </select>
        </label>

        {/* Amount */}
        <label className="OrderForm-label">
          Amount (AUD)
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter amount"
            className="OrderForm-ArrowInput"
          />
        </label>

        {/* Limit Price (only for Limit orders) */}
        {orderType === "Limit" && (
          <label className="OrderForm-label">
            Limit Price
            <input
              type="number"
              value={limitPrice}
              onChange={(e) => setLimitPrice(e.target.value)}
              placeholder="Enter price"
              className="OrderForm-ArrowInput"
            />
          </label>
        )}

        {/* Submit */}
        <button
          type="submit"
          className={`mt-4 py-2 rounded-md font-bold ${
            side === "Buy"
              ? "bg-emerald-500 hover:bg-emerald-600 text-white"
              : "bg-red-500 hover:bg-red-600 text-white"
          }`}
        >
          Place {side} Order
        </button>
      </form>
    </section>
  );
}
