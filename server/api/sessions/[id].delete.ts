import { requireAdmin } from '~/server/utils/auth'
import { deleteOne } from '~/server/utils/crud'
import { sessions } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  await deleteOne(sessions, Number(getRouterParam(e, 'id')))
  return { ok: true }
})
