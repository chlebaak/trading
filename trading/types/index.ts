export interface ChartDataPoint {
  date: string;
  close: number;
}

export interface StockData {
  ticker: string;
  companyName: string;
  currentPrice: string;
  currency: string;
  change: number;
  changePercent: string;
  dynamicChangePercent?: number;
  marketCap: number;
  volume: number;
  peRatio: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  dividendYield: number;
  chartData: ChartDataPoint[];
  aiAnalysis: string;
}

export interface PortfolioHolding {
  ticker: string;
  percent: number;
}

export interface PortfolioHoldingData {
  ticker: string;
  percent: number;
  companyName: string;
  price: number;
  peRatio: number | string;
  marketCap: number | string;
  dividendYield: string;
}

export interface PortfolioAnalysisResult {
  analysis: string;
  holdingsData: PortfolioHoldingData[];
}
