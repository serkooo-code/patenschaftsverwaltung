/**
 * Creates the initial admin user.
 * Run AFTER the container has started at least once (so the DB schema is initialised).
 * Usage:   node scripts/seed-admin.mjs <email> <password>
 * Example: node scripts/seed-admin.mjs admin@example.com secret123
 * Env:     DB_PATH — path to the SQLite file (default: ./app.db)
 */
import { DatabaseSync } from 'node:sqlite'

const [,, email, password] = process.argv
if (!email || !password) {
  console.error('Usage: node scripts/seed-admin.mjs <email> <password>')
  process.exit(1)
}

const { hashSync } = await import('bcryptjs')
const hash = hashSync(password, 12)
const dbPath = process.env.DB_PATH ?? './app.db'
const db = new DatabaseSync(dbPath)

// Schema is created by the app on first request — do not create tables here
// to avoid schema drift between this script and server/utils/db.ts.
const stmt = db.prepare(`
  INSERT INTO users (email, password_hash, role, created_at)
  VALUES (?, ?, 'admin', ?)
  ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, role = 'admin'
`)

stmt.run(email.toLowerCase(), hash, new Date().toISOString())
console.log(`Admin user '${email}' created/updated.`)
db.close()
