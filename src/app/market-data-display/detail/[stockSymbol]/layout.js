// src/app/market-data-display/detail/[stockSymbol]/layout.js
'use client';

import PropTypes from 'prop-types';

export default function DetailLayout({ children }) {
  return <RightPanelProvider>{children}</RightPanelProvider>;
}

DetailLayout.propTypes = { children: PropTypes.node };
