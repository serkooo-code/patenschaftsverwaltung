/**
 * Creates the initial admin user.
 * Usage: node scripts/seed-admin.mjs <email> <password>
 * Example: node scripts/seed-admin.mjs admin@example.com secret123
 */
import { DatabaseSync } from 'node:sqlite'
import { createHash } from 'node:crypto'

const [,, email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/seed-admin.mjs <email> <password>')
  process.exit(1)
}

// Dynamic import so this works without the full build
const { hashSync } = await import('bcryptjs')
const hash = hashSync(password, 12)
const dbPath = process.env.DB_PATH ?? './app.db'
const db = new DatabaseSync(dbPath)

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'viewer',
    created_at TEXT NOT NULL
  )
`)

const stmt = db.prepare(`
  INSERT INTO users (email, password_hash, role, created_at)
  VALUES (?, ?, 'admin', ?)
  ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, role = 'admin'
`)

stmt.run(email.toLowerCase(), hash, new Date().toISOString())
console.log(`Admin user '${email}' created/updated.`)
db.close()
