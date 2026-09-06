import { prisma } from '@/lib/prisma'
import { error, json, requireStore, handleApiError } from '@/lib/api'
import { sanitizeImageUrls } from '@/lib/images'

export async function GET(_req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const service = await prisma.service.findFirst({ where: { id, storeId: store.id } })
        if (!service) return error('Service not found', 404)
        return json(service)
    } catch (e) {
        return handleApiError(e)
    }
}

export async function PATCH(req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const existing = await prisma.service.findFirst({ where: { id, storeId: store.id } })
        if (!existing) return error('Service not found', 404)

        const body = await req.json()
        const data = { status: 'pending' }
        for (const key of ['name', 'description', 'category', 'location', 'duration']) {
            if (typeof body[key] === 'string') data[key] = body[key] || (key === 'duration' ? null : body[key])
        }
        if (body.startingPrice != null) data.startingPrice = Number(body.startingPrice)
        if (Array.isArray(body.images)) {
            const safeImages = sanitizeImageUrls(body.images)
            if (!safeImages.length) return error('Upload at least one service photo via /api/upload')
            data.images = safeImages
        }

        const service = await prisma.service.update({ where: { id }, data })
        return json(service)
    } catch (e) {
        return handleApiError(e)
    }
}

export async function DELETE(_req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const existing = await prisma.service.findFirst({
            where: { id, storeId: store.id },
            include: { _count: { select: { bookings: true } } },
        })
        if (!existing) return error('Service not found', 404)

        // Bookings reference this service — soft-hide instead of hard delete.
        if (existing._count.bookings > 0) {
            await prisma.service.update({
                where: { id },
                data: { status: 'rejected' },
            })
            return json({
                ok: true,
                softDeleted: true,
                message: 'Service has bookings, so it was unpublished instead of deleted.',
            })
        }

        await prisma.service.delete({ where: { id } })
        return json({ ok: true })
    } catch (e) {
        return handleApiError(e)
    }
}
