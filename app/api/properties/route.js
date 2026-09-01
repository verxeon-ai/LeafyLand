import { prisma } from '@/lib/prisma'
import { serializePropertyList } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('search') || ''
    const type = searchParams.get('type')
    const parsedLimit = Number(searchParams.get('limit'))
    const take = Math.min(Math.max(searchParams.has('limit') && Number.isFinite(parsedLimit) ? parsedLimit : 80, 1), 200)

    const properties = await prisma.property.findMany({
        where: {
            status: 'approved',
            store: { status: 'approved', isActive: true },
            ...(type && type !== 'All' ? { propertyType: type } : {}),
            ...(q
                ? {
                    OR: [
                        { title: { contains: q, mode: 'insensitive' } },
                        { location: { contains: q, mode: 'insensitive' } },
                    ],
                }
                : {}),
        },
        select: {
            id: true,
            title: true,
            propertyType: true,
            listingType: true,
            price: true,
            location: true,
            landSize: true,
            bedrooms: true,
            images: true,
            store: { select: { name: true, username: true } },
            rating: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
    })

    return new Response(JSON.stringify(properties.map(serializePropertyList)), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        },
    })
}
