import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { teachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{ name: string; surname: string }>(e)
  if (!body.name || !body.surname)
    throw createError({ statusCode: 400, statusMessage: 'name, surname required' })

  const db = getDb()
  const existing = await db.select({ teacherNo: teachers.teacherNo }).from(teachers)
  const maxNo = existing.reduce((m, t) => Math.max(m, parseInt(t.teacherNo) || 0), 0)
  const teacherNo = String(maxNo + 1)

  const now = new Date().toISOString()
  const [teacher] = await db.insert(teachers).values({
    name: body.name, surname: body.surname, teacherNo, createdAt: now,
  }).returning()
  return teacher
})
