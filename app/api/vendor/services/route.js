import { prisma } from '@/lib/prisma'
import { error, json, requireStore, handleApiError } from '@/lib/api'
import { sanitizeImageUrls } from '@/lib/images'
import { notifyAllAdmins } from '@/lib/payments/notify'

export async function GET() {
    try {
        const { store } = await requireStore()
        const services = await prisma.service.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' },
        })
        return json(services)
    } catch (e) {
        return handleApiError(e)
    }
}

export async function POST(req) {
    try {
        const { store } = await requireStore()
        const body = await req.json()
        const { name, description, category, startingPrice, duration, location, images } = body

        if (!name || !description || !category || startingPrice == null || !location) {
            return error('Missing service fields')
        }

        const safeImages = sanitizeImageUrls(images)
        if (!safeImages.length) {
            return error('Upload at least one service photo via /api/upload')
        }

        const service = await prisma.service.create({
            data: {
                name,
                description,
                category,
                startingPrice: Number(startingPrice),
                duration: duration || null,
                location,
                images: safeImages,
                status: 'pending',
                storeId: store.id,
            },
        })
        try {
            await notifyAllAdmins({
                type: 'SERVICE_PENDING',
                title: 'New service listing',
                body: `"${service.name}" from ${store.name} needs review.`,
                link: '/admin/services',
            })
        } catch (e) {
            console.error('Service notification failed:', e?.message || e)
        }
        return json(service, 201)
    } catch (e) {
        return handleApiError(e)
    }
}
