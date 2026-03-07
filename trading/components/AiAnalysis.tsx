'use client';

import ReactMarkdown from 'react-markdown';

// Definice toho, co komponenta očekává
interface AiAnalysisProps {
  content: string;
}

export default function AiAnalysis({ content }: AiAnalysisProps) {
  // Pokud není žádný obsah, nic nevykreslujeme
  if (!content) {
    return (
      <div className="text-slate-500 italic flex items-center justify-center h-full">
        Analysis is not currently available.
      </div>
    );
  }

  return (
    <div className="text-slate-300 leading-relaxed text-base prose-invert max-w-none">
      <ReactMarkdown
        // Zde říkáme Markdownu, jaké Tailwind CSS třídy má přiřadit jednotlivým HTML elementům
        components={{
          // H2 zde AI model používá na slova jako "STRONG BUY" nebo "HOLD", takže je zvýrazníme jako štítky/odznaky
          h2: ({ node, children, ...props }) => {
            const text = String(children).toUpperCase();
            let badgeColor = "bg-slate-700/50 text-slate-300 border-slate-600"; // default
            
            if (text.includes("STRONG BUY")) badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]";
            else if (text.includes("BUY")) badgeColor = "bg-emerald-500/10 text-emerald-300 border-emerald-500/30";
            else if (text.includes("HOLD")) badgeColor = "bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
            else if (text.includes("STRONG SELL")) badgeColor = "bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.2)]";
            else if (text.includes("SELL")) badgeColor = "bg-rose-500/10 text-rose-300 border-rose-500/30";

            return (
              <span className={`inline-block px-4 py-2 my-2 rounded-xl border text-xl font-black tracking-widest ${badgeColor}`} {...props}>
                {children}
              </span>
            );
          },
          // H3 jsou normální nadpisy jednotlivých sekcí
          h3: ({ node, ...props }) => <h3 className="text-sm font-bold text-amber-500/80 uppercase tracking-widest mt-8 mb-2 border-b border-slate-700/50 pb-2" {...props} />,
          p: ({ node, ...props }) => <p className="mb-5 text-slate-300 leading-7 font-light" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-none pl-1 mb-5 space-y-3" {...props} />,
          li: ({ node, children, ...props }) => (
            <li className="flex items-start gap-3 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30" {...props}>
              <div className="mt-1 flex-shrink-0 w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
              <span className="text-sm">{children}</span>
            </li>
          ),
          strong: ({ node, ...props }) => <strong className="font-semibold text-white bg-slate-800 px-1.5 py-0.5 rounded-md text-sm border border-slate-700" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
      
      {/* Povinný disclaimer u finančních AI aplikací */}
      <div className="mt-10 pt-5 border-t border-slate-700/50">
        <p className="text-xs text-slate-500 flex items-start sm:items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-amber-500/70 shrink-0">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
          </svg>
          <span className="opacity-80">Disclaimer: This is AI-generated text powered by Google Gemini. It does not constitute financial advice.</span>
        </p>
      </div>
    </div>
  );
}