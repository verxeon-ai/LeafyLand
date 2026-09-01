import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { STRIP_CATEGORIES } from '@/lib/categories'

function defaults() {
    return STRIP_CATEGORIES
}

export async function GET() {
    let categories = await prisma.category.findMany({
        where: { active: true },
        orderBy: { order: 'asc' },
    })

    if (categories.length === 0) {
        const list = defaults()
        await prisma.$transaction(
            list.map((d) =>
                prisma.category.upsert({
                    where: { name: d.name },
                    create: d,
                    update: { type: d.type, order: d.order, active: true },
                }),
            ),
        )
        categories = await prisma.category.findMany({
            where: { active: true },
            orderBy: { order: 'asc' },
        })
    }

    return NextResponse.json(categories, {
        headers: {
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        },
    })
}
