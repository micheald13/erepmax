import { getAllExercises, getRecordsByExercise, getEntriesByExercise } from '@/lib/queries';
import ExerciseCard from '@/components/dashboard/ExerciseCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const exercises = getAllExercises();
  const exerciseData = exercises.map((ex) => ({
    exercise: ex,
    records: getRecordsByExercise(ex.id),
    entries: getEntriesByExercise(ex.id),
  }));

  const hasAnyData = exerciseData.some((d) => d.records.length > 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link
          href="/log"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Log Set
        </Link>
      </div>

      {!hasAnyData && (
        <p className="text-gray-500 text-sm mb-6">
          No sets logged yet. Hit &quot;Log Set&quot; to record your first set.
        </p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {exerciseData.map(({ exercise, records, entries }) => (
          <ExerciseCard key={exercise.id} exercise={exercise} records={records} entries={entries} />
        ))}
      </div>
    </div>
  );
}
