// src/app/market-data-display/detail/[stockSymbol]/DetailClient.js
"use client";

import { useRightPanel } from "./hooks/useRightPanel";
import PropTypes from "prop-types";

export default function DetailClient({ stockSymbol }) {
  const { showRight } = useRightPanel();

  return (
    <div className="flex gap-6">
      <div className={`transition-all duration-500 ease-in-out ${showRight ? "basis-[70%]" : "basis-full"}`}>
        <MainSection stockSymbol={stockSymbol} />
      </div>

      <div className={`transition-all duration-500 ease-in-out ${showRight ? "basis-[30%]" : "basis-auto"}`}>
        {showRight ? <NewsSection symbol={stockSymbol} /> : <NewsSectionMinimize />}
      </div>
    </div>
  );
}

DetailClient.propTypes = {
  stockSymbol: PropTypes.string.isRequired,
};
