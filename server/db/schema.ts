import { sqliteTable, integer, text, primaryKey } from 'drizzle-orm/sqlite-core'

// ── Core lookup tables ────────────────────────────────────────────────────────

export const classes = sqliteTable('classes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  schoolNo: text('school_no').unique(),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const sessions = sqliteTable('sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const modules = sqliteTable('modules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const goals = sqliteTable('goals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  minAge: integer('min_age'),
  maxAge: integer('max_age'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const disciplines = sqliteTable('disciplines', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const evaluationPeriods = sqliteTable('evaluation_periods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ── People ────────────────────────────────────────────────────────────────────

export const teachers = sqliteTable('teachers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  teacherNo: text('teacher_no').notNull().unique(),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

export const students = sqliteTable('students', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  studentNo: text('student_no').notNull().unique(),
  birthDate: text('birth_date').notNull(),
  classId: integer('class_id').references(() => classes.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ── Auth users ────────────────────────────────────────────────────────────────

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role', { enum: ['admin', 'teacher'] }).notNull().default('teacher'),
  teacherId: integer('teacher_id').references(() => teachers.id),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ── Association tables ────────────────────────────────────────────────────────

// Module → Goals (modüle hedef)
export const moduleGoals = sqliteTable('module_goals', {
  moduleId: integer('module_id').notNull().references(() => modules.id),
  goalId: integer('goal_id').notNull().references(() => goals.id),
}, t => [primaryKey({ columns: [t.moduleId, t.goalId] })])

// Session → Modules (seansa modül)
export const sessionModules = sqliteTable('session_modules', {
  sessionId: integer('session_id').notNull().references(() => sessions.id),
  moduleId: integer('module_id').notNull().references(() => modules.id),
}, t => [primaryKey({ columns: [t.sessionId, t.moduleId] })])

// Discipline → Sessions (branşa seans)
export const disciplineSessions = sqliteTable('discipline_sessions', {
  disciplineId: integer('discipline_id').notNull().references(() => disciplines.id),
  sessionId: integer('session_id').notNull().references(() => sessions.id),
}, t => [primaryKey({ columns: [t.disciplineId, t.sessionId] })])

// Teacher → Disciplines (öğretmene branş)
export const teacherDisciplines = sqliteTable('teacher_disciplines', {
  teacherId: integer('teacher_id').notNull().references(() => teachers.id),
  disciplineId: integer('discipline_id').notNull().references(() => disciplines.id),
}, t => [primaryKey({ columns: [t.teacherId, t.disciplineId] })])

// Class → Teachers (şubeye öğretmen)
export const classTeachers = sqliteTable('class_teachers', {
  classId: integer('class_id').notNull().references(() => classes.id),
  teacherId: integer('teacher_id').notNull().references(() => teachers.id),
}, t => [primaryKey({ columns: [t.classId, t.teacherId] })])

// Student → Teachers (sorumlu öğretmenler)
export const studentTeachers = sqliteTable('student_teachers', {
  studentId: integer('student_id').notNull().references(() => students.id),
  teacherId: integer('teacher_id').notNull().references(() => teachers.id),
}, t => [primaryKey({ columns: [t.studentId, t.teacherId] })])

// Student → Sessions (öğrencinin seansları)
export const studentSessions = sqliteTable('student_sessions', {
  studentId: integer('student_id').notNull().references(() => students.id),
  sessionId: integer('session_id').notNull().references(() => sessions.id),
}, t => [primaryKey({ columns: [t.studentId, t.sessionId] })])

// ── Evaluation results ────────────────────────────────────────────────────────

export const goalResults = sqliteTable('goal_results', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  studentId: integer('student_id').notNull().references(() => students.id),
  goalId: integer('goal_id').notNull().references(() => goals.id),
  teacherId: integer('teacher_id').notNull().references(() => teachers.id),
  periodId: integer('period_id').notNull().references(() => evaluationPeriods.id),
  result: text('result', { enum: ['completed', 'working', 'pending'] }).notNull().default('pending'),
  notes: text('notes'),
  evaluatedAt: text('evaluated_at'),
  createdAt: text('created_at').notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at').notNull().$defaultFn(() => new Date().toISOString()),
})

// ── Types ─────────────────────────────────────────────────────────────────────

export type Student = typeof students.$inferSelect
export type Teacher = typeof teachers.$inferSelect
export type Class = typeof classes.$inferSelect
export type Session = typeof sessions.$inferSelect
export type Module = typeof modules.$inferSelect
export type Goal = typeof goals.$inferSelect
export type Discipline = typeof disciplines.$inferSelect
export type EvaluationPeriod = typeof evaluationPeriods.$inferSelect
export type GoalResult = typeof goalResults.$inferSelect
export type User = typeof users.$inferSelect
