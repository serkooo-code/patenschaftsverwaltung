import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { classTeachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const teacherId = Number(getRouterParam(e, 'id'))
  const body = await readBody<{ classIds: number[] }>(e)
  const db = getDb()

  // Alle bisherigen Zuordnungen löschen und neu setzen
  await db.delete(classTeachers).where(eq(classTeachers.teacherId, teacherId))
  for (const classId of body.classIds) {
    await db.insert(classTeachers).values({ teacherId, classId }).onConflictDoNothing()
  }
  return { ok: true }
})
