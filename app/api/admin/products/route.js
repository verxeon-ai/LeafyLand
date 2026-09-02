import { prisma } from '@/lib/prisma'
import { json, requireAdmin, handleApiError } from '@/lib/api'

export async function GET() {
    try {
        await requireAdmin()
        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                mrp: true,
                category: true,
                images: true,
                stock: true,
                inStock: true,
                store: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return json(products.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            mrp: p.mrp,
            category: p.category,
            images: p.images,
            stock: p.stock,
            inStock: p.inStock,
            storeName: p.store?.name || 'LeafyLand',
        })))
    } catch (e) {
        return handleApiError(e)
    }
}
