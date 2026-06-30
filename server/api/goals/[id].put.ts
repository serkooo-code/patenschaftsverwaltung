import { requireAdmin } from '~/server/utils/auth'
import { updateOne } from '~/server/utils/crud'
import { goals } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const body = await readBody<{ name: string; minAge?: number | null; maxAge?: number | null }>(e)
  if (!body.name) throw createError({ statusCode: 400, statusMessage: 'Name required' })
  return updateOne(goals, id, { name: body.name, minAge: body.minAge ?? null, maxAge: body.maxAge ?? null })
})
