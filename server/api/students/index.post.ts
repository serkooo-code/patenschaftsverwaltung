import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { students, studentTeachers, studentSessions } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{
    name: string; surname: string; birthDate: string
    classId?: number; teacherIds?: number[]; sessionIds?: number[]
  }>(e)
  if (!body.name || !body.surname || !body.birthDate)
    throw createError({ statusCode: 400, statusMessage: 'name, surname, birthDate required' })

  const db = getDb()
  const existing = await db.select({ studentNo: students.studentNo }).from(students)
  const maxNo = existing.reduce((m, s) => Math.max(m, parseInt(s.studentNo) || 0), 0)
  const studentNo = String(maxNo + 1)

  const now = new Date().toISOString()
  const [student] = await db.insert(students).values({
    name: body.name, surname: body.surname, studentNo,
    birthDate: body.birthDate, classId: body.classId ?? null, createdAt: now,
  }).returning()

  if (body.teacherIds?.length) {
    await db.insert(studentTeachers).values(
      body.teacherIds.map(tid => ({ studentId: student.id, teacherId: tid }))
    )
  }
  if (body.sessionIds?.length) {
    await db.insert(studentSessions).values(
      body.sessionIds.map(sid => ({ studentId: student.id, sessionId: sid }))
    )
  }
  return student
})
