import { NextRequest, NextResponse } from 'next/server';
import { getRecordsByExercise } from '@/lib/queries';

export function GET(req: NextRequest) {
  const exerciseId = req.nextUrl.searchParams.get('exerciseId');
  if (!exerciseId || isNaN(Number(exerciseId))) {
    return NextResponse.json({ error: 'exerciseId is required' }, { status: 400 });
  }
  const records = getRecordsByExercise(Number(exerciseId));
  return NextResponse.json({ records });
}
