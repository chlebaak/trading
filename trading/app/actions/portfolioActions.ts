'use server';

import YahooFinance from 'yahoo-finance2';
import { GoogleGenAI } from '@google/genai';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface PortfolioHolding {
  ticker: string;
  percent: number;
}

export async function analyzePortfolio(holdings: PortfolioHolding[]) {
  try {
    // 1. Získání dat pro všechny tickery
    const portfolioData = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const quote = await yahooFinance.quote(holding.ticker);
          return {
            ticker: holding.ticker,
            percent: holding.percent,
            companyName: quote.shortName || quote.longName || holding.ticker,
            price: quote.regularMarketPrice,
            peRatio: quote.trailingPE || 'N/A',
            marketCap: quote.marketCap || 'N/A',
            dividendYield: quote.dividendYield ? quote.dividendYield.toFixed(2) + '%' : '0%',
          };
        } catch (err) {
          console.error(`Error fetching ${holding.ticker}:`, err);
          return null;
        }
      })
    );

    const validData = portfolioData.filter((d) => d !== null);

    if (validData.length === 0) {
      return { success: false, error: 'Failed to retrieve data for the provided tickers.' };
    }

    // 2. Formátování informací o portfoliu pro AI
    const portfolioInfoText = validData
      .map(
        (d) =>
          `- ${d?.ticker} (${d?.companyName}): ${d?.percent}% of portfolio. Price: ${d?.price}, P/E: ${d?.peRatio}, Div Yield: ${d?.dividendYield}`
      )
      .join('\n');

    // 3. Příprava promptu pro Gemini
    const prompt = `
You are a strict, top-tier Wall Street portfolio manager. Analyze the following user investment portfolio, which totals 100%.

Portfolio Composition:
${portfolioInfoText}

Write an extremely structured analysis exclusively in Markdown format:

### Overall Rating
Based on diversification, risk, and growth potential, decide with a single word or short phrase (use an H2 heading precisely: ## GREAT, ## GOOD, ## FAIR, ## RISKY, or ## DANGEROUS).

### Diversification & Risk
In 2-3 short sentences, evaluate if the portfolio is well-diversified or overexposed to a specific sector/risk.

### Pros
Write two bullet points highlighting the strongest aspects of this portfolio.

### Cons & Vulnerabilities
Write two bullet points highlighting the biggest weaknesses or macro risks.

### Pro Tips for Improvement
Give one strictly actionable advice (bullet point) on how to balance or improve this portfolio (e.g., "Add more defensive stocks like healthcare" or "Reduce tech exposure").

Follow the headings exactly as written. Use paragraphs strictly for clarity. Avoid fluff. Do not use asterisks around headings.
    `;

    // 4. Volání modelu Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return {
      success: true,
      data: {
        analysis: response.text,
        holdingsData: validData,
      },
    };
  } catch (error) {
    console.error('Error analyzing portfolio:', error);
    return {
      success: false,
      error: 'An error occurred while analyzing the portfolio.',
    };
  }
}
