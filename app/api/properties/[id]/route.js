import { prisma } from '@/lib/prisma'
import { error, json, handleApiError, PUBLIC_DETAIL_CACHE } from '@/lib/api'
import { avgRating, serializeReview } from '@/lib/reviews'

export async function GET(_req, { params }) {
    try {
        const { id } = await params
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                store: { select: { id: true, name: true, username: true, logo: true } },
                rating: {
                    include: { user: { select: { name: true, image: true } } },
                    orderBy: { createdAt: 'desc' },
                },
            },
        })
        if (!property) return error('Property not found', 404)
        return json({
            ...property,
            avgRating: avgRating(property.rating),
            reviews: property.rating.map(serializeReview),
        }, 200, PUBLIC_DETAIL_CACHE)
    } catch (e) {
        return handleApiError(e)
    }
}
