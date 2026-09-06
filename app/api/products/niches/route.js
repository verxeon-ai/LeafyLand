import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { isMarketplaceCategory, CATEGORY_ALIASES } from '@/lib/categories'

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'all' // all | leafy | marketplace

    const rows = await prisma.product.groupBy({
        by: ['category'],
        where: {
            inStock: true,
            status: 'approved',
            store: { status: 'approved', isActive: true },
        },
        _count: { category: true },
        orderBy: { category: 'asc' },
    })

    const merged = new Map()
    for (const row of rows) {
        const raw = row.category
        const name = CATEGORY_ALIASES[raw] || raw
        const prev = merged.get(name)
        merged.set(name, (prev || 0) + row._count.category)
    }

    let niches = [...merged.entries()].map(([name, count]) => ({
        name,
        count,
        marketplace: isMarketplaceCategory(name),
    })).sort((a, b) => a.name.localeCompare(b.name))

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
