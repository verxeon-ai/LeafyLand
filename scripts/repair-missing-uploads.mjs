import 'dotenv/config'
import { access } from 'node:fs/promises'
import path from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const FALLBACKS = {
    product: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=800&h=800&q=80',
    property: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&h=800&q=80',
    service: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=800&h=800&q=80',
}

const uploadRoots = [
    process.env.UPLOAD_DIR?.trim() ? path.resolve(process.env.UPLOAD_DIR.trim()) : path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'public', 'uploads'),
]

async function fileExists(relative) {
    for (const root of uploadRoots) {
        try {
            await access(path.join(root, relative))
            return true
        } catch {
            /* continue */
        }
    }
    return false
}

async function repairImages(images, kind) {
    if (!Array.isArray(images) || !images.length) return [FALLBACKS[kind]]
    const next = []
    for (const src of images) {
        if (typeof src !== 'string' || !src.trim()) continue
        if (src.startsWith('/uploads/')) {
            const relative = src.replace(/^\/uploads\//, '')
            if (await fileExists(relative)) next.push(src)
            continue
        }
        next.push(src)
    }
    return next.length ? next : [FALLBACKS[kind]]
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

let fixed = 0
for (const [model, kind] of [
    [prisma.product, 'product'],
    [prisma.property, 'property'],
    [prisma.service, 'service'],
]) {
    const rows = await model.findMany({ select: { id: true, images: true } })
    for (const row of rows) {
        const images = await repairImages(row.images, kind)
        if (JSON.stringify(images) !== JSON.stringify(row.images)) {
            await model.update({ where: { id: row.id }, data: { images } })
            fixed += 1
        }
    }
}

console.log(`Repaired ${fixed} listings with missing upload files`)
await prisma.$disconnect()
await pool.end()
