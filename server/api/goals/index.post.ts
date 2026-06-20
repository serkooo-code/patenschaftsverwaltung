import { requireAdmin } from '~/server/utils/auth'
import { insertOne } from '~/server/utils/crud'
import { goals } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{ name: string; minAge?: number; maxAge?: number }>(e)
  if (!body.name) throw createError({ statusCode: 400, statusMessage: 'Name required' })
  return insertOne(goals, body)
})
