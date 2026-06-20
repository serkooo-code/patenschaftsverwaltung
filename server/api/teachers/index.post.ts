import { requireAdmin } from '~/server/utils/auth'
import { insertOne } from '~/server/utils/crud'
import { teachers } from '~/server/db/schema'
export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const body = await readBody<{ name: string; surname: string; teacherNo: string }>(e)
  if (!body.name || !body.surname || !body.teacherNo)
    throw createError({ statusCode: 400, statusMessage: 'name, surname, teacherNo required' })
  return insertOne(teachers, body)
})
