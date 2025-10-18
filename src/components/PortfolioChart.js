// src/components/PortfolioChart.js
"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from "recharts";


export default function PortfolioChart() {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/portfolio/history", { cache: "no-store" });
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data?.error || `Server ${res.status}`);
        }

        setChartData(data.historicalData || []);
      } catch (err) {
        console.error("Failed to fetch portfolio history:", err);
        setError(err.message || "Failed to load portfolio history");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioHistory();
  }, []);

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

  if (!chartData || chartData.length === 0) {
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
    if (chartData.length < 2) return { change: 0, changePercent: 0, isPositive: true };
    
    const firstValue = chartData[0].price;
    const lastValue = chartData[chartData.length - 1].price;
    const change = lastValue - firstValue;
    const changePercent = firstValue > 0 ? (change / firstValue) * 100 : 0;
    
    return {
      change,
      changePercent,
      isPositive: change >= 0
    };
  };

  const performance = getPerformanceInfo();

  return (
    <div className="w-full">
      {/* Performance Summary */}
      <div className="mb-4 flex items-center justify-between bg-gray-100 p-4 rounded-xl border border-gray-200">
        <div>
          <h3 className="text-sm font-medium text-gray-700">30-Day Performance</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-lg font-semibold ${performance.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {performance.isPositive ? '+' : ''}${Math.abs(performance.change).toFixed(2)}
            </span>
            <span className={`text-sm ${performance.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              ({performance.isPositive ? '+' : ''}{performance.changePercent.toFixed(2)}%)
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Current Value</div>
          <div className="text-lg font-semibold text-gray-800">
            ${chartData.length > 0 ? chartData[chartData.length - 1].price.toLocaleString("en-AU", { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            }) : '0.00'}
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div className="flex gap-10">
        <div className="flex-1 h-64 py-8 bg-gray-200 rounded-2xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
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
