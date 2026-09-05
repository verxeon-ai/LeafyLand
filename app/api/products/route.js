import { prisma } from '@/lib/prisma'
import { serializeProductList } from '@/lib/api'
import { storeMatchesCity } from '@/lib/location'
import { isMarketplaceCategory, getHomeProductGroup, MARKETPLACE_CATEGORIES } from '@/lib/categories'

export const dynamic = 'force-dynamic'

const LIST_SELECT = {
    id: true,
    name: true,
    price: true,
    mrp: true,
    category: true,
    images: true,
    inStock: true,
    stock: true,
    featured: true,
    storeId: true,
    store: { select: { name: true, username: true } },
    rating: { select: { rating: true } },
}

const DEFAULT_LIMIT = 60
const MAX_LIMIT = 100
const LEGACY_DEFAULT_LIMIT = 120

async function storeIdsInCity(city) {
    const needle = String(city || '').trim()
    if (!needle) return null
    const stores = await prisma.store.findMany({
        where: { status: 'approved', isActive: true },
        select: { id: true, address: true, settings: true },
    })
    return stores.filter((s) => storeMatchesCity(s, needle)).map((s) => s.id)
}

function parseLimit(searchParams, { paginated }) {
    const parsed = Number(searchParams.get('limit'))
    if (searchParams.has('limit') && Number.isFinite(parsed)) {
        return Math.min(Math.max(parsed, 1), MAX_LIMIT)
    }
    return paginated ? DEFAULT_LIMIT : LEGACY_DEFAULT_LIMIT
}

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const storeId = searchParams.get('storeId')
    const city = searchParams.get('city') || ''
    const groupId = searchParams.get('group') || ''
    const dealsOnly = searchParams.get('deals') === '1'
    const marketplaceOnly = searchParams.get('marketplace') === '1'
    const ids = (searchParams.get('ids') || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)

    const paginated = searchParams.get('paginated') === '1' || searchParams.has('offset')
    const offset = Math.max(0, Number.parseInt(searchParams.get('offset') || '0', 10) || 0)
    const take = ids.length ? undefined : parseLimit(searchParams, { paginated })

    const cityStoreIds = city ? await storeIdsInCity(city) : null
    if (cityStoreIds && cityStoreIds.length === 0) {
        const empty = paginated
            ? { products: [], total: 0, limit: take, offset, hasMore: false }
            : []
        return new Response(JSON.stringify(empty), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=120',
            },
        })
    }

    const homeGroup = getHomeProductGroup(groupId)
    const groupCategories = homeGroup?.categories || null
    let categoryFilter = category && category !== 'All' ? category : null

    if (marketplaceOnly && !categoryFilter && !groupCategories) {
        // Restrict to marketplace categories via `in`
    }

    const where = ids.length
        ? { id: { in: ids } }
        : {
            inStock: true,
            status: 'approved',
            store: { status: 'approved', isActive: true },
            ...(storeId ? { storeId } : {}),
            ...(cityStoreIds ? { storeId: { in: cityStoreIds } } : {}),
            ...(categoryFilter ? { category: categoryFilter } : {}),
            ...(groupCategories && !categoryFilter ? { category: { in: groupCategories } } : {}),
            ...(marketplaceOnly && !categoryFilter && !groupCategories
                ? { category: { in: MARKETPLACE_CATEGORIES } }
                : {}),
            ...(q
                ? {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { category: { contains: q, mode: 'insensitive' } },
                    ],
                }
                : {}),
            ...(dealsOnly ? { mrp: { gt: 0 } } : {}),
        }

    // Column compare (mrp > price) isn't expressible in Prisma where; for deals we
    // over-fetch a bit and filter, then page in memory only when deals=1.
    // For the main catalog path we use skip/take on the DB.
    if (dealsOnly && !ids.length) {
        const pool = await prisma.product.findMany({
            where,
            select: LIST_SELECT,
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
        })
        const deals = pool.filter((p) => Number(p.mrp) > Number(p.price))
        const total = deals.length
        const page = deals.slice(offset, offset + (take || DEFAULT_LIMIT))
        const body = paginated
            ? {
                products: page.map(serializeProductList),
                total,
                limit: take || DEFAULT_LIMIT,
                offset,
                hasMore: offset + page.length < total,
            }
            : page.map(serializeProductList)

        return new Response(JSON.stringify(body), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
            },
        })
    }

    if (marketplaceOnly && categoryFilter && !isMarketplaceCategory(categoryFilter) && !ids.length) {
        const empty = paginated
            ? { products: [], total: 0, limit: take, offset, hasMore: false }
            : []
        return new Response(JSON.stringify(empty), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
            },
        })
    }

    const [products, total] = await Promise.all([
        prisma.product.findMany({
            where,
            select: LIST_SELECT,
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
            ...(take ? { take, skip: paginated ? offset : 0 } : {}),
        }),
        paginated && !ids.length ? prisma.product.count({ where }) : Promise.resolve(null),
    ])

    if (ids.length || !paginated) {
        return new Response(JSON.stringify(products.map(serializeProductList)), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
            },
        })
    }

    const serialized = products.map(serializeProductList)
    return new Response(JSON.stringify({
        products: serialized,
        total: total ?? serialized.length,
        limit: take,
        offset,
        hasMore: offset + serialized.length < (total ?? serialized.length),
    }), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        },
    })
}
