// src/components/PortfolioChart.js
"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from "recharts";
import PropTypes from "prop-types";

const RANGE_LABELS = {
  "1h": "1-Hour Performance",
  "24h": "24-Hour Performance",
  "7d": "7-Day Performance",
  "1m": "30-Day Performance",
  YTD: "Year-to-Date Performance",
  "1y": "1-Year Performance",
};

export default function PortfolioChart({
  data,
  loading,
  error,
  range,
  change,
  changePercent,
  currentValue,
  firstHoldingTimestamp,
}) {
  if (loading) {
    return (
      <div className="bg-white/90 w-full">
        <div className="flex gap-10">
          <div className="flex-1 h-64 py-8 bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-gray-600">Loading portfolio history...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/90 w-full">
        <div className="flex gap-10">
          <div className="flex-1 h-64 py-8 bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-red-600">Error: {error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white/90 w-full">
        <div className="flex gap-10">
          <div className="flex-1 h-64 py-8 bg-gray-200 rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-gray-600">No portfolio data available</div>
          </div>
        </div>
      </div>
    );
  }

  // Custom tooltip formatter
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="text-gray-700 font-medium">{`${label}`}</p>
          <p className="text-blue-600 font-semibold">
            {`Portfolio Value: $${value.toLocaleString("en-AU", { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}`}
          </p>
        </div>
      );
    }
    return null;
  };

  // Calculate performance change for display
  const getPerformanceInfo = () => {
    if (typeof change === "number" && typeof changePercent === "number") {
      const status = change > 0 ? "positive" : change < 0 ? "negative" : "flat";
      return {
        change,
        changePercent,
        status,
      };
    }

    if (!data || data.length < 2) {
      return { change: 0, changePercent: 0, status: "flat" };
    }

    const firstValue = data[0].price;
    const lastValue = data[data.length - 1].price;
    const diff = lastValue - firstValue;
    const pct = firstValue > 0 ? (diff / firstValue) * 100 : 0;

    const status = diff > 0 ? "positive" : diff < 0 ? "negative" : "flat";
    return {
      change: diff,
      changePercent: pct,
      status,
    };
  };

  const performance = getPerformanceInfo();
  const summaryLabel = RANGE_LABELS[range] || "Performance";
  const displayCurrentValue =
    typeof currentValue === "number" && currentValue > 0
      ? currentValue
      : data[data.length - 1]?.price ?? 0;
  const holdingStartLabel = firstHoldingTimestamp
    ? new Date(firstHoldingTimestamp).toLocaleString("en-AU", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <div className="w-full">
      {/* Performance Summary */}
      <div className="mb-4 flex items-center justify-between bg-gray-100 p-4 rounded-xl border border-gray-200">
        <div>
          <h3 className="text-sm font-medium text-gray-700">{summaryLabel}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-lg font-semibold ${
                performance.status === "positive"
                  ? "text-emerald-600"
                  : performance.status === "negative"
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {performance.change > 0 ? "+" : performance.change < 0 ? "-" : ""}
              ${Math.abs(performance.change).toFixed(2)}
            </span>
            <span
              className={`text-sm ${
                performance.status === "positive"
                  ? "text-emerald-600"
                  : performance.status === "negative"
                  ? "text-red-600"
                  : "text-gray-700"
              }`}
            >
              ({performance.changePercent > 0 ? "+" : performance.changePercent < 0 ? "-" : ""}
              {Math.abs(performance.changePercent).toFixed(2)}%)
            </span>
          </div>
          {holdingStartLabel && (
            <p className="mt-1 text-xs text-gray-500">Tracking since {holdingStartLabel}</p>
          )}
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Current Value</div>
          <div className="text-lg font-semibold text-gray-800">
            $
            {displayCurrentValue.toLocaleString("en-AU", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="flex gap-10">
        <div className="flex-1 h-64 py-8 bg-gray-200 rounded-2xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#d1d5db" strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#6b7280" 
                tick={{ fontSize: 11, fill: "#6b7280" }} 
                axisLine={false} 
                tickLine={false} 
              />
              <YAxis 
                stroke="#6b7280" 
                domain={["auto", "auto"]} 
                tick={{ fontSize: 11, fill: "#6b7280" }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              >
                <Label 
                  value="Portfolio Value ($)" 
                  angle={-90} 
                  position="insideLeft" 
                  style={{ fill: "#6b7280", fontSize: 12 }} 
                />
              </YAxis>
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#2563eb" 
                strokeWidth={2} 
                dot={false}
                strokeLinecap="round"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

PortfolioChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      timestamp: PropTypes.string,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  range: PropTypes.string,
  change: PropTypes.number,
  changePercent: PropTypes.number,
  currentValue: PropTypes.number,
  firstHoldingTimestamp: PropTypes.string,
};
