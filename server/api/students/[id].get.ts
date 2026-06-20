import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { students, classes, studentTeachers, teachers, studentSessions, sessions } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const id = Number(getRouterParam(e, 'id'))
  const db = getDb()

  const [student] = await db.select().from(students).where(eq(students.id, id))
  if (!student) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const [allClasses, studentTeacherRows, studentSessionRows] = await Promise.all([
    db.select().from(classes),
    db.select().from(studentTeachers)
      .innerJoin(teachers, eq(studentTeachers.teacherId, teachers.id))
      .where(eq(studentTeachers.studentId, id)),
    db.select().from(studentSessions)
      .innerJoin(sessions, eq(studentSessions.sessionId, sessions.id))
      .where(eq(studentSessions.studentId, id)),
  ])

  const classMap = new Map(allClasses.map(c => [c.id, c.name]))

  return {
    ...student,
    className: student.classId ? (classMap.get(student.classId) ?? null) : null,
    teachers: studentTeacherRows.map(r => ({ id: r.teachers.id, name: r.teachers.name, surname: r.teachers.surname })),
    sessions: studentSessionRows.map(r => ({ id: r.sessions.id, name: r.sessions.name })),
  }
})
