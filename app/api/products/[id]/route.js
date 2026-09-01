import { prisma } from '@/lib/prisma'
import { error, json, serializeProduct, PUBLIC_DETAIL_CACHE } from '@/lib/api'

export async function GET(_req, { params }) {
    const { id } = await params
    const product = await prisma.product.findUnique({
        where: { id },
        include: {
            store: { select: { id: true, name: true, username: true, logo: true } },
            rating: { include: { user: { select: { name: true, image: true } } } },
            orderItems: { select: { quantity: true } },
        },
    })
    if (!product) return error('Product not found', 404)
    return json(serializeProduct(product), 200, PUBLIC_DETAIL_CACHE)
}
