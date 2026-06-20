import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { classes } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const { name } = await readBody<{ name: string }>(e)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name required' })

  const db = getDb()
  const [updated] = await db.update(classes).set({ name }).where(eq(classes.id, id)).returning()
  return updated
})
