import { eq, sql } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { goalResults, students, studentTeachers, teachers, evaluationPeriods } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const { periodId } = getQuery(e) as { periodId?: string }
  const db = getDb()

  const periods = await db.select().from(evaluationPeriods)
  if (!periodId) return { periods, teacherStats: [], studentCompletion: [] }

  const pid = Number(periodId)

  // All students
  const allStudents = await db.select({ id: students.id, name: students.name, surname: students.surname }).from(students)
  const studentMap = new Map(allStudents.map(s => [s.id, s]))

  // All teacher-student assignments
  const allST = await db.select({ teacherId: studentTeachers.teacherId, studentId: studentTeachers.studentId }).from(studentTeachers)

  // Students that have at least one goal result in this period (by teacher)
  const periodResults = await db.select({ studentId: goalResults.studentId, teacherId: goalResults.teacherId })
    .from(goalResults)
    .where(eq(goalResults.periodId, pid))
  const evaluatedByTeacher = new Map<number, Set<number>>()
  for (const r of periodResults) {
    if (!evaluatedByTeacher.has(r.teacherId)) evaluatedByTeacher.set(r.teacherId, new Set())
    evaluatedByTeacher.get(r.teacherId)!.add(r.studentId)
  }

  // All teachers
  const allTeachers = await db.select({ id: teachers.id, name: teachers.name, surname: teachers.surname }).from(teachers)

  // Build per-teacher student list
  const teacherStudentMap = new Map<number, any[]>()
  for (const st of allST) {
    if (!teacherStudentMap.has(st.teacherId)) teacherStudentMap.set(st.teacherId, [])
    const s = studentMap.get(st.studentId)
    if (!s) continue
    const evaluated = evaluatedByTeacher.get(st.teacherId)?.has(st.studentId) ?? false
    teacherStudentMap.get(st.teacherId)!.push({ studentId: s.id, studentName: s.name, studentSurname: s.surname, evaluated })
  }

  const teacherStats = allTeachers
    .map(t => {
      const studentList = (teacherStudentMap.get(t.id) ?? [])
        .sort((a, b) => {
          // Open first, then by surname
          if (a.evaluated !== b.evaluated) return a.evaluated ? 1 : -1
          return a.studentSurname.localeCompare(b.studentSurname, 'tr')
        })
      return {
        teacherId: t.id,
        teacherName: t.name,
        teacherSurname: t.surname,
        totalStudents: studentList.length,
        evaluatedCount: studentList.filter(s => s.evaluated).length,
        students: studentList,
      }
    })
    .filter(t => t.totalStudents > 0)
    .sort((a, b) => a.teacherSurname.localeCompare(b.teacherSurname, 'tr'))

  // Per student: goal completion in period
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
