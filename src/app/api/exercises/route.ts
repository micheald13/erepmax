import { NextRequest, NextResponse } from 'next/server';
import { getAllExercises, createExercise } from '@/lib/queries';

export function GET() {
  const exercises = getAllExercises();
  return NextResponse.json({ exercises });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 });
  }
  try {
    const exercise = createExercise(name);
    return NextResponse.json({ exercise }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('UNIQUE')) {
      return NextResponse.json({ error: 'Exercise already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
