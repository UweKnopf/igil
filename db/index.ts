import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

// You can instead use useRuntimeConfig().databaseUrl where appropriate.
const connectionString = process.env.POSTGRESS_TEST_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new Pool({
  connectionString,
})

export const db = drizzle({ client: pool })