import { eq, ne, and } from 'drizzle-orm'
import { requireAdmin } from '~/server/utils/auth'
import { getDb } from '~/server/utils/db'
import { teachers } from '~/server/db/schema'

export default defineEventHandler(async (e) => {
  await requireAdmin(e)
  const id = Number(getRouterParam(e, 'id'))
  const body = await readBody<{ name: string; surname: string; teacherNo: string }>(e)

  const db = getDb()
  const [existing] = await db.select().from(teachers).where(eq(teachers.id, id))
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  if (body.teacherNo) {
    const [duplicate] = await db.select().from(teachers)
      .where(and(eq(teachers.teacherNo, body.teacherNo), ne(teachers.id, id)))
    if (duplicate) throw createError({ statusCode: 409, statusMessage: 'Öğretmen No bereits vergeben' })
  }

  const [updated] = await db.update(teachers)
    .set({ name: body.name, surname: body.surname, ...(body.teacherNo ? { teacherNo: body.teacherNo } : {}) })
    .where(eq(teachers.id, id)).returning()
  return updated
})
