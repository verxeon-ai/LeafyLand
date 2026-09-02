import { prisma } from '@/lib/prisma'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import { paiseToRupees } from '@/lib/money'

export function rupees(paise) {
    return `₹${paiseToRupees(paise).toLocaleString('en-IN')}`
}

export async function notifyUsers(userIds, { type, title, body, link }) {
    const ids = [...new Set(userIds)].filter(Boolean)
    if (!ids.length) return
    await prisma.notification.createMany({
        data: ids.map((userId) => ({ userId, type, title, body, link })),
    })
}

export async function notifyAllAdmins(payload) {
    const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } })
    await notifyUsers(admins.map((a) => a.id), payload)
}

export async function notifyPaidOrders(batch) {
    if (!batch?.orders?.length) return
    try {
        for (const order of batch.orders) {
            const vendorId = order.store?.userId
            if (!vendorId) continue
            await notifyUsers([vendorId], {
                type: 'ORDER_PAID',
                title: 'New paid order',
                body: `Order · ₹${Number(order.total || 0).toLocaleString('en-IN')}${order.store?.name ? ` at ${order.store.name}` : ''}`,
                link: '/store/orders',
            })
        }
        await notifyAllAdmins({
            type: 'ORDER_PAID',
            title: batch.orders.length === 1 ? 'New paid order' : `${batch.orders.length} new paid orders`,
            body: batch.orders.map((order) => order.store?.name).filter(Boolean).join(', ') || 'A customer completed checkout.',
            link: '/admin/orders',
        })
    } catch (e) {
        console.error('Order notifications failed:', e?.message || e)
    }
}

async function safeSend(fn) {
    if (!isEmailConfigured()) return
    try {
        await fn()
    } catch (e) {
        console.error('Payout email failed:', e?.message || e)
    }
}

export async function sendVendorEmail(store, subject, html) {
    const to = store.email || store.user?.email
    if (!to) return
    await safeSend(() => sendEmail({ to, subject, html }))
}

export function payoutEmailHtml({ heading, lines }) {
    const items = lines.map((l) => `<li style="margin:6px 0;">${l}</li>`).join('')
    return `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden">
  <div style="background:#047857;color:#fff;padding:18px 24px;font-size:18px;font-weight:bold">LeafyLand</div>
  <div style="padding:24px">
    <h2 style="margin:0 0 12px;font-size:17px;color:#1e293b">${heading}</h2>
    <ul style="padding-left:18px;color:#334155;font-size:14px;line-height:1.5">${items}</ul>
  </div>
  <div style="background:#f8fafc;padding:14px 24px;color:#94a3b8;font-size:12px">LeafyLand Marketplace · This is an automated message.</div>
</div>`
}
