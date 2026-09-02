import { prisma } from '@/lib/prisma'
import { json, requireAdmin, handleApiError } from '@/lib/api'
import { notifyUsers } from '@/lib/payments/notify'

export async function GET() {
    try {
        await requireAdmin()
        const services = await prisma.service.findMany({
            include: { store: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return json(services)
    } catch (e) {
        return handleApiError(e)
    }
}

export async function PATCH(req) {
    try {
        await requireAdmin()
        const { id, status } = await req.json()
        const service = await prisma.service.update({
            where: { id },
            data: { status },
            include: { store: { select: { userId: true } } },
        })
        if (status === 'approved' || status === 'rejected') {
            try {
                const approved = status === 'approved'
                await notifyUsers([service.store.userId], {
                    type: approved ? 'SERVICE_APPROVED' : 'SERVICE_REJECTED',
                    title: approved ? 'Service listing approved' : 'Service listing rejected',
                    body: `"${service.name}" was ${status}.`,
                    link: '/store/services',
                })
            } catch (e) {
                console.error('Service status notification failed:', e?.message || e)
            }
        }
        return json(service)
    } catch (e) {
        return handleApiError(e)
    }
}
