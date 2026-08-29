import { PrismaClient } from '../../generated/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis as unknown as { 
  prisma?: PrismaClient
  pool?: Pool 
}

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  console.warn("⚠️ DATABASE_URL no está definida en las variables de entorno.")
}

export const pool = globalForPrisma.pool ?? new Pool({ connectionString })
export const adapter = new PrismaPg(pool)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}
