import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { moduleGoals, goals, modules, sessionModules, sessions, disciplineSessions, disciplines } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const db = getDb()

  const [
    allModules, allGoals, allSessions, allDisciplines,
    mgRows, smRows, dsRows,
  ] = await Promise.all([
    db.select({ id: modules.id, name: modules.name }).from(modules),
    db.select({ id: goals.id, name: goals.name }).from(goals),
    db.select({ id: sessions.id, name: sessions.name }).from(sessions),
    db.select({ id: disciplines.id, name: disciplines.name }).from(disciplines),
    db.select({ moduleId: moduleGoals.moduleId, goalId: moduleGoals.goalId }).from(moduleGoals),
    db.select({ sessionId: sessionModules.sessionId, moduleId: sessionModules.moduleId }).from(sessionModules),
    db.select({ disciplineId: disciplineSessions.disciplineId, sessionId: disciplineSessions.sessionId }).from(disciplineSessions),
  ])

  const moduleMap = new Map(allModules.map(m => [m.id, m.name]))
  const goalMap = new Map(allGoals.map(g => [g.id, g.name]))
  const sessionMap = new Map(allSessions.map(s => [s.id, s.name]))
  const disciplineMap = new Map(allDisciplines.map(d => [d.id, d.name]))

  return {
    moduleGoal: mgRows.map(r => ({
      moduleId: r.moduleId, moduleName: moduleMap.get(r.moduleId),
      goalId: r.goalId, goalName: goalMap.get(r.goalId),
    })),
    sessionModule: smRows.map(r => ({
      sessionId: r.sessionId, sessionName: sessionMap.get(r.sessionId),
      moduleId: r.moduleId, moduleName: moduleMap.get(r.moduleId),
    })),
    disciplineSession: dsRows.map(r => ({
      disciplineId: r.disciplineId, disciplineName: disciplineMap.get(r.disciplineId),
      sessionId: r.sessionId, sessionName: sessionMap.get(r.sessionId),
    })),
  }
})
