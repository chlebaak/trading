'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Definice datového typu, který nám přijde z backendu (Yahoo Finance)
interface Quote {
  date: string | Date;
  close: number;
}

interface StockChartProps {
  data: Quote[];
}

export default function StockChart({ data }: StockChartProps) {
  // Pokud nemáme data, nic nevykreslujeme
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Data pro graf nejsou k dispozici.
      </div>
    );
  }

  // Inteligentní funkce pro formátování data podle délky časové řady
  const formatDateXAxis = (dateString: string | Date) => {
    const date = new Date(dateString);
    if (!data || data.length < 2) return '';
    
    const firstDate = new Date(data[0].date).getTime();
    const lastDate = new Date(data[data.length - 1].date).getTime();
    const diffDays = (lastDate - firstDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= 7) {
      // 1D a 1W grafy -> Zobrazovat hodiny a minuty
      return new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit' }).format(date);
    } else if (diffDays > 365 * 2) {
      // MAX grafy -> Zobrazovat roky
      return new Intl.DateTimeFormat('cs-CZ', { year: 'numeric' }).format(date);
    } else {
      // Běžné (1M, 1Y) -> Dny a měsíce
      return new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'short' }).format(date);
    }
  };

  const formatTooltipDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: date.getHours() === 0 && date.getMinutes() === 0 ? undefined : '2-digit',
      minute: date.getHours() === 0 && date.getMinutes() === 0 ? undefined : '2-digit',
    }).format(date);
  };

  // Funkce pro formátování ceny na ose Y (např. "$150.50")
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="w-full h-[350px] mt-4">
      {/* ResponsiveContainer zajistí, že se graf přizpůsobí velikosti obrazovky (mobil/PC) */}
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          {/* Definice barevného přechodu pod křivkou grafu */}
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Jemná mřížka na pozadí */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />

          {/* Osa X (Datum) */}
          <XAxis
            dataKey="date"
            tickFormatter={formatDateXAxis}
            tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            minTickGap={40} // Zabrání překrývání textu na malých displejích
            dy={10}
          />

          {/* Osa Y (Cena) */}
          <YAxis
            domain={['auto', 'auto']} // Graf se automaticky zazoomuje na aktuální cenové rozpětí
            tickFormatter={(val) => `$${val.toFixed(0)}`}
            tick={{ fill: '#94a3b8', fontSize: 13, fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
            dx={-10}
          />

          {/* Tooltip, který se ukáže při najetí myší */}
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a', /* slate-900 */
              borderRadius: '12px',
              border: '1px solid #1e293b', /* slate-800 */
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
              color: '#f8fafc',
            }}
            itemStyle={{ color: '#fbbf24', fontWeight: 'bold' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
            labelFormatter={(label: string | Date | number) => formatTooltipDate(label as string | Date)}
            formatter={(value: number) => [formatPrice(value), 'Cena']}
          />

          {/* Samotná křivka a plocha grafu */}
          <Area
            type="monotone"
            dataKey="close"
            stroke="#fbbf24"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorPrice)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}