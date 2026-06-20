import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { teachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const body = await readBody<{ name: string; surname: string; teacherNo: string }>(e)

  const db = getDb()
  const [existing] = await db.select().from(teachers).where(eq(teachers.id, id))
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const [updated] = await db.update(teachers).set(body).where(eq(teachers.id, id)).returning()
  return updated
})
