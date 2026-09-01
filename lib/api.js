import { prisma } from '@/lib/prisma'

export function json(data, status = 200, headers) {
    return Response.json(data, { status, ...(headers ? { headers } : {}) })
}

export const PUBLIC_CACHE = {
    'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
}

export const PUBLIC_DETAIL_CACHE = {
    'Cache-Control': 'public, max-age=30, stale-while-revalidate=120',
}

export function error(message, status = 400) {
    return Response.json({ error: message }, { status })
}

export async function getSessionUser() {
    const { auth } = await import('@/lib/auth')
    const session = await auth()
    if (!session?.user?.id) return null
    return session.user
}

export async function requireUser() {
    const user = await getSessionUser()
    if (!user) {
        const err = new Error('Unauthorized')
        err.status = 401
        throw err
    }
    return user
}

export async function requireAdmin() {
    const user = await requireUser()
    if (user.role !== 'ADMIN') {
        const err = new Error('Forbidden')
        err.status = 403
        throw err
    }
    return user
}

export async function requireStore() {
    const user = await requireUser()
    const store = await prisma.store.findUnique({ where: { userId: user.id } })
    if (!store) {
        const err = new Error('Store not found')
        err.status = 403
        throw err
    }
    if (store.status !== 'approved' || !store.isActive) {
        const err = new Error(
            store.status === 'pending'
                ? 'Store is pending approval'
                : store.status === 'rejected'
                    ? 'Store application was rejected'
                    : 'Store is not active',
        )
        err.status = 403
        throw err
    }
    return { user, store }
}

export function handleApiError(e) {
    if (e?.status !== 401 && e?.status !== 403) {
        console.error(e)
    }
    return error(e.message || 'Server error', e.status || 500)
}

export function serializeProduct(p) {
    const ratings = p.rating || []
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0
    return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        mrp: p.mrp,
        category: p.category,
        images: p.images,
        inStock: p.inStock,
        stock: p.stock,
        featured: p.featured,
        storeId: p.storeId,
        storeName: p.store?.name || 'LeafyLand',
        createdAt: p.createdAt,
        rating: ratings,
        avgRating: Number(avg.toFixed(1)),
        reviewCount: ratings.length,
        totalSales: p.orderItems?.reduce((s, i) => s + i.quantity, 0) || 0,
    }
}

/** Smaller payload for grids — first image + rating summary only. */
export function serializeProductList(p) {
    const ratings = p.rating || []
    const avg = ratings.length ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0
    return {
        id: p.id,
        name: p.name,
        price: p.price,
        mrp: p.mrp,
        category: p.category,
        images: p.images?.length ? [p.images[0]] : [],
        inStock: p.inStock,
        featured: p.featured,
        storeId: p.storeId,
        storeName: p.store?.name || 'LeafyLand',
        avgRating: Number(avg.toFixed(1)),
        reviewCount: ratings.length,
    }
}

export function serializeServiceList(s) {
    const ratings = s.rating || []
    const avg = ratings.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0
    return {
        id: s.id,
        name: s.name,
        category: s.category,
        startingPrice: s.startingPrice,
        duration: s.duration,
        location: s.location,
        images: s.images?.length ? [s.images[0]] : [],
        storeName: s.store?.name || 'LeafyLand',
        avgRating: Number(avg.toFixed(1)),
        reviewCount: ratings.length,
    }
}

export function serializePropertyList(p) {
    const ratings = p.rating || []
    const avg = ratings.length ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length : 0
    return {
        id: p.id,
        title: p.title,
        propertyType: p.propertyType,
        listingType: p.listingType,
        price: p.price,
        location: p.location,
        landSize: p.landSize,
        bedrooms: p.bedrooms,
        images: p.images?.length ? [p.images[0]] : [],
        marketplace: p.marketplace || false,
        avgRating: Number(avg.toFixed(1)),
        reviewCount: ratings.length,
    }
}

export function serializeOrder(o) {
    return {
        id: o.id,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        checkoutBatchId: o.checkoutBatchId,
        isPaid: o.isPaid,
        paymentMethod: o.paymentMethod,
        payment: o.paymentMethod,
        date: o.createdAt,
        createdAt: o.createdAt,
        coupon: o.coupon,
        isCouponUsed: o.isCouponUsed,
        customer: o.user?.name || 'Customer',
        email: o.user?.email,
        store: o.store?.name,
        storeId: o.storeId,
        items: (o.orderItems || []).map((i) => ({
            name: i.product?.name,
            quantity: i.quantity,
            qty: i.quantity,
            price: i.price,
            images: i.product?.images,
        })),
        orderItems: o.orderItems || [],
        address: o.address
            ? `${o.address.street}, ${o.address.city}`
            : null,
        addressObj: o.address,
        user: o.user,
    }
}
