import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { classes, students } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const db = getDb()
  const [allClasses, allStudents] = await Promise.all([
    db.select().from(classes),
    db.select({
      id: students.id,
      name: students.name,
      surname: students.surname,
      studentNo: students.studentNo,
      classId: students.classId,
    }).from(students),
  ])
  return allClasses
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(c => ({
      id: c.id,
      name: c.name,
      students: allStudents
        .filter(s => s.classId === c.id)
        .sort((a, b) => a.surname.localeCompare(b.surname)),
    }))
})
