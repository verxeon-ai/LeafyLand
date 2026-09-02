import { prisma } from '@/lib/prisma'
import { error, json, requireUser, handleApiError, serializeOrder } from '@/lib/api'
import {
    verifyCheckoutSignature,
    isRazorpayConfigured,
} from '@/lib/razorpay'
import {
    assertRazorpayPaymentSuccess,
    findBatchByRazorpayOrderId,
    fulfillCheckoutBatch,
} from '@/lib/payments/fulfill'
import { notifyPaidOrders } from '@/lib/payments/notify'

function validateVerifyBody(body) {
    const razorpay_order_id = body?.razorpay_order_id?.trim?.() || body?.razorpayOrderId?.trim?.()
    const razorpay_payment_id = body?.razorpay_payment_id?.trim?.() || body?.razorpayPaymentId?.trim?.()
    const razorpay_signature = body?.razorpay_signature?.trim?.() || body?.razorpaySignature?.trim?.()
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return { ok: false, error: 'Missing payment verification fields' }
    }
    if (
        razorpay_order_id.length > 64 ||
        razorpay_payment_id.length > 64 ||
        razorpay_signature.length > 128
    ) {
        return { ok: false, error: 'Invalid payment fields' }
    }
    return {
        ok: true,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
    }
}

export async function POST(req) {
    try {
        if (!isRazorpayConfigured()) {
            return error('Online payments are not configured', 503)
        }

        const user = await requireUser()
        const body = await req.json()
        const parsed = validateVerifyBody(body)
        if (!parsed.ok) return error(parsed.error)

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed

        if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) {
            return error('Payment verification failed. Please contact support if your account was charged.', 400)
        }

        const batch = await findBatchByRazorpayOrderId(razorpay_order_id)
        if (!batch) {
            return error('Order not found', 404)
        }
        if (batch.userId !== user.id) {
            return error('Forbidden', 403)
        }

        await assertRazorpayPaymentSuccess(
            razorpay_order_id,
            razorpay_payment_id,
            batch.totalPaise,
        )

        const result = await prisma.$transaction(async (tx) =>
            fulfillCheckoutBatch(tx, {
                batchId: batch.id,
                razorpayPaymentId: razorpay_payment_id,
                expectedAmountPaise: batch.totalPaise,
            }),
        )

        if (!result.alreadyProcessed) {
            await notifyPaidOrders(result.batch)
        }

        const orders = result.batch.orders.map(serializeOrder)

        return json({
            success: true,
            alreadyProcessed: result.alreadyProcessed,
            checkoutBatchId: batch.id,
            orders,
            primaryOrderId: orders[0]?.id || null,
        })
    } catch (e) {
        if (e.status === 400 || e.status === 403 || e.status === 404 || e.status === 409) {
            return error(
                e.status === 400
                    ? 'Payment verification failed. Please contact support if your account was charged.'
                    : e.message,
                e.status,
            )
        }
        return handleApiError(e)
    }
}
