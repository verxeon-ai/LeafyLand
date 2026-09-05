import { prisma } from '@/lib/prisma'
import { json, PUBLIC_CACHE, handleApiError } from '@/lib/api'

export async function GET() {
    try {
        const stores = await prisma.store.findMany({
            where: { status: 'approved', isActive: true },
            select: {
                id: true,
                name: true,
                username: true,
                logo: true,
            },
            orderBy: { name: 'asc' },
            take: 200,
        })
        return json(stores, 200, PUBLIC_CACHE)
    } catch (e) {
        return handleApiError(e)
    }
}
