import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portfolio Analysis | AI Stock Analyst',
  description: 'Build your portfolio to 100% and get an instant AI evaluation and risk assessment.',
};

export default function PortfolioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
