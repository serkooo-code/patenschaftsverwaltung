import { and, eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { goalResults, students, goals, evaluationPeriods, teachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const q = getQuery(e) as { studentId?: string; teacherId?: string; periodId?: string }
  const db = getDb()

  const conditions = []
  if (q.studentId) conditions.push(eq(goalResults.studentId, Number(q.studentId)))
  if (q.teacherId) conditions.push(eq(goalResults.teacherId, Number(q.teacherId)))
  if (q.periodId) conditions.push(eq(goalResults.periodId, Number(q.periodId)))

  const [rows, allStudents, allGoals, allPeriods, allTeachers] = await Promise.all([
    db.select({
      id: goalResults.id, result: goalResults.result, notes: goalResults.notes, evaluatedAt: goalResults.evaluatedAt,
      studentId: goalResults.studentId, goalId: goalResults.goalId,
      periodId: goalResults.periodId, teacherId: goalResults.teacherId,
    })
      .from(goalResults)
      .where(conditions.length ? and(...conditions) : undefined),
    db.select({ id: students.id, name: students.name, surname: students.surname }).from(students),
    db.select({ id: goals.id, name: goals.name }).from(goals),
    db.select({ id: evaluationPeriods.id, name: evaluationPeriods.name }).from(evaluationPeriods),
    db.select({ id: teachers.id, name: teachers.name, surname: teachers.surname }).from(teachers),
  ])

  const studentMap = new Map(allStudents.map(s => [s.id, s]))
  const goalMap = new Map(allGoals.map(g => [g.id, g.name]))
  const periodMap = new Map(allPeriods.map(p => [p.id, p.name]))
  const teacherMap = new Map(allTeachers.map(t => [t.id, t]))

  return rows.map(r => {
    const student = studentMap.get(r.studentId)
    const teacher = teacherMap.get(r.teacherId)
    return {
      id: r.id, result: r.result, notes: r.notes, evaluatedAt: r.evaluatedAt,
      studentId: r.studentId, studentName: student?.name, studentSurname: student?.surname,
      goalId: r.goalId, goalName: goalMap.get(r.goalId),
      periodId: r.periodId, periodName: periodMap.get(r.periodId),
      teacherId: r.teacherId, teacherName: teacher?.name, teacherSurname: teacher?.surname,
    }
  })
})
