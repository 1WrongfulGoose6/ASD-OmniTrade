import OrderForm from "@/components/OrderForm";

export const metadata = {
  title: "Trade - OmniTrade",
  description: "Buy and Sell cryptocurrencies with Market and Limit orders",
};

export default function TradePage() {
  return (
    <main className="grid grid-cols-3 min-h-screen bg-background">
      {/* Chart placeholder */}
      <section className="col-span-2 flex items-center justify-center border-r border-gray-200 dark:border-gray-800">
        <div className="w-11/12 h-5/6 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center text-xl text-blue-900 dark:text-blue-100">
          [ Chart Placeholder ]
        </div>
      </section>

      {/* Client-side interactive form */}
      <OrderForm />
    </main>
  );
}
