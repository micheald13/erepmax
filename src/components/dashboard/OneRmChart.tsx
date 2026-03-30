'use client';

import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useUnit } from '@/context/UnitContext';
import { toDisplayWeight } from '@/lib/oneRm';
import type { OneRmRecord } from '@/lib/queries';

interface Props {
  records: OneRmRecord[];
}

export default function OneRmChart({ records }: Props) {
  const { unit } = useUnit();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = records.map((r) => ({
    date: r.logged_date,
    value: toDisplayWeight(Number(r.estimated_1rm_kg), unit),
  }));

  const values = data.map((d) => d.value).filter((v) => isFinite(v));
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const yMin = Math.floor(minVal * 0.9);

  if (!mounted) return <div style={{ height: 200 }} />;

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={[yMin, 'auto']}
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
          labelStyle={{ color: '#D1D5DB', fontSize: 12 }}
          itemStyle={{ color: '#818CF8', fontSize: 12 }}
          formatter={(value) => [`${value} ${unit}`, 'Est. 1RM']}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#818CF8"
          strokeWidth={2}
          dot={{ r: 3, fill: '#818CF8', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
