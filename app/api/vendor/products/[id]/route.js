import { prisma } from '@/lib/prisma'
import { error, json, requireStore, handleApiError, serializeProduct } from '@/lib/api'
import { sanitizeImageUrls } from '@/lib/images'

export async function GET(_req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const product = await prisma.product.findFirst({
            where: { id, storeId: store.id },
            include: { store: true, rating: true, orderItems: { select: { quantity: true } } },
        })
        if (!product) return error('Product not found', 404)
        return json(serializeProduct(product))
    } catch (e) {
        return handleApiError(e)
    }
}

export async function PATCH(req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const existing = await prisma.product.findFirst({ where: { id, storeId: store.id } })
        if (!existing) return error('Product not found', 404)

        const body = await req.json()
        const data = {}
        for (const key of ['name', 'description', 'category']) {
            if (typeof body[key] === 'string') data[key] = body[key]
        }
        if (body.mrp != null) data.mrp = Number(body.mrp)
        if (body.price != null) data.price = Number(body.price)
        if (body.stock != null) {
            data.stock = Number(body.stock)
            data.inStock = Number(body.stock) > 0
        }
        if (typeof body.inStock === 'boolean') data.inStock = body.inStock
        if (Array.isArray(body.images)) {
            const safeImages = sanitizeImageUrls(body.images)
            if (!safeImages.length) return error('Upload at least one product photo via /api/upload')
            data.images = safeImages
        }

        const product = await prisma.product.update({
            where: { id },
            data,
            include: { store: true, rating: true, orderItems: { select: { quantity: true } } },
        })
        return json(serializeProduct(product))
    } catch (e) {
        return handleApiError(e)
    }
}

export async function DELETE(_req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const existing = await prisma.product.findFirst({
            where: { id, storeId: store.id },
            include: { _count: { select: { orderItems: true } } },
        })
        if (!existing) return error('Product not found', 404)

        if (existing._count.orderItems > 0) {
            await prisma.product.update({
                where: { id },
                data: { inStock: false, stock: 0 },
            })
            return json({
                ok: true,
                softDeleted: true,
                message: 'Product is in past orders, so it was marked out of stock instead of deleted.',
            })
        }

        await prisma.product.delete({ where: { id } })
        return json({ ok: true })
    } catch (e) {
        return handleApiError(e)
    }
}
