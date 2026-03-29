'use client';

import { useUnit } from '@/context/UnitContext';
import { toDisplayWeight } from '@/lib/oneRm';
import type { OneRmRecord } from '@/lib/queries';

interface Props {
  records: OneRmRecord[];
}

const W = 480;
const H = 180;
const PAD = { top: 10, right: 12, bottom: 28, left: 42 };

export default function OneRmChart({ records }: Props) {
  const { unit } = useUnit();

  const data = records.map((r) => ({
    date: r.logged_date,
    value: toDisplayWeight(Number(r.estimated_1rm_kg), unit),
  }));

  const values = data.map((d) => d.value);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const yMin = rawMin * 0.9;
  const yMax = rawMax * 1.02;
  const yRange = yMax - yMin || 1;

  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const toX = (i: number) =>
    PAD.left + (data.length === 1 ? innerW / 2 : (i / (data.length - 1)) * innerW);
  const toY = (v: number) =>
    PAD.top + innerH - ((v - yMin) / yRange) * innerH;

  const points = data.map((d, i) => ({ x: toX(i), y: toY(d.value), ...d }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Y axis ticks
  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const v = yMin + (yRange * i) / 4;
    return { y: toY(v), label: Math.round(v) };
  });

  // X axis ticks — show first, last, and middle if 3+ points
  const xTickIndices = data.length <= 1
    ? [0]
    : data.length === 2
    ? [0, 1]
    : [0, Math.floor((data.length - 1) / 2), data.length - 1];
  const xTicks = xTickIndices.map((i) => ({ x: toX(i), label: data[i].date }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      style={{ height: H, pointerEvents: 'none' }}
      aria-label="1RM chart"
    >
      {/* Grid lines */}
      {yTicks.map((t) => (
        <line
          key={t.y}
          x1={PAD.left}
          y1={t.y}
          x2={W - PAD.right}
          y2={t.y}
          stroke="#374151"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
      ))}

      {/* Y axis labels */}
      {yTicks.map((t) => (
        <text
          key={t.y}
          x={PAD.left - 6}
          y={t.y + 4}
          textAnchor="end"
          fontSize={10}
          fill="#9CA3AF"
        >
          {t.label}
        </text>
      ))}

      {/* X axis labels */}
      {xTicks.map((t) => (
        <text
          key={t.x}
          x={t.x}
          y={H - 6}
          textAnchor="middle"
          fontSize={10}
          fill="#9CA3AF"
        >
          {t.label.slice(5)}
        </text>
      ))}

      {/* Line */}
      {points.length > 1 && (
        <polyline
          points={polyline}
          fill="none"
          stroke="#818CF8"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}

      {/* Dots */}
      {points.map((p) => (
        <circle key={p.date} cx={p.x} cy={p.y} r={3} fill="#818CF8" />
      ))}
    </svg>
  );
}
