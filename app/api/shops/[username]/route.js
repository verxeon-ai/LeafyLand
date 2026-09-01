import { prisma } from '@/lib/prisma'
import { error, json, serializeProductList, PUBLIC_CACHE } from '@/lib/api'

export async function GET(_req, { params }) {
    const { username } = await params
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
            Product: {
                where: { inStock: true },
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
                take: 120,
            },
        },
    })
    if (!store || store.status !== 'approved' || !store.isActive) {
        return error('Store not found', 404)
    }
    const { Product, ...info } = store
    return json({
        ...info,
        products: Product.map((p) => serializeProductList({ ...p, store: { name: store.name, username: store.username } })),
    }, 200, PUBLIC_CACHE)
}
