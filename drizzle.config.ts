import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'sqlite' as const,
  dbCredentials: {
    url: process.env.DB_PATH ?? '/data/app.db',
  },
})
