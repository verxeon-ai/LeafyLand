import { prisma } from '@/lib/prisma'
import { error, json, requireStore, handleApiError } from '@/lib/api'
import { sanitizeImageUrls } from '@/lib/images'
import { notifyAllAdmins } from '@/lib/payments/notify'

export async function GET() {
    try {
        const { store } = await requireStore()
        const properties = await prisma.property.findMany({
            where: { storeId: store.id },
            orderBy: { createdAt: 'desc' },
        })
        return json(properties)
    } catch (e) {
        return handleApiError(e)
    }
}

export async function POST(req) {
    try {
        const { store } = await requireStore()
        const body = await req.json()
        const {
            title, description, propertyType, listingType, price, location,
            landSize, coveredArea, bedrooms, bathrooms, features, images,
        } = body

        if (!title || !description || !propertyType || price == null || !location || !landSize) {
            return error('Missing property fields')
        }

        const lt = listingType === 'RENT' ? 'RENT' : 'SALE'
        const safeImages = sanitizeImageUrls(images)
        if (!safeImages.length) {
            return error('Upload at least one property photo via /api/upload')
        }

        const property = await prisma.property.create({
            data: {
                title,
                description,
                propertyType,
                listingType: lt,
                price: Number(price),
                location,
                landSize,
                coveredArea: coveredArea || null,
                bedrooms: bedrooms != null && bedrooms !== '' ? Number(bedrooms) : null,
                bathrooms: bathrooms != null && bathrooms !== '' ? Number(bathrooms) : null,
                features: Array.isArray(features) ? features.filter((f) => typeof f === 'string' && f.trim()) : [],
                images: safeImages,
                status: 'pending',
                storeId: store.id,
            },
        })
        try {
            await notifyAllAdmins({
                type: 'PROPERTY_PENDING',
                title: 'New property listing',
                body: `"${property.title}" from ${store.name} needs review.`,
                link: '/admin/properties',
            })
        } catch (e) {
            console.error('Property notification failed:', e?.message || e)
        }
        return json(property, 201)
    } catch (e) {
        return handleApiError(e)
    }
}
