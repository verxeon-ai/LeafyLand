const ROUTES = {
    PRODUCT: (id) => `/products/${id}`,
    PROPERTY: (id) => `/properties/${id}`,
    SERVICE: (id) => `/services/${id}`,
}

const UI_TYPE = {
    PRODUCT: 'product',
    PROPERTY: 'property',
    SERVICE: 'service',
}

export function normalizeWishlistItemType(itemType) {
    const upper = String(itemType || '').toUpperCase()
    if (upper === 'PRODUCT' || upper === 'PROPERTY' || upper === 'SERVICE') return upper
    return null
}

export async function assertWishlistTarget(prisma, itemId, itemType) {
    switch (itemType) {
        case 'PRODUCT': {
            const row = await prisma.product.findFirst({
                where: {
                    id: itemId,
                    status: 'approved',
                    store: { status: 'approved', isActive: true },
                },
            })
            if (!row) return { ok: false, error: 'Product not found' }
            return { ok: true }
        }
        case 'SERVICE': {
            const row = await prisma.service.findFirst({
                where: { id: itemId, status: 'approved', store: { status: 'approved', isActive: true } },
            })
            if (!row) return { ok: false, error: 'Service not found' }
            return { ok: true }
        }
        case 'PROPERTY': {
            const row = await prisma.property.findFirst({
                where: { id: itemId, status: 'approved', store: { status: 'approved', isActive: true } },
            })
            if (!row) return { ok: false, error: 'Property not found' }
            return { ok: true }
        }
        default:
            return { ok: false, error: 'Invalid itemType' }
    }
}

function serializeProduct(row, wishlistRow) {
    return {
        id: wishlistRow.id,
        itemId: row.id,
        itemType: 'PRODUCT',
        type: UI_TYPE.PRODUCT,
        createdAt: wishlistRow.createdAt,
        href: ROUTES.PRODUCT(row.id),
        title: row.name,
        subtitle: row.category,
        price: row.price,
        priceLabel: `₹${row.price.toLocaleString('en-IN')}`,
        image: row.images?.[0] || null,
        available: row.inStock,
    }
}

function serializeService(row, wishlistRow) {
    return {
        id: wishlistRow.id,
        itemId: row.id,
        itemType: 'SERVICE',
        type: UI_TYPE.SERVICE,
        createdAt: wishlistRow.createdAt,
        href: ROUTES.SERVICE(row.id),
        title: row.name,
        subtitle: row.category,
        price: row.startingPrice,
        priceLabel: `From ₹${row.startingPrice.toLocaleString('en-IN')}`,
        image: row.images?.[0] || null,
        available: true,
    }
}

function serializeProperty(row, wishlistRow) {
    return {
        id: wishlistRow.id,
        itemId: row.id,
        itemType: 'PROPERTY',
        type: UI_TYPE.PROPERTY,
        createdAt: wishlistRow.createdAt,
        href: ROUTES.PROPERTY(row.id),
        title: row.title,
        subtitle: row.location,
        price: row.price,
        priceLabel: `₹${row.price.toLocaleString('en-IN')}${row.listingType === 'RENT' ? '/mo' : ''}`,
        image: row.images?.[0] || null,
        available: true,
    }
}

export async function resolveWishlistItems(prisma, rows) {
    if (!rows.length) return []

    const byType = {
        PRODUCT: rows.filter((r) => r.itemType === 'PRODUCT').map((r) => r.itemId),
        SERVICE: rows.filter((r) => r.itemType === 'SERVICE').map((r) => r.itemId),
        PROPERTY: rows.filter((r) => r.itemType === 'PROPERTY').map((r) => r.itemId),
    }

    const [products, services, properties] = await Promise.all([
        byType.PRODUCT.length
            ? prisma.product.findMany({ where: { id: { in: byType.PRODUCT } } })
            : [],
        byType.SERVICE.length
            ? prisma.service.findMany({ where: { id: { in: byType.SERVICE } } })
            : [],
        byType.PROPERTY.length
            ? prisma.property.findMany({ where: { id: { in: byType.PROPERTY } } })
            : [],
    ])

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]))
    const serviceMap = Object.fromEntries(services.map((s) => [s.id, s]))
    const propertyMap = Object.fromEntries(properties.map((p) => [p.id, p]))

    return rows
        .map((row) => {
            if (row.itemType === 'PRODUCT' && productMap[row.itemId]) {
                return serializeProduct(productMap[row.itemId], row)
            }
            if (row.itemType === 'SERVICE' && serviceMap[row.itemId]) {
                return serializeService(serviceMap[row.itemId], row)
            }
            if (row.itemType === 'PROPERTY' && propertyMap[row.itemId]) {
                return serializeProperty(propertyMap[row.itemId], row)
            }
            return null
        })
        .filter(Boolean)
}

export function toReduxWishlistItems(resolved) {
    return resolved.map((item) => ({ id: item.itemId, type: item.type }))
}
