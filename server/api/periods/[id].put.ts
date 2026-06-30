import { eq } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { evaluationPeriods } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const body = await readBody<{ name: string; startDate: string; endDate: string }>(e)
  if (!body.name || !body.startDate || !body.endDate)
    throw createError({ statusCode: 400, statusMessage: 'All fields required' })
  const db = getDb()
  await db.update(evaluationPeriods)
    .set({ name: body.name, startDate: body.startDate, endDate: body.endDate })
    .where(eq(evaluationPeriods.id, id))
  return { ok: true }
})
