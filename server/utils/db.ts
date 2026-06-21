import { drizzle } from 'drizzle-orm/sqlite-proxy'
import { DatabaseSync } from 'node:sqlite'
import * as schema from '../db/schema'

const dbPath = process.env.DB_PATH ?? '/data/app.db'

let _sqlite: DatabaseSync | null = null
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDb() {
  if (!_db) {
    _sqlite = new DatabaseSync(dbPath)
    initSchema(_sqlite)
    _db = drizzle(
      async (sql, params, method) => {
        const stmt = _sqlite!.prepare(sql)
        if (method === 'run') {
          stmt.run(...(params as unknown[]))
          return { rows: [] }
        }
        const rows = stmt.all(...(params as unknown[])) as Record<string, unknown>[]
        if (method === 'get') {
          return { rows: rows.length > 0 ? Object.values(rows[0]) : [] }
        }
        return { rows: rows.map(row => Object.values(row)) }
      },
      { schema },
    )
  }
  return _db
}

function initSchema(sqlite: DatabaseSync) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_no TEXT UNIQUE,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      min_age INTEGER,
      max_age INTEGER,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS disciplines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS evaluation_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      teacher_no TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      surname TEXT NOT NULL,
      student_no TEXT NOT NULL UNIQUE,
      birth_date TEXT NOT NULL,
      class_id INTEGER REFERENCES classes(id),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'teacher',
      teacher_id INTEGER REFERENCES teachers(id),
      created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS module_goals (
      module_id INTEGER NOT NULL REFERENCES modules(id),
      goal_id INTEGER NOT NULL REFERENCES goals(id),
      PRIMARY KEY (module_id, goal_id)
    );
    CREATE TABLE IF NOT EXISTS session_modules (
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      module_id INTEGER NOT NULL REFERENCES modules(id),
      PRIMARY KEY (session_id, module_id)
    );
    CREATE TABLE IF NOT EXISTS discipline_sessions (
      discipline_id INTEGER NOT NULL REFERENCES disciplines(id),
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      PRIMARY KEY (discipline_id, session_id)
    );
    CREATE TABLE IF NOT EXISTS teacher_disciplines (
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      discipline_id INTEGER NOT NULL REFERENCES disciplines(id),
      PRIMARY KEY (teacher_id, discipline_id)
    );
    CREATE TABLE IF NOT EXISTS class_teachers (
      class_id INTEGER NOT NULL REFERENCES classes(id),
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      PRIMARY KEY (class_id, teacher_id)
    );
    CREATE TABLE IF NOT EXISTS student_teachers (
      student_id INTEGER NOT NULL REFERENCES students(id),
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      PRIMARY KEY (student_id, teacher_id)
    );
    CREATE TABLE IF NOT EXISTS student_sessions (
      student_id INTEGER NOT NULL REFERENCES students(id),
      session_id INTEGER NOT NULL REFERENCES sessions(id),
      PRIMARY KEY (student_id, session_id)
    );
    CREATE TABLE IF NOT EXISTS goal_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL REFERENCES students(id),
      goal_id INTEGER NOT NULL REFERENCES goals(id),
      teacher_id INTEGER NOT NULL REFERENCES teachers(id),
      period_id INTEGER NOT NULL REFERENCES evaluation_periods(id),
      result TEXT NOT NULL DEFAULT 'pending',
      notes TEXT,
      evaluated_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `)
  // Migrations for columns added after initial schema
  try { sqlite.exec('ALTER TABLE classes ADD COLUMN school_no TEXT') } catch { /* already exists */ }
  try { sqlite.exec('ALTER TABLE users ADD COLUMN teacher_id INTEGER REFERENCES teachers(id)') } catch { /* already exists */ }
  // Backfill school_no for rows that have NULL (created before this migration)
  sqlite.exec(`UPDATE classes SET school_no = CAST(id AS TEXT) WHERE school_no IS NULL`)
}
