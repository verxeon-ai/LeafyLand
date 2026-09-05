import { prisma } from '@/lib/prisma'
import { error, json, serializeProductList, PUBLIC_CACHE } from '@/lib/api'

const DEFAULT_LIMIT = 60
const MAX_LIMIT = 100
const LEGACY_LIMIT = 120

export async function GET(req, { params }) {
    const { username } = await params
    const { searchParams } = new URL(req.url)
    const paginated = searchParams.get('paginated') === '1' || searchParams.has('offset')
    const offset = Math.max(0, Number.parseInt(searchParams.get('offset') || '0', 10) || 0)
    const parsedLimit = Number(searchParams.get('limit'))
    const limit = Math.min(
        Math.max(
            searchParams.has('limit') && Number.isFinite(parsedLimit) ? parsedLimit : (paginated ? DEFAULT_LIMIT : LEGACY_LIMIT),
            1,
        ),
        MAX_LIMIT,
    )
    const search = (searchParams.get('search') || '').trim()

    const store = await prisma.store.findUnique({
        where: { username },
        select: {
            id: true,
            name: true,
            username: true,
            description: true,
            logo: true,
            address: true,
            email: true,
            status: true,
            isActive: true,
        },
    })
    if (!store || store.status !== 'approved' || !store.isActive) {
        return error('Store not found', 404)
    }

    const where = {
        storeId: store.id,
        inStock: true,
        status: 'approved',
        ...(search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { category: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {}),
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            select: {
                id: true,
                name: true,
                price: true,
                mrp: true,
                category: true,
                images: true,
                inStock: true,
                featured: true,
                storeId: true,
                rating: { select: { rating: true } },
            },
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
            take: limit,
            skip: paginated ? offset : 0,
        }),
        prisma.product.count({ where }),
    ])

    const serialized = products.map((p) =>
        serializeProductList({ ...p, store: { name: store.name, username: store.username } }),
    )

    return json({
        ...store,
        products: serialized,
        total,
        limit,
        offset: paginated ? offset : 0,
        hasMore: (paginated ? offset : 0) + serialized.length < total,
    }, 200, PUBLIC_CACHE)
}
