import { eq } from 'drizzle-orm'
import { getDb } from '~/server/utils/db'
import { users, teachers } from '~/server/db/schema'
import { requireAdmin } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  return getDb()
    .select({ id: users.id, email: users.email, role: users.role, teacherId: users.teacherId,
      teacherName: teachers.name, createdAt: users.createdAt })
    .from(users)
    .leftJoin(teachers, eq(users.teacherId, teachers.id))
})
