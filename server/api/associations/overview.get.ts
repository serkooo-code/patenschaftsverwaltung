import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { classes, classTeachers, teachers, students } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const db = getDb()

  const [allClasses, classTeacherRows, allTeachers, allStudents] = await Promise.all([
    db.select().from(classes),
    db.select({
      classId: classTeachers.classId,
      teacherId: classTeachers.teacherId,
    }).from(classTeachers),
    db.select({ id: teachers.id, name: teachers.name, surname: teachers.surname, teacherNo: teachers.teacherNo }).from(teachers),
    db.select({ id: students.id, name: students.name, surname: students.surname, studentNo: students.studentNo, classId: students.classId }).from(students),
  ])

  const teacherMap = new Map(allTeachers.map(t => [t.id, t]))

  return allClasses
    .sort((a, b) => (parseInt(a.schoolNo ?? '') || 0) - (parseInt(b.schoolNo ?? '') || 0))
    .map(c => ({
      id: c.id,
      schoolNo: c.schoolNo,
      name: c.name,
      teachers: classTeacherRows
        .filter(ct => ct.classId === c.id)
        .map(ct => teacherMap.get(ct.teacherId))
        .filter(Boolean)
        .sort((a, b) => a!.surname.localeCompare(b!.surname)),
      students: allStudents
        .filter(s => s.classId === c.id)
        .sort((a, b) => a.surname.localeCompare(b.surname)),
    }))
})
