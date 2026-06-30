import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { teacherDisciplines } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const db = getDb()
  const rows = await db.select({ disciplineId: teacherDisciplines.disciplineId })
    .from(teacherDisciplines)
    .where(eq(teacherDisciplines.teacherId, id))
  return rows.map(r => r.disciplineId)
})
