// src/app/market-data-display/detail/[stockSymbol]/components/graphSection.js
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Label } from "recharts";
import React from "react";
import PropTypes from "prop-types";

export default function GraphSection({ data = [] }) {
  return (
    <div className="bg-white/90 w-full">
      <div className="flex gap-10">
        <div className="flex-1 h-64 py-8 bg-gray-200 rounded-2xl overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="#d1d5db" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
              <YAxis stroke="#6b7280" domain={["auto", "auto"]} tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false}>
                <Label value="Price ($)" angle={-90} position="insideLeft" style={{ fill: "#6b7280", fontSize: 12 }} />
              </YAxis>
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

GraphSection.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      time: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
    })
  ).isRequired,
};
