'use client';

import { useUnit } from '@/context/UnitContext';
import { toDisplayWeight } from '@/lib/oneRm';
import type { Exercise, RepMax } from '@/lib/queries';

interface Props {
  exercise: Exercise;
  data: RepMax[];
}

export default function RecordsTable({ exercise, data }: Props) {
  const { unit } = useUnit();

  return (
    <div className="rounded-xl bg-gray-900 border border-gray-800 p-5">
      <h2 className="font-semibold text-white mb-3">{exercise.name}</h2>
      {data.length === 0 ? (
        <p className="text-gray-500 text-sm">No data yet</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="text-sm">
            <thead>
              <tr>
                <th className="pr-4 pb-2 text-left text-gray-400 font-medium">Reps</th>
                {data.map((row) => (
                  <th key={row.reps} className="px-3 pb-2 text-center text-gray-400 font-medium">
                    {row.reps}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="pr-4 py-2 text-gray-400 font-medium">Weight</td>
                {data.map((row) => (
                  <td key={row.reps} className="px-3 py-2 text-center text-white font-medium whitespace-nowrap">
                    {toDisplayWeight(row.weight_kg, unit)} {unit}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
