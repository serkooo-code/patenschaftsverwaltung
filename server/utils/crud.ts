import { eq } from 'drizzle-orm'
import type { SQLiteTable } from 'drizzle-orm/sqlite-core'
import { getDb } from './db'

export async function listAll(table: SQLiteTable) {
  return getDb().select().from(table)
}

export async function findById(table: SQLiteTable, id: number) {
  const [row] = await getDb().select().from(table).where(eq((table as any).id, id))
  return row ?? null
}

export async function insertOne(table: SQLiteTable, values: Record<string, unknown>) {
  const now = new Date().toISOString()
  const [row] = await getDb().insert(table).values({ ...values, createdAt: now }).returning()
  return row
}

export async function updateOne(table: SQLiteTable, id: number, values: Record<string, unknown>) {
  const [row] = await getDb().update(table).set(values).where(eq((table as any).id, id)).returning()
  return row ?? null
}

export async function deleteOne(table: SQLiteTable, id: number) {
  await getDb().delete(table).where(eq((table as any).id, id))
}
