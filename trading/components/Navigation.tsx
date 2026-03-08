'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <div className="flex justify-center mb-10 relative z-20">
      <div className="bg-slate-900/50 backdrop-blur-xl p-1.5 rounded-full border border-slate-800 flex space-x-1 shadow-xl shadow-black/20">
        <Link 
          href="/" 
          className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
            pathname === '/' 
              ? 'bg-slate-800/80 text-amber-400 shadow-md border border-amber-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          Single Stock
        </Link>
        <Link 
          href="/portfolio" 
          className={`px-6 py-2 rounded-full text-sm font-bold tracking-wide transition-all duration-300 ${
            pathname === '/portfolio' 
              ? 'bg-slate-800/80 text-amber-400 shadow-md border border-amber-500/20' 
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
          }`}
        >
          Portfolio Analysis
        </Link>
      </div>
    </div>
  );
}
