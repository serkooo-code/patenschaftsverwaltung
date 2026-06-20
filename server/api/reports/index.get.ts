import { and, eq, sql } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { goalResults, students, studentTeachers, teachers, evaluationPeriods } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const { periodId } = getQuery(e) as { periodId?: string }
  const db = getDb()

  // All periods for filter
  const periods = await db.select().from(evaluationPeriods)

  if (!periodId) return { periods, teachers: [], completionStats: [] }

  const pid = Number(periodId)

  // Per teacher: total students responsible vs evaluated
  const teacherStats = await db.select({
    teacherId: teachers.id,
    teacherName: teachers.name,
    teacherSurname: teachers.surname,
    totalStudents: sql<number>`COUNT(DISTINCT ${studentTeachers.studentId})`,
  }).from(teachers)
    .leftJoin(studentTeachers, eq(studentTeachers.teacherId, teachers.id))
    .groupBy(teachers.id)

  // Per student: completed goal count in period
  const studentCompletion = await db.select({
    studentId: students.id,
    studentName: students.name,
    studentSurname: students.surname,
    completed: sql<number>`SUM(CASE WHEN ${goalResults.result} = 'completed' THEN 1 ELSE 0 END)`,
    working: sql<number>`SUM(CASE WHEN ${goalResults.result} = 'working' THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN ${goalResults.result} = 'pending' THEN 1 ELSE 0 END)`,
    total: sql<number>`COUNT(${goalResults.id})`,
  }).from(goalResults)
    .innerJoin(students, eq(goalResults.studentId, students.id))
    .where(eq(goalResults.periodId, pid))
    .groupBy(students.id)

  return { periods, teacherStats, studentCompletion }
})
