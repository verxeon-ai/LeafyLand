import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis

function withExplicitSsl(connectionString) {
    try {
        const url = new URL(connectionString)
        const mode = url.searchParams.get('sslmode')
        if (mode === 'require' || mode === 'prefer' || mode === 'verify-ca') {
            url.searchParams.set('sslmode', 'verify-full')
        }
        return url.toString()
    } catch {
        return connectionString
    }
}

function createPrisma() {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
        throw new Error('DATABASE_URL is not set')
    }

    const pool =
        globalForPrisma.pgPool ||
        new Pool({
            connectionString: withExplicitSsl(connectionString),
            max: 10,
            idleTimeoutMillis: 30_000,
            connectionTimeoutMillis: 10_000,
        })

    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.pgPool = pool
    }

    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma || createPrisma()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
