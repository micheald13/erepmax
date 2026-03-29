import { NextRequest, NextResponse } from 'next/server';
import { createSet, hasEntryForDate, deleteSetsByDate } from '@/lib/queries';
import { epley } from '@/lib/oneRm';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const { exercise_id, logged_date, reps, weight_kg } = body ?? {};

  if (!exercise_id || !logged_date || !reps || !weight_kg) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (reps < 1 || weight_kg <= 0) {
    return NextResponse.json({ error: 'Invalid reps or weight' }, { status: 400 });
  }

  if (hasEntryForDate(Number(exercise_id), logged_date)) {
    return NextResponse.json(
      { error: 'An entry already exists for this exercise on that date. Delete it first to re-log.' },
      { status: 409 }
    );
  }

  const estimated_1rm_kg = epley(Number(weight_kg), Number(reps));

  try {
    const set = createSet({
      exercise_id: Number(exercise_id),
      logged_date,
      reps: Number(reps),
      weight_kg: Number(weight_kg),
      estimated_1rm_kg,
    });
    return NextResponse.json({ set }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const exerciseId = searchParams.get('exerciseId');
  const date = searchParams.get('date');

  if (!exerciseId || !date || isNaN(Number(exerciseId))) {
    return NextResponse.json({ error: 'exerciseId and date are required' }, { status: 400 });
  }

  deleteSetsByDate(Number(exerciseId), date);
  return new NextResponse(null, { status: 204 });
}
