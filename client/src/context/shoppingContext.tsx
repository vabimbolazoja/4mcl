// GlobalStateProvider.tsx
import React, { useState, ReactNode, useEffect } from "react";
import { GlobalStateContext } from "./globalContext";

// Define the shape of the origin state
interface OriginState {
  sourceOrigin: string;
  trackOrders?: any[]; // added because you are using trackOrders
}

interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  // ✅ Initialize from localStorage
  const [origin, setOrigin] = useState<OriginState>(() => {
    const stored = localStorage.getItem("origin");
    return stored ? JSON.parse(stored) : { sourceOrigin: "", trackOrders: [] };
  });

  // ✅ Persist to localStorage when origin changes
  useEffect(() => {
    localStorage.setItem("origin", JSON.stringify(origin));
  }, [origin]);

  return (
    <GlobalStateContext.Provider value={{ origin, setOrigin }}>
      {children}
    </GlobalStateContext.Provider>
  );
};
