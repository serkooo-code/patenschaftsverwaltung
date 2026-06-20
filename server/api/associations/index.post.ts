import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { moduleGoals, sessionModules, disciplineSessions, teacherDisciplines, classTeachers } from '~/server/db/schema'

type AssocType = 'moduleGoal' | 'sessionModule' | 'disciplineSession' | 'teacherDiscipline' | 'classTeacher'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{ type: AssocType; a: number; b: number }>(e)
  const db = getDb()

  const map: Record<AssocType, () => Promise<unknown>> = {
    moduleGoal: () => db.insert(moduleGoals).values({ moduleId: body.a, goalId: body.b }).onConflictDoNothing(),
    sessionModule: () => db.insert(sessionModules).values({ sessionId: body.a, moduleId: body.b }).onConflictDoNothing(),
    disciplineSession: () => db.insert(disciplineSessions).values({ disciplineId: body.a, sessionId: body.b }).onConflictDoNothing(),
    teacherDiscipline: () => db.insert(teacherDisciplines).values({ teacherId: body.a, disciplineId: body.b }).onConflictDoNothing(),
    classTeacher: () => db.insert(classTeachers).values({ classId: body.a, teacherId: body.b }).onConflictDoNothing(),
  }
  await map[body.type]()
  return { ok: true }
})
