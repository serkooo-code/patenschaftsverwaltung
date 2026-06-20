import { requireAdmin } from '~/server/utils/auth'
import { deleteOne } from '~/server/utils/crud'
import { evaluationPeriods } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  await deleteOne(evaluationPeriods, Number(getRouterParam(e, 'id')))
  return { ok: true }
})
