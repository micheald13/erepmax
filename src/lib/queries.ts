import { getDb } from './db';

export interface Exercise {
  id: number;
  name: string;
  is_custom: boolean;
}

export interface SetRecord {
  id: number;
  exercise_id: number;
  logged_date: string;
  reps: number;
  weight_kg: number;
  estimated_1rm_kg: number;
  created_at: string;
}

export interface OneRmRecord {
  logged_date: string;
  estimated_1rm_kg: number;
}

export interface LogEntry {
  logged_date: string;
  reps: number;
  weight_kg: number;
}

export interface RepMax {
  reps: number;
  weight_kg: number;
}

export interface NewSetInput {
  exercise_id: number;
  logged_date: string;
  reps: number;
  weight_kg: number;
  estimated_1rm_kg: number;
}

export function getAllExercises(): Exercise[] {
  const db = getDb();
  return db
    .prepare('SELECT id, name, is_custom FROM exercises ORDER BY is_custom ASC, name ASC')
    .all() as Exercise[];
}

export function createExercise(name: string): Exercise {
  const db = getDb();
  const result = db
    .prepare('INSERT INTO exercises (name, is_custom) VALUES (?, 1)')
    .run(name.trim());
  return db
    .prepare('SELECT id, name, is_custom FROM exercises WHERE id = ?')
    .get(result.lastInsertRowid) as Exercise;
}

export function createSet(data: NewSetInput): SetRecord {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO sets (exercise_id, logged_date, reps, weight_kg, estimated_1rm_kg)
       VALUES (@exercise_id, @logged_date, @reps, @weight_kg, @estimated_1rm_kg)`
    )
    .run(data);
  return db
    .prepare('SELECT * FROM sets WHERE id = ?')
    .get(result.lastInsertRowid) as SetRecord;
}

export function hasEntryForDate(exerciseId: number, loggedDate: string): boolean {
  const db = getDb();
  const row = db
    .prepare('SELECT 1 FROM sets WHERE exercise_id = ? AND logged_date = ? LIMIT 1')
    .get(exerciseId, loggedDate);
  return !!row;
}

export function deleteSetsByDate(exerciseId: number, loggedDate: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sets WHERE exercise_id = ? AND logged_date = ?').run(exerciseId, loggedDate);
}

export function getRecordsByExercise(exerciseId: number): OneRmRecord[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT logged_date, MAX(estimated_1rm_kg) AS estimated_1rm_kg
       FROM sets
       WHERE exercise_id = ?
       GROUP BY logged_date
       ORDER BY logged_date ASC`
    )
    .all(exerciseId) as OneRmRecord[];
}

export function getMaxWeightByReps(exerciseId: number): RepMax[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT reps, MAX(weight_kg) AS weight_kg
       FROM sets
       WHERE exercise_id = ? AND reps <= 15
       GROUP BY reps
       ORDER BY reps ASC`
    )
    .all(exerciseId) as RepMax[];
}

export function getEntriesByExercise(exerciseId: number): LogEntry[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT logged_date, reps, weight_kg
       FROM sets
       WHERE exercise_id = ?
       ORDER BY logged_date ASC`
    )
    .all(exerciseId) as LogEntry[];
}
