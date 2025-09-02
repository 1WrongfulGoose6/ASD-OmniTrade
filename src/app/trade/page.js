// app/trade/page.js
import React, { Suspense } from "react";
import TradePageClient from "./TradePageClient";

export default function TradePage() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <TradePageClient />
    </Suspense>
  );
}
