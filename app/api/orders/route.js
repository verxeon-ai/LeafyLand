import { prisma } from '@/lib/prisma'
import { error, json, requireUser, handleApiError, serializeOrder } from '@/lib/api'
import { buildCheckoutFromCart, storeTotalRupees } from '@/lib/checkout'
import { createEarningsForBatch } from '@/lib/payments/earnings'
import { notifyCodOrders } from '@/lib/payments/notify'

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

export async function POST(req) {
    try {
        const user = await requireUser()
        const body = await req.json()
        const { paymentMethod = 'COD', addressId, couponCode, cartItems } = body

        if (paymentMethod !== 'COD') {
            return error('Use Razorpay checkout to place online orders', 400)
        }

        const checkout = await buildCheckoutFromCart(user.id, { addressId, cartItems, couponCode })
        if (!checkout.ok) return error(checkout.error, checkout.status || 400)

        const { address, storeTotals, totalPaise, coupon } = checkout
        const batchCouponUsed = storeTotals.some((s) => s.applyCoupon)

        const batch = await prisma.$transaction(async (tx) => {
            for (const { items } of storeTotals) {
                for (const item of items) {
                    const updated = await tx.product.updateMany({
                        where: {
                            id: item.product.id,
                            stock: { gte: item.qty },
                            inStock: true,
                        },
                        data: { stock: { decrement: item.qty } },
                    })
                    if (updated.count !== 1) {
                        const err = new Error(`${item.product.name} does not have enough stock`)
                        err.status = 409
                        throw err
                    }
                    const fresh = await tx.product.findUnique({
                        where: { id: item.product.id },
                        select: { stock: true },
                    })
                    if (fresh && fresh.stock <= 0) {
                        await tx.product.update({
                            where: { id: item.product.id },
                            data: { inStock: false, stock: 0 },
                        })
                    }
                }
            }

            const createdBatch = await tx.checkoutBatch.create({
                data: {
                    userId: user.id,
                    addressId: address.id,
                    totalPaise,
                    currency: 'INR',
                    paymentStatus: 'PENDING',
                    paymentMethod: 'COD',
                    isCouponUsed: batchCouponUsed,
                    coupon: batchCouponUsed && coupon
                        ? { code: coupon.code, discount: coupon.discount }
                        : {},
                    stockFulfilled: true,
                },
            })

            for (const { storeId, items, storePaise, applyCoupon } of storeTotals) {
                await tx.order.create({
                    data: {
                        total: storeTotalRupees(storePaise),
                        userId: user.id,
                        storeId,
                        addressId: address.id,
                        checkoutBatchId: createdBatch.id,
                        isPaid: false,
                        paymentStatus: 'PENDING',
                        paymentMethod: 'COD',
                        isCouponUsed: applyCoupon,
                        coupon: applyCoupon && coupon
                            ? { code: coupon.code, discount: coupon.discount }
                            : {},
                        orderItems: {
                            create: items.map((i) => ({
                                productId: i.product.id,
                                quantity: i.qty,
                                price: i.price,
                            })),
                        },
                    },
                })
            }

            if (batchCouponUsed && coupon?.code) {
                await tx.coupon.update({
                    where: { code: coupon.code },
                    data: { usageCount: { increment: 1 } },
                })
            }

            await tx.user.update({
                where: { id: user.id },
                data: { cart: {} },
            })

            const fullBatch = await tx.checkoutBatch.findUnique({
                where: { id: createdBatch.id },
                include: {
                    orders: {
                        include: {
                            orderItems: { include: { product: true } },
                            store: true,
                            address: true,
                        },
                    },
                },
            })

            await createEarningsForBatch(tx, fullBatch, new Date())
            return fullBatch
        })

        await notifyCodOrders(batch)

        const orders = batch.orders.map(serializeOrder)
        return json({
            success: true,
            checkoutBatchId: batch.id,
            orders,
            primaryOrderId: orders[0]?.id || null,
        }, 201)
    } catch (e) {
        return handleApiError(e)
    }
}
