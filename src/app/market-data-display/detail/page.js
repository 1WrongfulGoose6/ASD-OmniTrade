"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import GraphSection from "./components/graphSection";

export default function MarketDetail() {
  // Demo price history (replace with API later)
  

  return (
    <div className="grid grid-cols-10 min-h-screen">
      {/* Left Section (70%) */}
      <div className="col-span-7 bg-gray-100 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white shadow p-4">
          {nav}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          {left}
        </div>
      </div>
    </div>
  );
}
