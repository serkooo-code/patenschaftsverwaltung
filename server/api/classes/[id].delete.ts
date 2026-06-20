import { requireAdmin } from '~/server/utils/auth'
import { deleteOne } from '~/server/utils/crud'
import { classes } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  await deleteOne(classes, Number(getRouterParam(e, 'id')))
  return { ok: true }
})
