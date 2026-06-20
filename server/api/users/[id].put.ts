import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { getDb } from '~/server/utils/db'
import { users } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody<{ role?: 'admin' | 'editor' | 'viewer'; password?: string }>(event)

  const db = getDb()
  const [existing] = await db.select().from(users).where(eq(users.id, id))
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const updates: Partial<typeof existing> = {}
  if (body.role) updates.role = body.role
  if (body.password) updates.passwordHash = await bcrypt.hash(body.password, 12)

  const [updated] = await db.update(users).set(updates).where(eq(users.id, id))
    .returning({ id: users.id, email: users.email, role: users.role, createdAt: users.createdAt })

  return updated
})
