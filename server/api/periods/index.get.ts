import { requireAuth } from '~/server/utils/auth'
import { listAll } from '~/server/utils/crud'
import { evaluationPeriods } from '~/server/db/schema'
export default defineEventHandler(async (e) => { await requireAuth(e); return listAll(evaluationPeriods) })
