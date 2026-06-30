import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { students, classes, studentSessions, sessions } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const db = getDb()
  const [allStudents, allClasses, ssRows, allSessions] = await Promise.all([
    db.select().from(students),
    db.select().from(classes),
    db.select({ studentId: studentSessions.studentId, sessionId: studentSessions.sessionId }).from(studentSessions),
    db.select({ id: sessions.id, name: sessions.name }).from(sessions),
  ])
  const classMap = new Map(allClasses.map(c => [c.id, c.name]))
  const sessionMap = new Map(allSessions.map(s => [s.id, s.name]))

  const sessionsById = new Map<number, { id: number; name: string }[]>()
  for (const r of ssRows) {
    if (!sessionsById.has(r.studentId)) sessionsById.set(r.studentId, [])
    sessionsById.get(r.studentId)!.push({ id: r.sessionId, name: sessionMap.get(r.sessionId) ?? '' })
  }

  return allStudents.map(s => ({
    id: s.id,
    name: s.name,
    surname: s.surname,
    studentNo: s.studentNo,
    birthDate: s.birthDate,
    classId: s.classId,
    className: s.classId ? (classMap.get(s.classId) ?? null) : null,
    sessions: (sessionsById.get(s.id) ?? []).sort((a, b) => a.id - b.id),
    createdAt: s.createdAt,
  }))
})
