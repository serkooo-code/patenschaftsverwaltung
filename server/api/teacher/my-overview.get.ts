import { eq, inArray } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { classes, students, studentTeachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  const sessionUser = (await requireAuth(e)) as any
  const db = getDb()
  const teacherId: number | null = sessionUser.teacherId ?? null

  const allClasses = await db.select().from(classes)
  const allStudents = await db.select().from(students)

  let myStudentIds: Set<number>

  if (teacherId) {
    const rows = await db.select({ studentId: studentTeachers.studentId })
      .from(studentTeachers)
      .where(eq(studentTeachers.teacherId, teacherId))
    myStudentIds = new Set(rows.map(r => r.studentId))
  } else {
    // Admin ohne Lehrer-Verknüpfung: alle Schüler anzeigen
    myStudentIds = new Set(allStudents.map(s => s.id))
  }

  const myStudents = allStudents.filter(s => myStudentIds.has(s.id))

  // Schulen ermitteln, in denen meine Schüler sind
  const classIds = new Set(myStudents.map(s => s.classId).filter(Boolean))

  return [...classIds]
    .map(id => allClasses.find(c => c.id === id))
    .filter(Boolean)
    .sort((a, b) => (parseInt(a!.schoolNo ?? '') || 0) - (parseInt(b!.schoolNo ?? '') || 0))
    .map(c => ({
      id: c!.id,
      name: c!.name,
      schoolNo: c!.schoolNo,
      students: myStudents
        .filter(s => s.classId === c!.id)
        .sort((a, b) => {
          const s = a.surname.localeCompare(b.surname, 'tr')
          return s !== 0 ? s : a.name.localeCompare(b.name, 'tr')
        })
        .map(s => ({ id: s.id, name: s.name, surname: s.surname, studentNo: s.studentNo })),
    }))
})
