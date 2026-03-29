'use client';

import { useEffect, useState } from 'react';
import type { Exercise } from '@/lib/queries';

export default function ExerciseManager() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/exercises')
      .then((r) => r.json())
      .then((data) => setExercises(data.exercises));
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!newName.trim()) return;

    setSubmitting(true);
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setSubmitting(false);

    if (res.ok) {
      const data = await res.json();
      setExercises((prev) => [...prev, data.exercise]);
      setNewName('');
    } else {
      const data = await res.json();
      setError(data.error ?? 'Something went wrong.');
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <ul className="space-y-2">
        {exercises.map((ex) => (
          <li
            key={ex.id}
            className="flex items-center justify-between rounded-lg bg-gray-900 border border-gray-800 px-4 py-3"
          >
            <span className="text-white">{ex.name}</span>
            {!ex.is_custom && (
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                built-in
              </span>
            )}
          </li>
        ))}
      </ul>

      <form onSubmit={handleAdd} className="space-y-3">
        <h2 className="text-sm font-medium text-gray-300">Add custom exercise</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Romanian Deadlift"
            className="flex-1 rounded-lg bg-gray-800 border border-gray-700 px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={submitting || !newName.trim()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors"
          >
            Add
          </button>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </form>
    </div>
  );
}
