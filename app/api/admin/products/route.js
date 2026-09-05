import { prisma } from '@/lib/prisma'
import { error, json, requireAdmin, handleApiError } from '@/lib/api'
import { notifyUsers } from '@/lib/payments/notify'

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
                featured: true,
                status: true,
                store: { select: { name: true, userId: true } },
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
            featured: p.featured,
            status: p.status || 'approved',
            storeName: p.store?.name || 'LeafyLand',
            storeUserId: p.store?.userId || null,
        })))
    } catch (e) {
        return handleApiError(e)
    }
}

export async function PATCH(req) {
    try {
        await requireAdmin()
        const body = await req.json()
        const { id } = body
        if (!id) return error('Product id is required')

        const existing = await prisma.product.findUnique({
            where: { id },
            include: { store: { select: { userId: true, name: true } } },
        })
        if (!existing) return error('Product not found', 404)

        const data = {}
        if (body.status === 'pending' || body.status === 'approved' || body.status === 'rejected') {
            data.status = body.status
        }
        if (typeof body.featured === 'boolean') data.featured = body.featured
        if (body.stock != null) {
            data.stock = Number(body.stock)
            data.inStock = Number(body.stock) > 0
        }
        if (typeof body.inStock === 'boolean') data.inStock = body.inStock
        if (body.price != null) data.price = Number(body.price)
        if (body.mrp != null) data.mrp = Number(body.mrp)
        if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim()
        if (typeof body.description === 'string') data.description = body.description
        if (typeof body.category === 'string' && body.category.trim()) data.category = body.category.trim()

        if (!Object.keys(data).length) return error('No changes provided')

        const product = await prisma.product.update({
            where: { id },
            data,
            include: { store: { select: { name: true, userId: true } } },
        })

        if (data.status === 'approved' || data.status === 'rejected') {
            try {
                const approved = data.status === 'approved'
                await notifyUsers([product.store.userId], {
                    type: approved ? 'PRODUCT_APPROVED' : 'PRODUCT_REJECTED',
                    title: approved ? 'Product approved' : 'Product rejected',
                    body: `"${product.name}" was ${data.status}.`,
                    link: '/store/products',
                })
            } catch (e) {
                console.error('Product status notification failed:', e?.message || e)
            }
        }

        return json({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            mrp: product.mrp,
            category: product.category,
            images: product.images,
            stock: product.stock,
            inStock: product.inStock,
            featured: product.featured,
            status: product.status || 'approved',
            storeName: product.store?.name || 'LeafyLand',
        })
    } catch (e) {
        return handleApiError(e)
    }
}

export async function DELETE(req) {
    try {
        await requireAdmin()
        const { id } = await req.json()
        if (!id) return error('Product id is required')

        const existing = await prisma.product.findUnique({
            where: { id },
            include: { _count: { select: { orderItems: true } } },
        })
        if (!existing) return error('Product not found', 404)

        if (existing._count.orderItems > 0) {
            await prisma.product.update({
                where: { id },
                data: { inStock: false, stock: 0, status: 'rejected' },
            })
            return json({
                ok: true,
                softDeleted: true,
                message: 'Product is in past orders, so it was unpublished instead of deleted.',
            })
        }

        await prisma.product.delete({ where: { id } })
        return json({ ok: true })
    } catch (e) {
        return handleApiError(e)
    }
}
