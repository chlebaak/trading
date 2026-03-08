'use client';

import { useState } from 'react';
import { analyzeStock, getChartData } from './actions/stockActions'; 

// Importujeme UI komponenty
import SearchBar from '@/components/SearchBar';
import StockChart from '@/components/StockChart';
import AiAnalysis from '@/components/AiAnalysis';
import { useTrading } from '@/components/TradingProvider';

const FORMATTERS = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

export default function Home() {
  // Sdílené stavy přes Context
  const { 
    singleStockData: stockData, 
    setSingleStockData: setStockData,
    singleActiveRange: activeRange,
    setSingleActiveRange: setActiveRange,
    singleLastTicker: lastTicker,
    setSingleLastTicker: setLastTicker
  } = useTrading();

  // Lokální stavy pro UI (loading atd. není nutné sdílet)
  const [loading, setLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState('');

  // Funkce, která se spustí po odeslání tickeru ve vyhledávači
  const handleSearch = async (ticker: string) => {
    if (!ticker) return;
    
    setLoading(true);
    setError('');
    setStockData(null);
    setActiveRange('1y');
    setLastTicker(ticker); // Uložíme hledaný ticker do sdíleného stavu

    try {
      // Zavolání naší backendové funkce (Server Action)
      const result = await analyzeStock(ticker);
      
      if (result.success && result.data) {
        // Nastavíme taky výchozí dynamickou změnu trhu na dnešek (nebo 1y výchozí),
        // ideálně rovnou z prvního a posledního bodu grafu
        let initialChange = result.data.changePercent;
        if (result.data.chartData && result.data.chartData.length > 0) {
          const firstPrice = result.data.chartData[0].close;
          const lastPrice = result.data.chartData[result.data.chartData.length - 1].close;
          if (firstPrice && lastPrice) {
            initialChange = ((lastPrice - firstPrice) / firstPrice) * 100;
          }
        }
        
        setStockData({
          ...result.data,
          dynamicChangePercent: initialChange
        }); 
      } else {
        setError(result.error || 'Something went wrong while fetchig data.');
      }
    } catch (err) {
      setError('Failed to connect to the server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRangeChange = async (range: string) => {
    if (!stockData || range === activeRange) return;
    
    setActiveRange(range);
    setChartLoading(true);
    
    try {
      const result = await getChartData(stockData.ticker, range);
      if (result.success) {
        // Spočítáme novou procentuální změnu podle vybraného horizontu grafu
        let newChangePercent = stockData.changePercent;
        
        if (result.data && result.data.length > 0) {
          const firstPrice = result.data[0].close;
          const lastPrice = result.data[result.data.length - 1].close;
          if (firstPrice && lastPrice) {
            newChangePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
          }
        }

        setStockData((prev: any) => ({
          ...prev,
          chartData: result.data,
          dynamicChangePercent: newChangePercent
        }));
      }
    } catch (err) {
      console.error('Failed to update the chart');
    } finally {
      setChartLoading(false);
    }
  };

  const RANGES = ['1d', '1w', '1m', '1y', 'YTD', 'max'];

  return (
    <main className="min-h-screen p-6 md:p-12 relative">
      {/* Decentní záře na pozadí, která nyní plynule navazuje i pod navigaci */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-6xl mx-auto space-y-10 relative z-10">
        
        {/* Hlavička */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-yellow-300 drop-shadow-sm">
            AI Stock Analyst
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-light">
            Enter a ticker (e.g., AAPL, TSLA, MSFT). Get the current chart and detailed AI prediction from Google Gemini Flash.
          </p>
        </header>

        {/* Komponenta pro vyhledání */}
        <div className="flex justify-center">
          <SearchBar onSearch={handleSearch} isLoading={loading} initialValue={lastTicker} />
        </div>

        {/* Zobrazení chyby */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-6 py-4 rounded-xl text-center max-w-lg mx-auto backdrop-blur-sm shadow-lg shadow-red-500/5">
            {error}
          </div>
        )}

        {/* Indikátor načítání */}
        {loading && (
          <div className="text-center py-16 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-r-2 border-amber-500 mx-auto drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
            <p className="text-slate-400 font-medium animate-pulse">Analyzing data using AI models...</p>
          </div>
        )}

        {/* Zobrazení výsledků */}
        {stockData && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
            
            {/* Levý sloupec: Data a Graf */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-800/60 flex flex-col relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 relative z-10">
                <div>
                  <h2 className="text-sm font-bold text-amber-400/80 uppercase tracking-widest mb-1 shadow-sm">
                    {stockData.ticker} <span className="text-slate-500 font-normal capitalize ml-2">{stockData.companyName}</span>
                  </h2>
                  <p className="text-4xl font-extrabold text-white tracking-tight drop-shadow-md flex items-end gap-3">
                    {stockData.currentPrice} <span className="text-xl text-slate-500 font-medium">{stockData.currency}</span>
                    {stockData.dynamicChangePercent !== undefined && (
                        <span className={`text-lg font-medium ${stockData.dynamicChangePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'} mb-1 transition-colors duration-300`}>
                          {stockData.dynamicChangePercent > 0 ? '+' : ''}{stockData.dynamicChangePercent.toFixed(2)}%
                        </span>
                    )}
                  </p>
                </div>

                {/* Range Selector */}
                <div className="flex bg-slate-800/80 p-1 rounded-lg shadow-inner">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRangeChange(r)}
                      disabled={chartLoading}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${
                        activeRange === r 
                          ? 'bg-amber-600 text-white shadow-md' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                      } ${chartLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Komponenta grafu */}
              <div className={`flex-grow min-h-[300px] relative z-10 transition-opacity duration-300 ${chartLoading ? 'opacity-50' : 'opacity-100'}`}>
                <StockChart data={stockData.chartData} />
              </div>

              {/* Extra Stats under the chart */}
              <div className="mt-8 grid grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 pt-8 border-t border-slate-800/60 auto-rows-max">
                <div className="bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Market Cap</p>
                  <p className="text-lg font-bold text-slate-200">{stockData.marketCap ? FORMATTERS.format(stockData.marketCap) : '-'}</p>
                </div>
                <div className="bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Volume</p>
                  <p className="text-lg font-bold text-slate-200">{stockData.volume ? FORMATTERS.format(stockData.volume) : '-'}</p>
                </div>
                <div className="bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">P/E Ratio</p>
                  <p className="text-lg font-bold text-slate-200">{stockData.peRatio ? stockData.peRatio.toFixed(2) : '-'}</p>
                </div>
                <div className="bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">52W High</p>
                  <p className="text-lg font-bold text-slate-200">{stockData.fiftyTwoWeekHigh ? stockData.fiftyTwoWeekHigh.toFixed(2) : '-'}</p>
                </div>
                <div className="bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">52W Low</p>
                  <p className="text-lg font-bold text-slate-200">{stockData.fiftyTwoWeekLow ? stockData.fiftyTwoWeekLow.toFixed(2) : '-'}</p>
                </div>
                <div className="bg-slate-800/20 p-4 rounded-2xl border border-slate-700/30 backdrop-blur-sm">
                  <p className="text-xs text-slate-500 mb-1 font-medium uppercase tracking-wider">Div. Yield</p>
                  <p className="text-lg font-bold text-slate-200">{stockData.dividendYield ? stockData.dividendYield.toFixed(2) + '%' : '-'}</p>
                </div>
              </div>
            </div>

            {/* Pravý sloupec: Výstup z Gemini AI */}
            <div className="bg-slate-900/60 backdrop-blur-md p-6 md:p-8 rounded-3xl shadow-2xl border border-slate-800/60 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-yellow-500/5 blur-[80px] rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-colors duration-700"></div>
              
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 relative z-10">
                <span className="text-2xl drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">✨</span> 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-yellow-300">
                  12-Month AI Outlook
                </span>
              </h3>
              
              {/* Komponenta pro vypsání zformátovaného textu od AI */}
              <div className="relative z-10">
                <AiAnalysis content={stockData.aiAnalysis} />
              </div>
            </div>
            
          </div>
        )}
      </div>
    </main>
  );
}