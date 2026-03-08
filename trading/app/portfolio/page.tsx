'use client';

import { useState } from 'react';
import { analyzePortfolio, PortfolioHolding } from '../actions/portfolioActions';
import PortfolioPieChart from '@/components/PortfolioPieChart';
import AiAnalysis from '@/components/AiAnalysis';

export default function PortfolioPage() {
  const [tickerInput, setTickerInput] = useState('');
  const [percentInput, setPercentInput] = useState('');
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const calculateTotalPercent = () => holdings.reduce((sum, h) => sum + h.percent, 0);
  const totalPercent = calculateTotalPercent();

  const handleAddHolding = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanTicker = tickerInput.trim().toUpperCase();
    const percentNum = parseFloat(percentInput);

    if (!cleanTicker) {
      setError('Please enter a valid ticker.');
      return;
    }
    if (isNaN(percentNum) || percentNum <= 0) {
      setError('Percentage must be greater than 0.');
      return;
    }

    if (totalPercent + percentNum > 100) {
      setError(`Cannot add ${percentNum}%. Total would exceed 100% (Current: ${totalPercent}%).`);
      return;
    }

    // Check if it already exists, update it if it does
    const existingIndex = holdings.findIndex(h => h.ticker === cleanTicker);
    if (existingIndex >= 0) {
      const newHoldings = [...holdings];
      newHoldings[existingIndex].percent += percentNum;
      if (calculateTotalPercent() - holdings[existingIndex].percent + newHoldings[existingIndex].percent > 100) {
        setError(`Updating ${cleanTicker} exceeds 100%.`);
        return;
      }
      setHoldings(newHoldings);
    } else {
      setHoldings([...holdings, { ticker: cleanTicker, percent: percentNum }]);
    }

    setTickerInput('');
    setPercentInput('');
    setAnalysisResult(null); // Reset analysis if portfolio changes
  };

  const removeHolding = (tickerToRemove: string) => {
    setHoldings(holdings.filter(h => h.ticker !== tickerToRemove));
    setAnalysisResult(null);
  };

  const handleAnalyze = async () => {
    if (totalPercent !== 100) {
      setError(`Portfolio must be exactly 100% to analyze. Currently at ${totalPercent}%.`);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const result = await analyzePortfolio(holdings);
      if (result.success) {
        setAnalysisResult(result.data);
      } else {
        setError(result.error || 'Something went wrong during analysis.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-6 md:p-12 relative">
      <div className="absolute top-0 right-1/4 -translate-y-1/2 w-[800px] h-[400px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 drop-shadow-sm">
            AI Portfolio Manager
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
            Build your portfolio to 100% and get an instant diversification and risk analysis from Wall Street AI.
          </p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-center max-w-lg mx-auto backdrop-blur-sm shadow-lg shadow-red-500/5">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-start">
          
          {/* Vlevo: Builder a Graf (h-fit a sticky fixují problém s protahováním layoutu) */}
          <div className="lg:col-span-5 h-fit sticky top-6 bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-800/60 flex flex-col relative overflow-hidden group">
            <h2 className="text-xl font-bold text-white mb-6">Build Portfolio</h2>
            
            <form onSubmit={handleAddHolding} className="flex gap-2 mb-6">
              <input
                type="text"
                value={tickerInput}
                onChange={(e) => setTickerInput(e.target.value)}
                placeholder="Ticker (AAPL)"
                disabled={loading}
                className="w-1/2 py-3 px-4 bg-slate-900/50 backdrop-blur-xl border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all uppercase"
              />
              <div className="relative w-1/3">
                 <input
                  type="number"
                  value={percentInput}
                  onChange={(e) => setPercentInput(e.target.value)}
                  placeholder="%"
                  disabled={loading}
                  min="1"
                  max="100"
                  step="0.1"
                  className="w-full py-3 pl-4 pr-8 bg-slate-900/50 backdrop-blur-xl border border-slate-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                 />
                 <span className="absolute right-3 top-3.5 text-slate-500">%</span>
              </div>
              <button
                type="submit"
                disabled={loading || totalPercent >= 100}
                className="w-1/6 py-3 bg-slate-800 hover:bg-amber-600 text-white rounded-xl transition-colors disabled:opacity-50 font-bold flex items-center justify-center border border-slate-700/80 hover:border-amber-500 focus:outline-none"
              >
                +
              </button>
            </form>

            <div className="flex justify-between items-center bg-slate-800/30 p-3 rounded-lg border border-slate-700/50 mb-4">
               <span className="text-sm text-slate-400 font-medium">Total Allocation</span>
               <span className={`text-lg font-bold transition-colors ${totalPercent === 100 ? 'text-amber-400' : 'text-slate-300'}`}>
                 {totalPercent}% / 100%
               </span>
            </div>

            {/* List of assets */}
            <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              {holdings.map(h => (
                <div key={h.ticker} className="flex justify-between items-center bg-slate-800/60 px-4 py-2 rounded-lg text-sm border border-slate-700/30">
                  <span className="font-bold text-white tracking-wider">{h.ticker}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-300 bg-slate-900 px-2 py-1 rounded">{h.percent}%</span>
                    <button onClick={() => removeHolding(h.ticker)} className="text-rose-500 hover:text-rose-400 font-bold px-1" disabled={loading}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
              {holdings.length === 0 && (
                <div className="text-center text-slate-500 py-4 text-sm italic">No assets added yet.</div>
              )}
            </div>

            <div className="mt-4 mb-2">
              <PortfolioPieChart data={holdings} />
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || totalPercent !== 100}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all shadow-lg flex justify-center items-center gap-2 ${
                totalPercent === 100 
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white shadow-amber-900/20 active:scale-95 duration-200' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700 disabled:shadow-none'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </>
              ) : (
                'Analyze Portfolio'
              )}
            </button>

          </div>

          {/* Vpravo: AI Analýza */}
          <div className="lg:col-span-7 bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-800/60 flex flex-col relative overflow-hidden group min-h-[500px]">
             <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-yellow-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-colors duration-700"></div>
             
            {analysisResult ? (
              <div className="animate-in fade-in slide-in-from-right-8 duration-700 ease-out h-full flex flex-col relative z-10">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                  <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">✨</span> 
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-300">
                    AI Portfolio Diagnosis
                  </span>
                </h3>
                
                {/* Stats row for each fetched asset from API */}
                <div className="flex gap-3 overflow-x-auto pb-4 mb-6 custom-scrollbar">
                  {analysisResult.holdingsData.map((asset: any) => (
                    <div key={asset.ticker} className="bg-slate-800/20 border border-slate-700/30 p-4 rounded-2xl min-w-[140px] flex-shrink-0 backdrop-blur-sm">
                      <div className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">{asset.ticker} • <span className="text-slate-300">{asset.percent}%</span></div>
                      <div className="font-bold text-slate-200 text-lg">{asset.price}</div>
                      <div className="text-xs text-amber-500/80 mt-1.5 font-medium uppercase tracking-wider">P/E: {asset.peRatio}</div>
                    </div>
                  ))}
                </div>

                <div className="flex-grow mt-2">
                  <AiAnalysis content={analysisResult.analysis} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 relative z-10">
                <div className="w-24 h-24 bg-slate-800/30 rounded-full flex items-center justify-center mb-2 shadow-inner border border-slate-700/30">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-slate-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                  </svg>
                </div>
                <p className="text-lg">Build your portfolio to 100% to unlock AI insights.</p>
                <ul className="text-sm opacity-60 list-disc pl-5 mt-4 space-y-1">
                  <li>Risk and diversification assessment</li>
                  <li>Identification of vulnerabilities</li>
                  <li>Actionable rebalancing tips</li>
                </ul>
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}
