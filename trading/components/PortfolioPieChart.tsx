'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PortfolioPieChartProps {
  data: { ticker: string; percent: number }[];
}

// Barvy pro ladění do jantarového (amber)/žlutého/slate dark modu pro celistvý design
const COLORS = [
  '#f59e0b', // amber-500
  '#fcd34d', // amber-300
  '#d97706', // amber-600
  '#fef3c7', // amber-100
  '#b45309', // amber-700
  '#fbbf24', // amber-400
  '#f87171', // pomocná - rose pro kontrast
  '#94a3b8', // slate-400
  '#e2e8f0', // slate-200
  '#64748b', // slate-500
];

export default function PortfolioPieChart({ data }: PortfolioPieChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[250px] sm:h-[300px] w-full flex items-center justify-center text-slate-500 border border-dashed border-slate-700/50 rounded-3xl bg-slate-800/10">
        Empty Portfolio
      </div>
    );
  }

  // Custom Label uvnitř grafu - barva slate-900 pro lepší kontrast v jasných amber barvách
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null; // Neukazujeme label pro malé kousky (< 5%)

    return (
      <text 
        x={x} y={y} 
        fill="#0f172a" 
        textAnchor="middle" 
        dominantBaseline="central" 
        fontSize="13" 
        fontWeight="800"
        style={{ pointerEvents: 'none' }}
      >
        {`${data[index].ticker}`}
      </text>
    );
  };

  return (
    <div className="w-full flex items-center justify-center mt-4 drop-shadow-[0_0_15px_rgba(245,158,11,0.05)] h-[250px] sm:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius="80%"
            innerRadius="60%" // Zúžený donut pro modernější look vhodný i pro mobily
            paddingAngle={4} // Průhledné mezery mezi bloky
            cornerRadius={6} // Zakulacené rohy jednotlivých dílků
            fill="#8884d8"
            dataKey="percent"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: any) => [`${value}%`, 'Allocation']}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc', borderRadius: '0.75rem' }}
            itemStyle={{ color: '#fcd34d' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
