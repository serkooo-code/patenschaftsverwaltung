import { and, eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { goalResults } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const body = await readBody<{
    studentId: number; goalId: number; teacherId: number; periodId: number
    result: 'completed' | 'working' | 'pending'; notes?: string
  }>(e)

  const db = getDb()
  const now = new Date().toISOString()

  // Upsert: one result per (student, goal, teacher, period)
  const [existing] = await db.select().from(goalResults).where(
    and(eq(goalResults.studentId, body.studentId), eq(goalResults.goalId, body.goalId),
      eq(goalResults.teacherId, body.teacherId), eq(goalResults.periodId, body.periodId))
  )

  if (existing) {
    const [updated] = await db.update(goalResults)
      .set({ result: body.result, notes: body.notes ?? null, evaluatedAt: now, updatedAt: now })
      .where(eq(goalResults.id, existing.id)).returning()
    return updated
  }

  const [created] = await db.insert(goalResults).values({
    ...body, notes: body.notes ?? null, evaluatedAt: now, createdAt: now, updatedAt: now,
  }).returning()
  return created
})
