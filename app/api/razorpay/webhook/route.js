import { prisma } from '@/lib/prisma'
import { json, error } from '@/lib/api'
import { verifyWebhookSignature, isRazorpayConfigured } from '@/lib/razorpay'
import { findBatchByRazorpayOrderId, fulfillCheckoutBatch } from '@/lib/payments/fulfill'
import { markPayoutProcessed, markPayoutFailed } from '@/lib/payments/release'
import { notifyPaidOrders } from '@/lib/payments/notify'

export const runtime = 'nodejs'

async function processPaymentCaptured(payload) {
    const payment = payload?.payment?.entity
    if (!payment?.order_id || !payment?.id) return

    const batch = await findBatchByRazorpayOrderId(payment.order_id)
    if (!batch) return

    if (Number(payment.amount) !== batch.totalPaise) {
        console.error('Webhook amount mismatch for batch', batch.id)
        return
    }
    if (payment.currency !== 'INR') return

    const result = await prisma.$transaction(async (tx) =>
        fulfillCheckoutBatch(tx, {
            batchId: batch.id,
            razorpayPaymentId: payment.id,
            expectedAmountPaise: batch.totalPaise,
        }),
    )
    if (!result.alreadyProcessed) {
        await notifyPaidOrders(result.batch)
    }
}

async function processPaymentFailed(payload) {
    const payment = payload?.payment?.entity
    if (!payment?.order_id) return

    const batch = await findBatchByRazorpayOrderId(payment.order_id)
    if (!batch || batch.paymentStatus === 'CAPTURED') return

    await prisma.checkoutBatch.updateMany({
        where: { id: batch.id, paymentStatus: 'PENDING' },
        data: { paymentStatus: 'FAILED' },
    })
    await prisma.order.updateMany({
        where: { checkoutBatchId: batch.id, paymentStatus: 'PENDING' },
        data: { paymentStatus: 'FAILED', status: 'CANCELLED' },
    })
}

async function processPayoutEvent(payload, eventType) {
    const entity = payload?.payout?.entity
    if (!entity?.id) return
    if (eventType === 'payout.processed') {
        await markPayoutProcessed(entity.id, entity)
    } else if (['payout.failed', 'payout.rejected', 'payout.reversed', 'payout.cancelled'].includes(eventType)) {
        await markPayoutFailed(entity.id, entity.failure_reason || eventType)
    }
}

export async function POST(req) {
    if (!isRazorpayConfigured()) {
        return error('Not configured', 503)
    }

    const signature = req.headers.get('x-razorpay-signature')
    const rawBody = await req.text()

    if (!verifyWebhookSignature(rawBody, signature)) {
        return error('Invalid signature', 400)
    }

    let payload
    try {
        payload = JSON.parse(rawBody)
    } catch {
        return error('Invalid payload', 400)
    }

    const eventId = req.headers.get('x-razorpay-event-id') || payload?.event?.id || payload?.id
    if (!eventId) {
        return error('Missing event id', 400)
    }

    try {
        await prisma.razorpayWebhookEvent.create({ data: { eventId } })
    } catch (e) {
        if (e?.code === 'P2002') {
            return json({ ok: true, duplicate: true })
        }
        console.error('Webhook idempotency error', e)
        return error('Server error', 500)
    }

    try {
        const eventType = payload?.event
        if (eventType === 'payment.captured') {
            await processPaymentCaptured(payload.payload)
        } else if (eventType === 'payment.failed') {
            await processPaymentFailed(payload.payload)
        } else if (eventType.startsWith('payout.')) {
            await processPayoutEvent(payload.payload, eventType)
        }
    } catch (e) {
        console.error('Webhook handler error', e?.message || e)
        return error('Processing failed', 500)
    }

    return json({ ok: true })
}
