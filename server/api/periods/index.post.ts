import { requireAdmin } from '~/server/utils/auth'
import { insertOne } from '~/server/utils/crud'
import { evaluationPeriods } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{ name: string; startDate: string; endDate: string }>(e)
  if (!body.name || !body.startDate || !body.endDate)
    throw createError({ statusCode: 400, statusMessage: 'name, startDate, endDate required' })
  return insertOne(evaluationPeriods, body)
})
