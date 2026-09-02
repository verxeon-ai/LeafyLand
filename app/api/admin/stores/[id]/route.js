import { prisma } from '@/lib/prisma'
import { error, json, requireAdmin, handleApiError } from '@/lib/api'
import { notifyUsers } from '@/lib/payments/notify'

export async function PATCH(req, { params }) {
    try {
        await requireAdmin()
        const { id } = await params
        const body = await req.json()
        const data = {}
        if (typeof body.isActive === 'boolean') data.isActive = body.isActive
        if (typeof body.status === 'string') {
            data.status = body.status
            if (body.status === 'approved') {
                data.isActive = true
                data.isVerified = true
            }
            if (body.status === 'rejected') data.isActive = false
        }
        if (body.commissionRate != null) data.commissionRate = Number(body.commissionRate)
        const store = await prisma.store.update({
            where: { id },
            data,
            include: { user: { select: { name: true, email: true } } },
        })
        if (body.status === 'approved' || body.status === 'rejected') {
            try {
                const approved = body.status === 'approved'
                await notifyUsers([store.userId], {
                    type: approved ? 'STORE_APPROVED' : 'STORE_REJECTED',
                    title: approved ? 'Your store was approved' : 'Your store application was rejected',
                    body: approved
                        ? `${store.name} is now live on LeafyLand.`
                        : `${store.name} was not approved.`,
                    link: approved ? '/store' : '/create-store',
                })
            } catch (e) {
                console.error('Store status notification failed:', e?.message || e)
            }
        }
        return json(store)
    } catch (e) {
        return handleApiError(e)
    }
}
