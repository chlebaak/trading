import type { Metadata } from 'next';
import { Arvo } from 'next/font/google';
import './globals.css';

// Nasazení fontu Arvo
const arvo = Arvo({ 
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'] 
});

// Meta tagy pro SEO a zobrazení v záložce prohlížeče
export const metadata: Metadata = {
  title: 'AI Akciový Analytik | Gemini Flash',
  description: 'Zadej ticker a získej okamžitou finanční analýzu, graf trendu a predikci pomocí Google Gemini AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs">
      <body className={`${arvo.className} bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col selection:bg-amber-500/30`}>
        
        {/* Zde se vykreslí naše app/page.tsx */}
        <div className="flex-grow">
          {children}
        </div>

        {/* Globální patička, která bude na každé stránce webu dole */}
        <footer className="py-8 text-center text-sm text-slate-500 border-t border-slate-900 mt-auto">
          <p>
            Vytvořeno s Next.js, Yahoo Finance API a Google Gemini AI. <br/>
            Data mohou být zpožděná. Neslouží jako investiční doporučení.
          </p>
        </footer>

      </body>
    </html>
  );
}