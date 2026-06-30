import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { teachers, classTeachers, classes, teacherDisciplines, disciplines } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const db = getDb()
  const [allTeachers, ctRows, tdRows] = await Promise.all([
    db.select().from(teachers).orderBy(teachers.teacherNo),
    db.select({ teacherId: classTeachers.teacherId, classId: classes.id, name: classes.name, schoolNo: classes.schoolNo })
      .from(classTeachers).innerJoin(classes, eq(classTeachers.classId, classes.id)),
    db.select({ teacherId: teacherDisciplines.teacherId, disciplineId: disciplines.id, name: disciplines.name })
      .from(teacherDisciplines).innerJoin(disciplines, eq(teacherDisciplines.disciplineId, disciplines.id)),
  ])

  return allTeachers.map(t => ({
    ...t,
    schools: ctRows
      .filter(r => r.teacherId === t.id)
      .sort((a, b) => (parseInt(a.schoolNo ?? '') || 0) - (parseInt(b.schoolNo ?? '') || 0))
      .map(r => ({ id: r.classId, name: r.name, schoolNo: r.schoolNo })),
    disciplines: tdRows
      .filter(r => r.teacherId === t.id)
      .map(r => ({ id: r.disciplineId, name: r.name })),
  }))
})
