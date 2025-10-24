import NavBar from "@/components/NavBar";
import WaveBackground from "@/components/WaveBackground";
import DetailClient from "./DetailClient";
import React from "react";
import PropTypes from "prop-types";

export default async function MarketDetail({ params }) {
  // In Next 15, params is a Promise in server components
  const { stockSymbol } = await params;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-600 to-blue-400 text-white">
      <WaveBackground />
      <NavBar />

      <section className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-6 pb-16">
        {/* Client-side shell that handles right panel state */}
        <DetailClient stockSymbol={stockSymbol} />
      </section>
    </main>
  );
}

MarketDetail.propTypes = {
    params: PropTypes.shape({ stockSymbol: PropTypes.string.isRequired }).isRequired,
};