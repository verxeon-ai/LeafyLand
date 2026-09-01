import { prisma } from '@/lib/prisma'
import { serializeServiceList } from '@/lib/api'

export const dynamic = 'force-dynamic'

export async function GET(req) {
    const { searchParams } = new URL(req.url)
    const q = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const parsedLimit = Number(searchParams.get('limit'))
    const take = Math.min(Math.max(searchParams.has('limit') && Number.isFinite(parsedLimit) ? parsedLimit : 80, 1), 200)

    const services = await prisma.service.findMany({
        where: {
            status: 'approved',
            store: { status: 'approved', isActive: true },
            ...(category && category !== 'All' ? { category } : {}),
            ...(q
                ? {
                    OR: [
                        { name: { contains: q, mode: 'insensitive' } },
                        { category: { contains: q, mode: 'insensitive' } },
                    ],
                }
                : {}),
        },
        select: {
            id: true,
            name: true,
            category: true,
            startingPrice: true,
            duration: true,
            location: true,
            images: true,
            store: { select: { name: true, username: true } },
            rating: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
        take,
    })

    return new Response(JSON.stringify(services.map(serializeServiceList)), {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=0, s-maxage=60, stale-while-revalidate=300',
        },
    })
}
