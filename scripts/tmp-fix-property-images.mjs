import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const updates = [
    { title: '2 Acre Farmhouse', images: ['/property-farmhouse.jpg'] },
    { title: 'Agricultural Land', images: ['/property-agri-land.jpg'] },
]

for (const row of updates) {
    const result = await prisma.property.updateMany({
        where: { title: row.title },
        data: { images: row.images },
    })
    console.log(`${row.title}: ${result.count} updated`)
}

await prisma.$disconnect()
await pool.end()
