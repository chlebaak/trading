'use client';

import { useState, FormEvent, useEffect } from 'react';

// Definice toho, co komponenta očekává z hlavní stránky (props)
interface SearchBarProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
  initialValue?: string;
}

export default function SearchBar({ onSearch, isLoading, initialValue = '' }: SearchBarProps) {
  // Lokální stav pro to, co uživatel zrovna píše do políčka
  const [ticker, setTicker] = useState(initialValue);

  // Pokud se změní initialValue (např ze sdíleného stavu), aktualizujeme
  useEffect(() => {
    if (initialValue) {
      setTicker(initialValue);
    }
  }, [initialValue]);

  // Funkce, která se spustí při odeslání formuláře
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault(); // Zabrání znovunačtení celé stránky (výchozí chování formuláře)
    
    // Odstraníme prázdné mezery a převedeme na velká písmena (aapl -> AAPL)
    const cleanTicker = ticker.trim().toUpperCase();
    
    if (cleanTicker) {
      onSearch(cleanTicker); // Předáme čistý ticker zpět do app/page.tsx
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative flex items-center w-full max-w-md"
    >
      {/* Ikonka lupy uvnitř inputu pro lepší vzhled */}
      <div className="absolute left-5 text-slate-500 pointer-events-none group-focus-within:text-amber-500 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Vstupní textové pole */}
      <input
        type="text"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
        placeholder="Enter ticker"
        disabled={isLoading}
        className="w-full py-5 pl-14 pr-36 bg-slate-900/50 backdrop-blur-xl border border-slate-700/80 rounded-full text-white font-medium placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all shadow-xl shadow-black/20 disabled:bg-slate-900/40 disabled:text-slate-600 disabled:border-slate-800 uppercase text-lg"
        autoComplete="off"
      />

      {/* Tlačítko pro vyhledání */}
      <button
        type="submit"
        disabled={isLoading || !ticker.trim()}
        className="absolute right-2 py-3 px-6 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:shadow-none text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg shadow-amber-900/20 active:scale-95 duration-200"
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>...</span>
          </>
        ) : (
          'Analyze'
        )}
      </button>
    </form>
  );
}