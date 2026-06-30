import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { studentTeachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{ studentId: number; teacherId: number }>(e)
  const db = getDb()
  await db.insert(studentTeachers).values({ studentId: body.studentId, teacherId: body.teacherId }).onConflictDoNothing()
  return { ok: true }
})
