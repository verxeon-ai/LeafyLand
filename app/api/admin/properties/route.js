import { prisma } from '@/lib/prisma'
import { json, requireAdmin, handleApiError } from '@/lib/api'
import { notifyUsers } from '@/lib/payments/notify'

export async function GET() {
    try {
        await requireAdmin()
        const properties = await prisma.property.findMany({
            include: { store: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return json(properties)
    } catch (e) {
        return handleApiError(e)
    }
}

export async function PATCH(req) {
    try {
        await requireAdmin()
        const { id, status } = await req.json()
        const property = await prisma.property.update({
            where: { id },
            data: { status },
            include: { store: { select: { userId: true } } },
        })
        if (status === 'approved' || status === 'rejected') {
            try {
                const approved = status === 'approved'
                await notifyUsers([property.store.userId], {
                    type: approved ? 'PROPERTY_APPROVED' : 'PROPERTY_REJECTED',
                    title: approved ? 'Property listing approved' : 'Property listing rejected',
                    body: `"${property.title}" was ${status}.`,
                    link: '/store/properties',
                })
            } catch (e) {
                console.error('Property status notification failed:', e?.message || e)
            }
        }
        return json(property)
    } catch (e) {
        return handleApiError(e)
    }
}
