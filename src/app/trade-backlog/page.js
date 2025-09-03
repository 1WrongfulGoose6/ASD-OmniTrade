import React from 'react';

export const metadata = {
  title: "Trade Backlog",
  description: "View your recent trades in OmniTrade",
};

export default function TradeBacklog() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center p-6">
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-4xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center drop-shadow-md">
          Trade Backlog
        </h1>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="px-4 py-3">Trade ID</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              <tr className="hover:bg-gray-100">
                <td className="px-4 py-3 font-medium">#T12345</td>
                <td className="px-4 py-3">BTC/USDT</td>
                <td className="px-4 py-3 text-green-600 font-semibold">Buy</td>
                <td className="px-4 py-3">0.5 BTC</td>
                <td className="px-4 py-3">Completed</td>
                <td className="px-4 py-3">2025-08-28</td>
              </tr>
              <tr className="hover:bg-gray-100">
                <td className="px-4 py-3 font-medium">#T12346</td>
                <td className="px-4 py-3">ETH/USDT</td>
                <td className="px-4 py-3 text-red-600 font-semibold">Sell</td>
                <td className="px-4 py-3">10 ETH</td>
                <td className="px-4 py-3">Pending</td>
                <td className="px-4 py-3">2025-08-27</td>
              </tr>
              <tr className="hover:bg-gray-100">
                <td className="px-4 py-3 font-medium">#T12347</td>
                <td className="px-4 py-3">ADA/USDT</td>
                <td className="px-4 py-3 text-green-600 font-semibold">Buy</td>
                <td className="px-4 py-3">500 ADA</td>
                <td className="px-4 py-3">Failed</td>
                <td className="px-4 py-3">2025-08-25</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
