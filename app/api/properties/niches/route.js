import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const rows = await prisma.property.groupBy({
        by: ['propertyType'],
        where: {
            status: 'approved',
            store: { status: 'approved', isActive: true },
        },
        _count: { propertyType: true },
        orderBy: { propertyType: 'asc' },
    })

    const niches = rows.map((row) => ({
        name: row.propertyType,
        count: row._count.propertyType,
    }))

    return NextResponse.json(niches, {
        headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        },
    })
}
