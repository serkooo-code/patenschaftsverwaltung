import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { teacherDisciplines } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  const sessionUser = (await requireAuth(e)) as any
  const db = getDb()
  const teacherId: number | null = sessionUser.teacherId ?? null

  if (!teacherId) return null // Admin: kein Filter, alle Branşlar anzeigen

  const rows = await db.select({ disciplineId: teacherDisciplines.disciplineId })
    .from(teacherDisciplines)
    .where(eq(teacherDisciplines.teacherId, teacherId))

  return rows.map(r => r.disciplineId)
})
