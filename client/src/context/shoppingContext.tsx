// GlobalStateProvider.tsx
import React, { useState, ReactNode } from "react";
import { GlobalStateContext } from "./globalContext";

// Define the shape of the origin state
interface OriginState {
  sourceOrigin: string;
}

// Define the props type for the provider
interface GlobalStateProviderProps {
  children: ReactNode;
}

export const GlobalStateProvider: React.FC<GlobalStateProviderProps> = ({ children }) => {
  const [origin, setOrigin] = useState<OriginState>({
    sourceOrigin: "",
    trackOrders:[]
  });

  return (
    <GlobalStateContext.Provider value={{ origin, setOrigin }}>
      {children}
    </GlobalStateContext.Provider>
  );
};
