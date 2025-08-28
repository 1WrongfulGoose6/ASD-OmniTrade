import React from 'react';
import Header from './Header';

const holdings = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    shares: 10,
    price: 175.29,
    change: 2.15,
    changePercent: 1.24,
    value: 1752.90,
    profitLoss: 215.00,
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    shares: 5,
    price: 315.75,
    change: -1.50,
    changePercent: -0.47,
    value: 1578.75,
    profitLoss: -7.50,
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    shares: 8,
    price: 155.23,
    change: 1.80,
    changePercent: 1.17,
    value: 1241.84,
    profitLoss: 14.40,
  },
    {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    shares: 12,
    price: 140.76,
    change: -0.24,
    changePercent: -0.17,
    value: 1689.12,
    profitLoss: -2.88,
  },
];

const totalValue = holdings.reduce((acc, holding) => acc + holding.value, 0);
const totalProfitLoss = holdings.reduce((acc, holding) => acc + holding.profitLoss, 0);

export default function Portfolio() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      <Header />
      <main className="p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Portfolio Overview</h1>
          <p className="text-lg text-blue-200">Welcome back, here&apos;s how your portfolio is performing.</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-blue-200 text-sm">Total Value</p>
              <p className="text-3xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Today&apos;s Profit/Loss</p>
              <p className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalProfitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-blue-200 text-sm">Performance (24h)</p>
              <p className={`text-3xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {((totalProfitLoss / totalValue) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">Your Holdings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="p-4">Symbol</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Change</th>
                  <th className="p-4 hidden md:table-cell">Shares</th>
                  <th className="p-4 hidden md:table-cell">Value</th>
                  <th className="p-4">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.symbol} className="border-b border-white/10">
                    <td className="p-4 font-bold">{holding.symbol}</td>
                    <td className="p-4">${holding.price.toFixed(2)}</td>
                    <td className={`p-4 ${holding.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.change.toFixed(2)} ({holding.changePercent.toFixed(2)}%)
                    </td>
                    <td className="p-4 hidden md:table-cell">{holding.shares}</td>
                    <td className="p-4 hidden md:table-cell">${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td className={`p-4 ${holding.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${holding.profitLoss.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
