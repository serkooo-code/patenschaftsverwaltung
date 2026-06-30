import { requireAdmin } from '~/server/utils/auth'
import { updateOne } from '~/server/utils/crud'
import { modules } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const { name } = await readBody<{ name: string }>(e)
  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name required' })
  return updateOne(modules, id, { name })
})
