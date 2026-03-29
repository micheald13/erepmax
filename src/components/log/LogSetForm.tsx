'use client';

import { useEffect, useState } from 'react';
import { useUnit } from '@/context/UnitContext';
import { toKg } from '@/lib/oneRm';
import type { Exercise } from '@/lib/queries';

export default function LogSetForm() {
  const { unit } = useUnit();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [exerciseId, setExerciseId] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/exercises')
      .then((r) => r.json())
      .then((data) => {
        setExercises(data.exercises);
        if (data.exercises.length > 0) setExerciseId(String(data.exercises[0].id));
      });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    const repsNum = Number(reps);
    const weightNum = Number(weight);
    if (!exerciseId || !date || repsNum < 1 || weightNum <= 0) {
      setError('Please fill in all fields with valid values.');
      return;
    }

    setSubmitting(true);
    const weight_kg = toKg(weightNum, unit);

    const res = await fetch('/api/sets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ exercise_id: Number(exerciseId), logged_date: date, reps: repsNum, weight_kg }),
    });

    setSubmitting(false);

    if (res.ok) {
      setSuccess('Set logged!');
      setReps('');
      setWeight('');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong.');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-md">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Exercise</label>
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Reps</label>
          <input
            type="number"
            min="1"
            max="30"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            placeholder="e.g. 5"
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Weight ({unit})
          </label>
          <input
            type="number"
            min="0.5"
            step="0.5"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={unit === 'kg' ? 'e.g. 100' : 'e.g. 225'}
            className="w-full rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}
      {success && <p className="text-green-400 text-sm">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
      >
        {submitting ? 'Logging...' : 'Log Set'}
      </button>
    </form>
  );
}
