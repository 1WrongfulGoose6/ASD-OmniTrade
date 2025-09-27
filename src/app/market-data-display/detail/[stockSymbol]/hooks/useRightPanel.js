'use client'

import React,{ createContext, useContext, useState, useCallback } from "react";
import PropTypes from "prop-types";

// 1. Create Context
const RightPanelContext = createContext();

RightPanelProvider.propTypes = {
    children: PropTypes.node
}

// 2. Provider Component
export function RightPanelProvider({ children }) {
    const [showRight, setShowRight] = useState(true);

    const toggleRight = useCallback(() => {
        setShowRight((prev) => !prev);
    }, []);

    return (
        <RightPanelContext.Provider value={{ showRight, setShowRight, toggleRight }}>
            {children}
        </RightPanelContext.Provider>
    );
}

// 3. Custom Hook
export function useRightPanel() {
    const context = useContext(RightPanelContext);
    if (!context) {
        throw new Error("useRightPanel must be used within a RightPanelProvider");
    }
    return context;
}


