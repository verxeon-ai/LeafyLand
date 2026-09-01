import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const rows = await prisma.service.groupBy({
        by: ['category'],
        where: {
            status: 'approved',
            store: { status: 'approved', isActive: true },
        },
        _count: { category: true },
        orderBy: { category: 'asc' },
    })

    const niches = rows.map((row) => ({
        name: row.category,
        count: row._count.category,
    }))

    return NextResponse.json(niches, {
        headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        },
    })
}
