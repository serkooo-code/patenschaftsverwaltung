import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { moduleGoals, goals, modules, sessionModules, sessions, disciplineSessions, disciplines, teacherDisciplines, teachers, classTeachers, classes } from '~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const db = getDb()
  const [mgRows, smRows, dsRows, tdRows, ctRows] = await Promise.all([
    db.select({ moduleId: moduleGoals.moduleId, moduleName: modules.name, goalId: goals.id, goalName: goals.name })
      .from(moduleGoals).innerJoin(modules, eq(moduleGoals.moduleId, modules.id)).innerJoin(goals, eq(moduleGoals.goalId, goals.id)),
    db.select({ sessionId: sessionModules.sessionId, sessionName: sessions.name, moduleId: modules.id, moduleName: modules.name })
      .from(sessionModules).innerJoin(sessions, eq(sessionModules.sessionId, sessions.id)).innerJoin(modules, eq(sessionModules.moduleId, modules.id)),
    db.select({ disciplineId: disciplineSessions.disciplineId, disciplineName: disciplines.name, sessionId: sessions.id, sessionName: sessions.name })
      .from(disciplineSessions).innerJoin(disciplines, eq(disciplineSessions.disciplineId, disciplines.id)).innerJoin(sessions, eq(disciplineSessions.sessionId, sessions.id)),
    db.select({ teacherId: teacherDisciplines.teacherId, teacherName: teachers.name, teacherSurname: teachers.surname, disciplineId: disciplines.id, disciplineName: disciplines.name })
      .from(teacherDisciplines).innerJoin(teachers, eq(teacherDisciplines.teacherId, teachers.id)).innerJoin(disciplines, eq(teacherDisciplines.disciplineId, disciplines.id)),
    db.select({ classId: classTeachers.classId, className: classes.name, teacherId: teachers.id, teacherName: teachers.name, teacherSurname: teachers.surname })
      .from(classTeachers).innerJoin(classes, eq(classTeachers.classId, classes.id)).innerJoin(teachers, eq(classTeachers.teacherId, teachers.id)),
  ])
  return { moduleGoals: mgRows, sessionModules: smRows, disciplineSessions: dsRows, teacherDisciplines: tdRows, classTeachers: ctRows }
})
