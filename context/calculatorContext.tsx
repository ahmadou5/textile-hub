"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface WholesaleCalculatorContextValue {
  totals: {
    wholesale: number;
    retail: number;
    savings: number;
  };
  updateTotals: (wholesale: number, retail: number, savings: number) => void;
}

const WholesaleCalculatorContext =
  createContext<WholesaleCalculatorContextValue | null>(null);

interface WholesaleCalculatorProviderProps {
  children: ReactNode;
}

export function WholesaleCalculatorProvider({
  children,
}: WholesaleCalculatorProviderProps) {
  const [totals, setTotals] = useState({ wholesale: 0, retail: 0, savings: 0 });

  const updateTotals = (wholesale: number, retail: number, savings: number) => {
    setTotals({ wholesale, retail, savings });
  };

  return (
    <WholesaleCalculatorContext.Provider value={{ totals, updateTotals }}>
      {children}
    </WholesaleCalculatorContext.Provider>
  );
}

export function useWholesaleCalculator() {
  const context = useContext(WholesaleCalculatorContext);
  if (!context) {
    throw new Error(
      "useWholesaleCalculator must be used within a WholesaleCalculatorProvider",
    );
  }
  return context;
}
