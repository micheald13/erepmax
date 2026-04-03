#!/usr/bin/env node

/**
 * Generates test data for erepmax.
 *
 * Usage:
 *   node scripts/seed.mjs              # writes to ./data/erepmax.db
 *   DB_PATH=/tmp/test.db node scripts/seed.mjs
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'erepmax.db');
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run the same migrations as the app
db.exec(`
  CREATE TABLE IF NOT EXISTS exercises (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    name      TEXT    NOT NULL UNIQUE,
    is_custom INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS sets (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    exercise_id      INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
    logged_date      TEXT    NOT NULL,
    reps             INTEGER NOT NULL,
    weight_kg        REAL    NOT NULL,
    estimated_1rm_kg REAL    NOT NULL,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );
  CREATE INDEX IF NOT EXISTS idx_sets_exercise_date ON sets(exercise_id, logged_date);
`);

const seedExercise = db.prepare('INSERT OR IGNORE INTO exercises (name, is_custom) VALUES (?, 0)');
for (const name of ['Squat', 'Bench Press', 'Deadlift', 'Overhead Press']) {
  seedExercise.run(name);
}

const exercises = db.prepare('SELECT id, name FROM exercises').all();

// Epley formula (matches src/lib/oneRm.ts)
function epley(weight, reps) {
  return reps === 1 ? weight : weight * (1 + reps / 30);
}

// Starting weights (kg) and progression rates per exercise
const profiles = {
  'Squat':          { start: 80,  progression: 0.4 },
  'Bench Press':    { start: 60,  progression: 0.25 },
  'Deadlift':       { start: 100, progression: 0.45 },
  'Overhead Press': { start: 40,  progression: 0.2 },
};

const repSchemes = [1, 3, 5, 8, 10];
const WEEKS = 26; // ~6 months of data

const insertSet = db.prepare(`
  INSERT INTO sets (exercise_id, logged_date, reps, weight_kg, estimated_1rm_kg)
  VALUES (?, ?, ?, ?, ?)
`);

const insertAll = db.transaction(() => {
  const today = new Date();

  for (const ex of exercises) {
    const profile = profiles[ex.name] ?? { start: 50, progression: 0.3 };

    for (let week = 0; week < WEEKS; week++) {
      // One session per week, random day offset 0-2
      const date = new Date(today);
      date.setDate(date.getDate() - (WEEKS - week) * 7 + Math.floor(Math.random() * 3));
      const dateStr = date.toISOString().slice(0, 10);

      // Pick 2-3 rep schemes per session
      const sessionReps = repSchemes
        .sort(() => Math.random() - 0.5)
        .slice(0, 2 + Math.floor(Math.random() * 2));

      for (const reps of sessionReps) {
        // Progressive overload with some noise
        const noise = 1 + (Math.random() - 0.5) * 0.08; // +/- 4%
        const weight = Math.round((profile.start + week * profile.progression) * noise * 2) / 2; // round to 0.5kg
        const e1rm = epley(weight, reps);

        insertSet.run(ex.id, dateStr, reps, weight, e1rm);
      }
    }
  }
});

insertAll();

const count = db.prepare('SELECT COUNT(*) AS n FROM sets').get();
console.log(`Seeded ${count.n} sets across ${exercises.length} exercises into ${DB_PATH}`);
db.close();
