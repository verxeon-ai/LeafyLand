import { prisma } from '@/lib/prisma'
import { error, json, requireUser, handleApiError } from '@/lib/api'
import { buildCheckoutFromCart, storeTotalRupees } from '@/lib/checkout'
import { createRazorpayOrder, getPublicKeyId, isRazorpayConfigured } from '@/lib/razorpay'

export async function POST(req) {
    try {
        if (!isRazorpayConfigured()) {
            return error('Online payments are not configured', 503)
        }

        const user = await requireUser()
        const body = await req.json()
        const { addressId, couponCode, cartItems } = body

        if (!addressId || typeof addressId !== 'string') {
            return error('addressId is required')
        }

        const checkout = await buildCheckoutFromCart(user.id, { addressId, cartItems, couponCode })
        if (!checkout.ok) return error(checkout.error, checkout.status || 400)

        const { address, storeTotals, totalPaise, coupon } = checkout
        const batchCouponUsed = storeTotals.some((s) => s.applyCoupon)

        const receipt = `ll_${Date.now().toString(36)}_${user.id.slice(-8)}`.slice(0, 40)
        const rzOrder = await createRazorpayOrder({
            amountPaise: totalPaise,
            receipt,
            notes: { userId: user.id },
        })

        const batch = await prisma.$transaction(async (tx) => {
            const createdBatch = await tx.checkoutBatch.create({
                data: {
                    userId: user.id,
                    addressId: address.id,
                    totalPaise,
                    currency: 'INR',
                    paymentStatus: 'PENDING',
                    paymentMethod: 'RAZORPAY',
                    razorpayOrderId: rzOrder.id,
                    isCouponUsed: batchCouponUsed,
                    coupon: batchCouponUsed && coupon
                        ? { code: coupon.code, discount: coupon.discount }
                        : {},
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
                        paymentMethod: 'RAZORPAY',
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

            return createdBatch
        })

        const orderIds = (
            await prisma.order.findMany({
                where: { checkoutBatchId: batch.id },
                select: { id: true },
            })
        ).map((o) => o.id)

        return json(
            {
                success: true,
                checkoutBatchId: batch.id,
                orderIds,
                razorpayOrderId: batch.razorpayOrderId,
                amount: totalPaise,
                currency: 'INR',
                keyId: getPublicKeyId(),
            },
            201,
        )
    } catch (e) {
        return handleApiError(e)
    }
}
