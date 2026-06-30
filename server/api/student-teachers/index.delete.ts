import { and, eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { studentTeachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{ studentId: number; teacherId: number }>(e)
  const db = getDb()
  await db.delete(studentTeachers).where(
    and(eq(studentTeachers.studentId, body.studentId), eq(studentTeachers.teacherId, body.teacherId))
  )
  return { ok: true }
})
