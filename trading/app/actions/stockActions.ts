'use server';

import YahooFinance from 'yahoo-finance2';
import { GoogleGenAI } from '@google/genai';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

// Inicializace Google Gen AI SDK s tvým API klíčem z .env.local
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Pomocná funkce pro získání dat grafu podle horizontu
export async function getChartData(ticker: string, range: string) {
  try {
    let period1 = new Date();
    let interval: '1m' | '2m' | '5m' | '15m' | '30m' | '60m' | '90m' | '1h' | '1d' | '5d' | '1wk' | '1mo' | '3mo' = '1d';

    switch (range) {
      case '1d':
        period1.setDate(period1.getDate() - 1);
        interval = '5m';
        // Pro víkendy musíme jít víc dozadu, aby tam byla nějaká data
        if (period1.getDay() === 0) period1.setDate(period1.getDate() - 2);
        else if (period1.getDay() === 6) period1.setDate(period1.getDate() - 1);
        break;
      case '1w':
        period1.setDate(period1.getDate() - 7);
        interval = '15m';
        break;
      case '1m':
        period1.setMonth(period1.getMonth() - 1);
        interval = '1d';
        break;
      case 'YTD':
        period1 = new Date(new Date().getFullYear(), 0, 1);
        interval = '1d';
        break;
      case 'max':
        period1 = new Date('1970-01-01');
        interval = '1mo';
        break;
      case '1y':
      default:
        period1.setFullYear(period1.getFullYear() - 1);
        interval = '1d';
        break;
    }

    const chart = await yahooFinance.chart(ticker, { period1, interval });
    
    return {
      success: true,
      data: chart.quotes
        .filter((q: any) => q.close !== null)
        .map((q: any) => ({
          date: q.date.toISOString(),
          close: q.close,
        }))
    };
  } catch (error) {
    console.error('Error loading chart:', error);
    return { success: false, error: 'Failed to load chart data.' };
  }
}

export async function analyzeStock(ticker: string) {
  try {
    // 1. Získání základních informací o akcii
    const quote = await yahooFinance.quote(ticker);
    
    // 2. Výchozí graf
    const chart = await getChartData(ticker, '1y');

    // Validace, jestli data vůbec existují (uživatel mohl zadat nesmyslný ticker)
    if (!quote || !quote.regularMarketPrice) {
      return { success: false, error: 'Failed to find data for this ticker.' };
    }

    const currentPrice = quote.regularMarketPrice;
    const companyName = quote.shortName || quote.longName || ticker;

    // 3. Získání reálných dodatečných dat pro AI (to, co skutečně API vrací)
    const peRatio = quote.trailingPE ? quote.trailingPE.toFixed(2) : 'N/A';
    const fiftyTwoWeekHigh = quote.fiftyTwoWeekHigh ? quote.fiftyTwoWeekHigh.toFixed(2) : 'N/A';
    const fiftyTwoWeekLow = quote.fiftyTwoWeekLow ? quote.fiftyTwoWeekLow.toFixed(2) : 'N/A';
    const changePercent = quote.regularMarketChangePercent ? quote.regularMarketChangePercent.toFixed(2) : '0';

    // 4. Příprava dat pro frontendový graf
    // Budeme používat náš nový chart helper
    const chartData = chart.success ? chart.data : [];

    // 5. Příprava zkráceného promptu pro Gemini
    const prompt = `
You are a top-tier, strict, but concise Wall Street financial analyst. Evaluate the stock ${ticker} (${companyName}).
Here is the specific market data:
- Current price: ${currentPrice.toFixed(2)} ${quote.currency}
- Today's change: ${changePercent}%
- 52-week low/high: ${fiftyTwoWeekLow} - ${fiftyTwoWeekHigh}
- P/E ratio: ${peRatio}

Write an extremely structured analysis exclusively in Markdown format:
### Final Verdict
Based on your current knowledge of the world, decide with a single word (use an H2 heading precisely: ## STRONG BUY, ## BUY, ## HOLD, ## SELL, or ## STRONG SELL).

### Quick Outlook
Write 2 very short sentences summarizing the stock's outlook (whether it has potential or is overheated).

### Analyst Move
Estimate where premium investment bank target prices are currently heading (summarize the average analyst target in one sentence, evaluate the sentiment, and add the upside/downside % from the current price).

### Biggest Threat
Briefly name, using a bullet point, the absolute biggest business or macro risk facing this company this year.

Follow the headings exactly as I wrote them. Use paragraphs strictly for clarity. Avoid fluff. Never invent non-existent market data.
    `;

    // 6. Volání modelu Gemini Flash pro rychlou odpověď
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    // 7. Odeslání všech dat zpět do app/page.tsx
    return {
      success: true,
      data: {
        ticker: ticker.toUpperCase(),
        companyName,
        currentPrice: currentPrice.toFixed(2),
        currency: quote.currency || 'USD',
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        marketCap: quote.marketCap,
        volume: quote.regularMarketVolume,
        peRatio: quote.trailingPE,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        dividendYield: quote.dividendYield,
        chartData: chartData,
        aiAnalysis: response.text,
      }
    };

  } catch (error) {
    console.error('Error analyzing stock:', error);
    return { 
      success: false, 
      error: 'An error occurred while downloading data or communicating with AI. Check if you entered a valid ticker.' 
    };
  }
}