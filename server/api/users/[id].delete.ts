import { eq } from 'drizzle-orm'
import { getDb } from '~/server/utils/db'
import { users } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const admin = await requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))

  if (admin.id === id) {
    throw createError({ statusCode: 400, statusMessage: 'Cannot delete yourself' })
  }

  const db = getDb()
  const [existing] = await db.select().from(users).where(eq(users.id, id))
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  await db.delete(users).where(eq(users.id, id))
  return { ok: true }
})
