import { prisma } from '@/lib/prisma'
import { error, json, requireAdmin, handleApiError, serializeOrder } from '@/lib/api'

const allowed = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export async function GET() {
    try {
        await requireAdmin()
        const orders = await prisma.order.findMany({
            include: {
                user: { select: { name: true, email: true } },
                store: { select: { name: true } },
                orderItems: { include: { product: { select: { name: true, images: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: 200,
        })
        return json(orders.map(serializeOrder))
    } catch (e) {
        return handleApiError(e)
    }
}

export async function PATCH(req) {
    try {
        await requireAdmin()
        const { id, status } = await req.json()
        if (!id || !allowed.includes(status)) return error('Invalid status')
        const existing = await prisma.order.findUnique({ where: { id } })
        if (!existing) return error('Order not found', 404)

        const paidOnDelivery = status === 'DELIVERED' && existing.paymentMethod === 'COD'
        const order = await prisma.order.update({
            where: { id },
            data: {
                status,
                ...(paidOnDelivery ? { isPaid: true, paymentStatus: 'CAPTURED' } : {}),
            },
            include: {
                user: true,
                store: true,
                address: true,
                orderItems: { include: { product: true } },
            },
        })
        return json(serializeOrder(order))
    } catch (e) {
        return handleApiError(e)
    }
}
