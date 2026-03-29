'use client';

import { useUnit } from '@/context/UnitContext';

export default function UnitToggle() {
  const { unit, setUnit } = useUnit();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-800 p-1">
      <button
        onClick={() => setUnit('kg')}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          unit === 'kg'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        kg
      </button>
      <button
        onClick={() => setUnit('lbs')}
        className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
          unit === 'lbs'
            ? 'bg-indigo-600 text-white'
            : 'text-gray-400 hover:text-white'
        }`}
      >
        lbs
      </button>
    </div>
  );
}
