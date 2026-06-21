import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { classes } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const { name } = await readBody<{ name: string }>(e)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name required' })

  const db = getDb()
  const existing = await db.select({ schoolNo: classes.schoolNo }).from(classes)
  const maxNo = existing.reduce((m, c) => Math.max(m, parseInt(c.schoolNo ?? '') || 0), 0)
  const schoolNo = String(maxNo + 1)

  const now = new Date().toISOString()
  const [cls] = await db.insert(classes).values({ name, schoolNo, createdAt: now }).returning()
  return cls
})
