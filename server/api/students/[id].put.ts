import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { students, studentTeachers, studentSessions } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const body = await readBody<{
    name: string; surname: string; birthDate: string
    classId?: number | null; teacherIds?: number[]; sessionIds?: number[]
  }>(e)

  const db = getDb()
  const [existing] = await db.select().from(students).where(eq(students.id, id))
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  await db.update(students).set({
    name: body.name,
    surname: body.surname,
    birthDate: body.birthDate,
    classId: body.classId ?? null,
  }).where(eq(students.id, id))

  if (body.teacherIds !== undefined) {
    await db.delete(studentTeachers).where(eq(studentTeachers.studentId, id))
    if (body.teacherIds.length) {
      await db.insert(studentTeachers).values(
        body.teacherIds.map(tid => ({ studentId: id, teacherId: tid }))
      )
    }
  }

  if (body.sessionIds !== undefined) {
    await db.delete(studentSessions).where(eq(studentSessions.studentId, id))
    if (body.sessionIds.length) {
      await db.insert(studentSessions).values(
        body.sessionIds.map(sid => ({ studentId: id, sessionId: sid }))
      )
    }
  }

  return { ok: true }
})
