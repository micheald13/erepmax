'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import OneRmChart from './OneRmChart';
import { useUnit } from '@/context/UnitContext';
import { toDisplayWeight } from '@/lib/oneRm';
import type { Exercise, OneRmRecord, LogEntry } from '@/lib/queries';

interface Props {
  exercise: Exercise;
  records: OneRmRecord[];
  entries: LogEntry[];
}

function trendPct(from: number, to: number): number {
  return ((to - from) / from) * 100;
}

function TrendBadge({ pct, label }: { pct: number; label: string }) {
  const up = pct >= 0;
  return (
    <span className="flex flex-col items-center">
      <span className={`text-sm font-medium ${up ? 'text-green-400' : 'text-red-400'}`}>
        {up ? '▲' : '▼'} {Math.abs(pct).toFixed(1)}%
      </span>
      <span className="text-[10px] text-gray-500 leading-none">{label}</span>
    </span>
  );
}

export default function ExerciseCard({ exercise, records, entries }: Props) {
  const { unit } = useUnit();
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const latest = records.length > 0 ? records[records.length - 1] : null;
  const first = records.length > 1 ? records[0] : null;

  let fourWeekRecord: OneRmRecord | null = null;
  if (latest && records.length > 1) {
    const cutoff = new Date(latest.logged_date);
    cutoff.setDate(cutoff.getDate() - 28);
    for (let i = records.length - 2; i >= 0; i--) {
      if (new Date(records[i].logged_date) <= cutoff) {
        fourWeekRecord = records[i];
        break;
      }
    }
  }

  const currentDisplay = latest ? toDisplayWeight(latest.estimated_1rm_kg, unit) : null;
  const allTimeTrend = latest && first ? trendPct(first.estimated_1rm_kg, latest.estimated_1rm_kg) : null;
  const fourWeekTrend = latest && fourWeekRecord ? trendPct(fourWeekRecord.estimated_1rm_kg, latest.estimated_1rm_kg) : null;

  async function handleDelete(date: string) {
    setDeleting(date);
    await fetch(`/api/sets?exerciseId=${exercise.id}&date=${date}`, { method: 'DELETE' });
    setDeleting(null);
    router.refresh();
  }

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5 min-w-0">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="font-semibold text-white">{exercise.name}</h2>
          {currentDisplay !== null && (
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-bold text-white">
                {currentDisplay}
                <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
              </span>
              <div className="flex gap-3">
                {fourWeekTrend !== null && (
                  <TrendBadge pct={fourWeekTrend} label="4 weeks" />
                )}
                {allTimeTrend !== null && (
                  <TrendBadge pct={allTimeTrend} label="all time" />
                )}
              </div>
            </div>
          )}
        </div>
        <Link
          href={`/log?exercise=${exercise.id}`}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors mt-0.5"
        >
          + Log set
        </Link>
      </div>

      {records.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center text-gray-500 text-sm">
          No data yet — log a set to get started
        </div>
      ) : (
        <>
          <OneRmChart records={records} />
          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="mt-2 py-2 text-xs text-gray-500 hover:text-gray-300 transition-colors w-full text-left"
          >
            {showHistory ? 'Hide history' : `Show history (${entries.length})`}
          </button>
          {showHistory && (
            <ul className="mt-2 space-y-1">
              {[...entries].reverse().map((e) => (
                <li
                  key={e.logged_date}
                  className="flex items-center justify-between rounded-lg bg-gray-800 px-3 py-2 text-sm"
                >
                  <span className="text-gray-300">{e.logged_date}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium">
                      {e.reps} × {toDisplayWeight(e.weight_kg, unit)} {unit}
                    </span>
                    <button
                      onClick={() => handleDelete(e.logged_date)}
                      disabled={deleting === e.logged_date}
                      className="text-gray-600 hover:text-red-400 disabled:opacity-40 transition-colors text-xs"
                      title="Delete this entry"
                    >
                      {deleting === e.logged_date ? '…' : '✕'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
