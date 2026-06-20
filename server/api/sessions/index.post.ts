import { requireAdmin } from '~/server/utils/auth'
import { insertOne } from '~/server/utils/crud'
import { sessions } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const { name } = await readBody<{ name: string }>(e)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name required' })
  return insertOne(sessions, { name })
})
