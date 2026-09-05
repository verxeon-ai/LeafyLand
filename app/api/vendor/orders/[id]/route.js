import { prisma } from '@/lib/prisma'
import { error, json, requireStore, handleApiError, serializeOrder } from '@/lib/api'

const allowed = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

export async function PATCH(req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const { status } = await req.json()
        if (!allowed.includes(status)) return error('Invalid status')

        const existing = await prisma.order.findFirst({ where: { id, storeId: store.id } })
        if (!existing) return error('Order not found', 404)

        const paidOnDelivery = status === 'DELIVERED' && existing.paymentMethod === 'COD'
        const order = await prisma.order.update({
            where: { id },
            data: {
                status,
                ...(paidOnDelivery ? { isPaid: true, paymentStatus: 'CAPTURED' } : {}),
            },
            include: { user: true, address: true, orderItems: { include: { product: true } }, store: true },
        })
        return json(serializeOrder(order))
    } catch (e) {
        return handleApiError(e)
    }
}
