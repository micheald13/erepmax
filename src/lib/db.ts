import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), 'data', 'erepmax.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require('fs');
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    runMigrations(db);
  }
  return db;
}

function runMigrations(db: Database.Database): void {
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

    CREATE INDEX IF NOT EXISTS idx_sets_exercise_date
      ON sets(exercise_id, logged_date);
  `);

  const seed = db.prepare('INSERT OR IGNORE INTO exercises (name, is_custom) VALUES (?, 0)');
  const seedAll = db.transaction(() => {
    seed.run('Squat');
    seed.run('Bench Press');
    seed.run('Deadlift');
    seed.run('Overhead Press');
  });
  seedAll();
}
