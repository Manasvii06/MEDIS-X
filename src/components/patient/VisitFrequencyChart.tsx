import { useMemo } from 'react';
import type { Visit } from '../../types/visit.types';

// Small hand-rolled SVG bar chart — visit count per month across the last
// 6 months. Deliberately not pulling in a charting library for one chart.
export function VisitFrequencyChart({ visits }: { visits: Visit[] }) {
  const { months, maxCount } = useMemo(() => {
    const now = new Date();
    const buckets: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('en-IN', { month: 'short' });
      const count = visits.filter((v) => {
        const vd = new Date(v.visitDate);
        return vd.getFullYear() === d.getFullYear() && vd.getMonth() === d.getMonth();
      }).length;
      buckets.push({ label, count });
    }
    return { months: buckets, maxCount: Math.max(1, ...buckets.map((b) => b.count)) };
  }, [visits]);

  const chartHeight = 120;
  const barWidth = 28;
  const gap = 22;

  return (
    <svg
      viewBox={`0 0 ${months.length * (barWidth + gap)} ${chartHeight + 24}`}
      className="w-full"
      style={{ maxHeight: 180 }}
    >
      {months.map((m, i) => {
        const barHeight = (m.count / maxCount) * chartHeight;
        const x = i * (barWidth + gap) + gap / 2;
        return (
          <g key={m.label + i}>
            <rect
              x={x}
              y={chartHeight - barHeight}
              width={barWidth}
              height={Math.max(barHeight, 2)}
              rx={6}
              className={m.count > 0 ? 'fill-brand-500 dark:fill-brand-400' : 'fill-slate-200 dark:fill-slate-700'}
            />
            {m.count > 0 && (
              <text
                x={x + barWidth / 2}
                y={chartHeight - barHeight - 6}
                textAnchor="middle"
                className="fill-slate-500 text-[11px] font-semibold dark:fill-slate-300"
              >
                {m.count}
              </text>
            )}
            <text
              x={x + barWidth / 2}
              y={chartHeight + 18}
              textAnchor="middle"
              className="fill-slate-400 text-[11px]"
            >
              {m.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
