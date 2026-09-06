import { prisma } from '@/lib/prisma'
import { error, json, requireStore, handleApiError } from '@/lib/api'
import { sanitizeImageUrls } from '@/lib/images'

export async function GET(_req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const property = await prisma.property.findFirst({ where: { id, storeId: store.id } })
        if (!property) return error('Property not found', 404)
        return json(property)
    } catch (e) {
        return handleApiError(e)
    }
}

export async function PATCH(req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const existing = await prisma.property.findFirst({ where: { id, storeId: store.id } })
        if (!existing) return error('Property not found', 404)

        const body = await req.json()
        const data = { status: 'pending' }
        for (const key of ['title', 'description', 'propertyType', 'location', 'landSize', 'coveredArea']) {
            if (typeof body[key] === 'string') data[key] = body[key] || (key === 'coveredArea' ? null : body[key])
        }
        if (body.listingType === 'SALE' || body.listingType === 'RENT') data.listingType = body.listingType
        if (body.price != null) data.price = Number(body.price)
        if (body.bedrooms != null) data.bedrooms = body.bedrooms === '' || body.bedrooms === null ? null : Number(body.bedrooms)
        if (body.bathrooms != null) data.bathrooms = body.bathrooms === '' || body.bathrooms === null ? null : Number(body.bathrooms)
        if (Array.isArray(body.features)) {
            data.features = body.features.filter((f) => typeof f === 'string' && f.trim())
        }
        if (Array.isArray(body.images)) {
            const safeImages = sanitizeImageUrls(body.images)
            if (!safeImages.length) return error('Upload at least one property photo via /api/upload')
            data.images = safeImages
        }

        const property = await prisma.property.update({ where: { id }, data })
        return json(property)
    } catch (e) {
        return handleApiError(e)
    }
}

export async function DELETE(_req, { params }) {
    try {
        const { store } = await requireStore()
        const { id } = await params
        const existing = await prisma.property.findFirst({ where: { id, storeId: store.id } })
        if (!existing) return error('Property not found', 404)
        await prisma.property.delete({ where: { id } })
        return json({ ok: true })
    } catch (e) {
        return handleApiError(e)
    }
}
