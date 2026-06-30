import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { classes, classTeachers, students } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  const sessionUser = (await requireAuth(e)) as any
  const db = getDb()
  const teacherId: number | null = sessionUser.teacherId ?? null

  const allClasses = await db.select().from(classes)
  const allStudents = await db.select().from(students)

  let relevantClassIds: number[]

  if (teacherId) {
    const rows = await db.select({ classId: classTeachers.classId })
      .from(classTeachers)
      .where(eq(classTeachers.teacherId, teacherId))
    relevantClassIds = rows.map(r => r.classId)
  } else {
    // Admin ohne Lehrer-Verknüpfung: alle Schulen anzeigen
    relevantClassIds = allClasses.map(c => c.id)
  }

  return relevantClassIds
    .map(id => allClasses.find(c => c.id === id))
    .filter(Boolean)
    .sort((a, b) => (parseInt(a!.schoolNo ?? '') || 0) - (parseInt(b!.schoolNo ?? '') || 0))
    .map(c => ({
      id: c!.id,
      name: c!.name,
      schoolNo: c!.schoolNo,
      students: allStudents
        .filter(s => s.classId === c!.id)
        .sort((a, b) => {
          const s = a.surname.localeCompare(b.surname, 'tr')
          return s !== 0 ? s : a.name.localeCompare(b.name, 'tr')
        })
        .map(s => ({ id: s.id, name: s.name, surname: s.surname, studentNo: s.studentNo })),
    }))
})
