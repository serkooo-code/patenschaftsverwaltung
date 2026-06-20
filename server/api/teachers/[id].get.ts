import { eq } from 'drizzle-orm'
import { requireAuth } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { teachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAuth(e)
  const id = Number(getRouterParam(e, 'id'))
  const db = getDb()
  const [teacher] = await db.select().from(teachers).where(eq(teachers.id, id))
  if (!teacher) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return teacher
})
