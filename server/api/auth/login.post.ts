import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'
import { getDb } from '~/server/utils/db'
import { users } from '~/server/db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody<{ email: string; password: string }>(event)

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email and password required' })
  }

  const db = getDb()
  const [user] = await db.select().from(users).where(eq(users.email, body.email.toLowerCase()))

  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })
  }

  await setUserSession(event, {
    user: { id: user.id, email: user.email, role: user.role, teacherId: user.teacherId ?? null },
  })

  return { ok: true }
})
