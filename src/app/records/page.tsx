import { getAllExercises, getMaxWeightByReps } from '@/lib/queries';
import RecordsTable from '@/components/records/RecordsTable';

export const dynamic = 'force-dynamic';

export default function RecordsPage() {
  const exercises = getAllExercises();
  const exerciseData = exercises.map((ex) => ({
    exercise: ex,
    data: getMaxWeightByReps(ex.id),
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Records</h1>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {exerciseData.map(({ exercise, data }) => (
          <RecordsTable key={exercise.id} exercise={exercise} data={data} />
        ))}
      </div>
    </div>
  );
}
