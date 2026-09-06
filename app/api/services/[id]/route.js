import { prisma } from '@/lib/prisma'
import { error, json, PUBLIC_DETAIL_CACHE } from '@/lib/api'
import { avgRating, serializeReview } from '@/lib/reviews'

export async function GET(_req, { params }) {
    const { id } = await params
    const service = await prisma.service.findFirst({
        where: {
            id,
            status: 'approved',
            store: { status: 'approved', isActive: true },
        },
        include: {
            store: { select: { id: true, name: true, username: true, logo: true } },
            rating: {
                include: { user: { select: { name: true, image: true } } },
                orderBy: { createdAt: 'desc' },
            },
        },
    })
    if (!service) return error('Service not found', 404)
    return json({
        ...service,
        avgRating: avgRating(service.rating),
        reviews: service.rating.map(serializeReview),
    }, 200, PUBLIC_DETAIL_CACHE)
}
