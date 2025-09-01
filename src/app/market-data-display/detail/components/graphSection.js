import {LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid, Label} from "recharts";
import React from "react";

export default function GraphSection(){
    const data = [
    { time: "10:00", price: 64000 },
    { time: "11:00", price: 64500 },
    { time: "12:00", price: 64250 },
    { time: "13:00", price: 64800 },
    { time: "14:00", price: 65200 },
    { time: "15:00", price: 64900 },
    { time: "16:00", price: 65500 },
  ];

    return (
        <div className="bg-white/90 w-full">
            {/* Chart + Buttons Row */}
            <div className="flex gap-10">
                {/* Chart */}
                <div className="flex-1 h-64 py-8 bg-gray-200 rounded-2xl overflow-hidden">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid stroke="#d1d5db" strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
                            <YAxis
                                stroke="#6b7280"
                                domain={["auto", "auto"]}
                                tick={{ fontSize: 11, fill: "#6b7280" }}
                                axisLine={false}
                                tickLine={false}
                            >
                                <Label value="Price ($)" angle={-90} position="insideLeft" style={{ fill: "#6b7280", fontSize: 12 }} />
                            </YAxis>
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={1} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>


        </div>
    )
}