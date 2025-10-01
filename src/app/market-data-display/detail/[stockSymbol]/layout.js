// src/app/market-data-display/detail/[stockSymbol]/layout.js
'use client';

import React from 'react';
import PropTypes from 'prop-types';
import { RightPanelProvider } from './hooks/useRightPanel';

export default function DetailLayout({ children }) {
  return <RightPanelProvider>{children}</RightPanelProvider>;
}

DetailLayout.propTypes = { children: PropTypes.node };
