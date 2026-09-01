import { prisma } from '@/lib/prisma'
import { serializeProductList } from '@/lib/api'

export const dynamic = 'force-dynamic'

const LIST_SELECT = {
    id: true,
    name: true,
    price: true,
    mrp: true,
    category: true,
    images: true,
    inStock: true,
    featured: true,
    storeId: true,
    store: { select: { name: true, username: true } },
    rating: { select: { rating: true } },
}

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const storeId = searchParams.get('storeId')
    const ids = (searchParams.get('ids') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    const parsedLimit = Number(searchParams.get('limit'))
    const take = ids.length
        ? undefined
        : Math.min(Math.max(searchParams.has('limit') && Number.isFinite(parsedLimit) ? parsedLimit : 120, 1), 200)

    const products = await prisma.product.findMany({
        where: {
            inStock: true,
            ...(ids.length ? { id: { in: ids } } : {}),
            store: { status: 'approved', isActive: true },
            ...(storeId ? { storeId } : {}),
            ...(category && category !== 'All' ? { category } : {}),
            ...(q
                ? {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { category: { contains: q, mode: 'insensitive' } },
                    ],
                }
                : {}),
        },
        select: LIST_SELECT,
        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        ...(take ? { take } : {}),
    })

    const body = products.map(serializeProductList)
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        },
    })
}
