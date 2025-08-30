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
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-3xl p-8">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-2 drop-shadow-md">
          Bitcoin (BTC)
        </h1>
        <p className="text-center text-gray-600 mb-6 text-lg">
          Current Price: <span className="font-semibold text-gray-900">$65,500</span>
        </p>

        {/* Chart */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis dataKey="time" stroke="#6b7280" />
              <YAxis stroke="#6b7280" domain={["auto", "auto"]} />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-8 justify-center">
          <button className="px-8 py-3 bg-green-600 text-white font-semibold rounded-xl shadow-md hover:bg-green-700 transition">
            Buy
          </button>
          <button className="px-8 py-3 bg-red-600 text-white font-semibold rounded-xl shadow-md hover:bg-red-700 transition">
            Sell
          </button>
        </div>
      </div>
    )
}