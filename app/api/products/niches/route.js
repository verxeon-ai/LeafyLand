import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isMarketplaceCategory } from '@/lib/categories'

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all' // all | leafy | marketplace

    const rows = await prisma.product.groupBy({
        by: ['category'],
        where: {
            inStock: true,
            store: { status: 'approved', isActive: true },
        },
        _count: { category: true },
        orderBy: { category: 'asc' },
    })

    let niches = rows.map((row) => ({
        name: row.category,
        count: row._count.category,
        marketplace: isMarketplaceCategory(row.category),
    }))

    if (type === 'leafy') {
        niches = niches.filter((n) => !n.marketplace)
    } else if (type === 'marketplace') {
        niches = niches.filter((n) => n.marketplace)
    }

    return NextResponse.json(niches, {
        headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
        },
    })
}
