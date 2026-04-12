import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import { TradingProvider } from '@/components/TradingProvider';

// Nasazení fontu Manrope
const manrope = Manrope({ 
  weight: ['400', '500', '700', '800'],
  style: 'normal',
  subsets: ['latin'] 
});

// Meta tagy pro SEO a zobrazení v záložce prohlížeče
export const metadata: Metadata = {
  title: 'AI Stock Analyst | Gemini Flash',
  description: 'Enter a ticker or build a portfolio to get an instant financial analysis and prediction using Google Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${manrope.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col selection:bg-amber-500/30 overflow-x-hidden relative`}>
        {/* Global Unified Background Element */}
        <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 -z-10" />
        {/* Global Ambient Glow Layer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-amber-600/10 blur-[120px] rounded-full pointer-events-none z-0"></div>
        
        <TradingProvider>
          {/* Zde se vykreslí naše app/page.tsx nebo app/portfolio/page.tsx */}
          <div className="flex-grow flex flex-col pt-6 p-2 md:pt-10 z-10 relative">
            <Navigation />
            {children}
          </div>

          {/* Globální patička, která bude na každé stránce webu dole */}
          <footer className="py-8 text-center text-sm text-slate-500 border-t border-slate-900 mt-auto backdrop-blur-md bg-slate-950/50">
            <p>
              Built with Next.js, Yahoo Finance API and Google Gemini AI. <br/>
              Data might be delayed. This does not constitute financial advice.
            </p>
          </footer>
        </TradingProvider>
      </body>
    </html>
  );
}