'use client';

import React, { createContext, useContext, useState } from 'react';
import { PortfolioHolding } from '@/app/actions/portfolioActions';
import { StockData, PortfolioAnalysisResult } from '@/types';

interface TradingContextType {
  // Single Stock Analysis State
  singleStockData: StockData | null;
  setSingleStockData: React.Dispatch<React.SetStateAction<StockData | null>>;
  singleActiveRange: string;
  setSingleActiveRange: (range: string) => void;
  singleLastTicker: string;
  setSingleLastTicker: (ticker: string) => void;
  
  // Portfolio Analysis State
  portfolioHoldings: PortfolioHolding[];
  setPortfolioHoldings: (holdings: PortfolioHolding[]) => void;
  portfolioResult: PortfolioAnalysisResult | null;
  setPortfolioResult: React.Dispatch<React.SetStateAction<PortfolioAnalysisResult | null>>;
}

const TradingContext = createContext<TradingContextType | null>(null);

export function TradingProvider({ children }: { children: React.ReactNode }) {
  // Sdílené stavy, které přežijí přesměrování
  const [singleStockData, setSingleStockData] = useState<StockData | null>(null);
  const [singleActiveRange, setSingleActiveRange] = useState('1y');
  const [singleLastTicker, setSingleLastTicker] = useState('');

  const [portfolioHoldings, setPortfolioHoldings] = useState<PortfolioHolding[]>([]);
  const [portfolioResult, setPortfolioResult] = useState<PortfolioAnalysisResult | null>(null);

  return (
    <TradingContext.Provider value={{
      singleStockData, setSingleStockData,
      singleActiveRange, setSingleActiveRange,
      singleLastTicker, setSingleLastTicker,
      portfolioHoldings, setPortfolioHoldings,
      portfolioResult, setPortfolioResult
    }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
}
