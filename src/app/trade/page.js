// app/trade/page.js


export default function TradePage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <TradePageClient />
    </Suspense>
  );
}
