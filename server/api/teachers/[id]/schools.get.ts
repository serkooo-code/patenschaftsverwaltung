import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { classTeachers, classes } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const teacherId = Number(getRouterParam(e, 'id'))
  const db = getDb()
  const rows = await db.select({ classId: classTeachers.classId, name: classes.name, schoolNo: classes.schoolNo })
    .from(classTeachers)
    .innerJoin(classes, eq(classTeachers.classId, classes.id))
    .where(eq(classTeachers.teacherId, teacherId))
  return rows.map(r => r.classId)
})
