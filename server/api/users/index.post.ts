import bcrypt from 'bcryptjs'
import { getDb } from '~/server/utils/db'
import { users } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const body = await readBody<{ email: string; password: string; role: 'admin' | 'teacher'; teacherId?: number | null }>(event)
  if (!body.email || !body.password)
    throw createError({ statusCode: 400, statusMessage: 'Email and password required' })

  const passwordHash = await bcrypt.hash(body.password, 12)
  const db = getDb()
  const [created] = await db.insert(users).values({
    email: body.email.toLowerCase(),
    passwordHash,
    role: body.role ?? 'teacher',
    teacherId: body.teacherId ?? null,
    createdAt: new Date().toISOString(),
  }).returning({ id: users.id, email: users.email, role: users.role, teacherId: users.teacherId })
  return created
})
