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

  return db.select({
    id: goalResults.id, result: goalResults.result, notes: goalResults.notes, evaluatedAt: goalResults.evaluatedAt,
    studentId: students.id, studentName: students.name, studentSurname: students.surname,
    goalId: goals.id, goalName: goals.name,
    periodId: evaluationPeriods.id, periodName: evaluationPeriods.name,
    teacherId: teachers.id, teacherName: teachers.name, teacherSurname: teachers.surname,
  })
    .from(goalResults)
    .innerJoin(students, eq(goalResults.studentId, students.id))
    .innerJoin(goals, eq(goalResults.goalId, goals.id))
    .innerJoin(evaluationPeriods, eq(goalResults.periodId, evaluationPeriods.id))
    .innerJoin(teachers, eq(goalResults.teacherId, teachers.id))
    .where(conditions.length ? and(...conditions) : undefined)
})
