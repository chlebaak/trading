import type { Metadata } from 'next';
import { Arvo } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/Navigation';
import { TradingProvider } from '@/components/TradingProvider';

// Nasazení fontu Arvo
const arvo = Arvo({ 
  weight: ['400', '700'],
  style: ['normal', 'italic'],
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
    <html lang="en">
      <body className={`${arvo.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col selection:bg-amber-500/30 overflow-x-hidden`}>
        <TradingProvider>
          {/* Zde se vykreslí naše app/page.tsx nebo app/portfolio/page.tsx */}
          <div className="flex-grow pt-6 p-2 md:pt-10 z-10 relative">
            <Navigation />
            {children}
          </div>

          {/* Globální patička, která bude na každé stránce webu dole */}
          <footer className="py-8 text-center text-sm text-slate-500 border-t border-slate-900 mt-auto">
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