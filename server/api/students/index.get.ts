import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { students, classes } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const db = getDb()
  const [allStudents, allClasses] = await Promise.all([
    db.select().from(students),
    db.select().from(classes),
  ])
  const classMap = new Map(allClasses.map(c => [c.id, c.name]))
  return allStudents.map(s => ({
    id: s.id,
    name: s.name,
    surname: s.surname,
    studentNo: s.studentNo,
    birthDate: s.birthDate,
    classId: s.classId,
    className: s.classId ? (classMap.get(s.classId) ?? null) : null,
    createdAt: s.createdAt,
  }))
})
