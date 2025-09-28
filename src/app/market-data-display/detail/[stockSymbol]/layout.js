import React from "react";
import PropTypes from "prop-types";
import {RightPanelProvider} from "@/app/market-data-display/detail/[stockSymbol]/hooks/useRightPanel";

Layout.propTypes = {
    children: PropTypes.node
}

export default function Layout({ children }) {
    return (
        <RightPanelProvider>
            {children}
        </RightPanelProvider>
    )
}