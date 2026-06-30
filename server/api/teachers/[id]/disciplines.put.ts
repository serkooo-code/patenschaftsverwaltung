import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { teacherDisciplines } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const { disciplineIds } = await readBody<{ disciplineIds: number[] }>(e)
  const db = getDb()

  await db.delete(teacherDisciplines).where(eq(teacherDisciplines.teacherId, id))
  if (disciplineIds?.length) {
    await db.insert(teacherDisciplines).values(
      disciplineIds.map(disciplineId => ({ teacherId: id, disciplineId }))
    )
  }
  return { ok: true }
})
