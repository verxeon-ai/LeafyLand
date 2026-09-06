import { prisma } from '@/lib/prisma'
import { error, json, handleApiError } from '@/lib/api'

export async function POST(req) {
    try {
        const body = await req.json()
        const name = String(body.name || '').trim()
        const email = String(body.email || '').trim().toLowerCase()
        const subject = String(body.subject || '').trim()
        const message = String(body.message || '').trim()

        if (!name || !email || !subject || !message) {
            return error('All fields are required')
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return error('Invalid email')
        }
        if (message.length > 5000) return error('Message is too long')

        const inquiry = await prisma.contactInquiry.create({
            data: { name, email, subject, message },
        })
        try {
            const { notifyAllAdmins } = await import('@/lib/payments/notify')
            await notifyAllAdmins({
                type: 'CONTACT_INQUIRY',
                title: 'New contact message',
                body: `${name}: ${subject}`,
                link: '/admin/contact',
            })
        } catch (e) {
            console.error('Contact notification failed:', e?.message || e)
        }
        return json({ id: inquiry.id, ok: true }, 201)
    } catch (e) {
        return handleApiError(e)
    }
}
