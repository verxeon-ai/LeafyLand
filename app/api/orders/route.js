import { prisma } from '@/lib/prisma'
import { error, json, requireUser, handleApiError, serializeOrder } from '@/lib/api'

export async function GET() {
    try {
        const user = await requireUser()
        const orders = await prisma.order.findMany({
            where: { userId: user.id },
            include: {
                store: true,
                address: true,
                orderItems: { include: { product: true } },
            },
            orderBy: { createdAt: 'desc' },
        })
        return json(orders.map(serializeOrder))
    } catch (e) {
        return handleApiError(e)
    }
}

/** COD is disabled — all new orders must go through Razorpay checkout. */
export async function POST() {
    return error('Cash on Delivery is not available. Please pay online with Razorpay.', 400)
}
