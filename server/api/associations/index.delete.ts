import { and, eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { moduleGoals, sessionModules, disciplineSessions, teacherDisciplines, classTeachers } from '~/server/db/schema'

type AssocType = 'moduleGoal' | 'sessionModule' | 'disciplineSession' | 'teacherDiscipline' | 'classTeacher'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{ type: AssocType; a: number; b: number }>(e)
  const db = getDb()

  const map: Record<AssocType, () => Promise<unknown>> = {
    moduleGoal: () => db.delete(moduleGoals).where(and(eq(moduleGoals.moduleId, body.a), eq(moduleGoals.goalId, body.b))),
    sessionModule: () => db.delete(sessionModules).where(and(eq(sessionModules.sessionId, body.a), eq(sessionModules.moduleId, body.b))),
    disciplineSession: () => db.delete(disciplineSessions).where(and(eq(disciplineSessions.disciplineId, body.a), eq(disciplineSessions.sessionId, body.b))),
    teacherDiscipline: () => db.delete(teacherDisciplines).where(and(eq(teacherDisciplines.teacherId, body.a), eq(teacherDisciplines.disciplineId, body.b))),
    classTeacher: () => db.delete(classTeachers).where(and(eq(classTeachers.classId, body.a), eq(classTeachers.teacherId, body.b))),
  }
  await map[body.type]()
  return { ok: true }
})
