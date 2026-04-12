'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Runtime Error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center relative z-20">
      <div className="bg-rose-500/10 border border-rose-500/30 p-8 sm:p-12 rounded-3xl backdrop-blur-md max-w-lg shadow-2xl shadow-rose-900/20">
        <div className="w-16 h-16 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-3xl font-extrabold text-white mb-4">Connection Failed</h2>
        <p className="text-slate-400 mb-8 font-light">An unexpected error occurred while communicating with Yahoo Finance or Google AI.</p>
        <button
          onClick={() => reset()}
          className="bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 font-bold py-3 px-8 rounded-full transition-colors border border-slate-600 shadow-md flex items-center justify-center gap-2 mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Try again
        </button>
      </div>
    </div>
  );
}
