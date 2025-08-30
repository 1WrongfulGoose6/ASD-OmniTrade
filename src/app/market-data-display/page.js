export const metadata = {
  title: "Market Data",
  description: "Live cryptocurrency market data in OmniTrade",
};

export default function MarketDataList() {
  // Demo data (you could later replace with API fetch)
  const coins = [
    { id: 1, name: "Bitcoin", symbol: "BTC", price: "$64,520", change: "+2.5%", marketCap: "$1.2T" },
    { id: 2, name: "Ethereum", symbol: "ETH", price: "$3,150", change: "-1.2%", marketCap: "$380B" },
    { id: 3, name: "Cardano", symbol: "ADA", price: "$0.52", change: "+0.8%", marketCap: "$18B" },
    { id: 4, name: "Solana", symbol: "SOL", price: "$132", change: "+4.1%", marketCap: "$56B" },
    { id: 5, name: "Dogecoin", symbol: "DOGE", price: "$0.089", change: "-0.6%", marketCap: "$12B" },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-4xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center drop-shadow-md">
          Market Data
        </h1>

        <ul className="divide-y divide-gray-200">
          {coins.map((coin) => (
            <li
              key={coin.id}
              className="flex justify-between items-center py-4 hover:bg-gray-50 px-4 rounded-lg transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 text-white flex items-center justify-center rounded-full font-bold">
                  {coin.symbol[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{coin.name}</p>
                  <p className="text-sm text-gray-500">{coin.symbol}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-800">{coin.price}</p>
                <p
                  className={`text-sm font-medium ${
                    coin.change.startsWith("+") ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {coin.change}
                </p>
                <p className="text-xs text-gray-500">MCap: {coin.marketCap}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
