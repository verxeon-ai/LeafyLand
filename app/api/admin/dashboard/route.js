import { prisma } from '@/lib/prisma'
import { json, requireAdmin, handleApiError } from '@/lib/api'

export async function GET() {
    try {
        await requireAdmin()

        const now = new Date()
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
        const [userCount, storeCount, orderCount, revenueAgg, orderDates, recentOrders, pendingStores] =
            await Promise.all([
                prisma.user.count(),
                prisma.store.count({ where: { isActive: true, status: 'approved' } }),
                prisma.order.count(),
                prisma.order.aggregate({ _sum: { total: true } }),
                prisma.order.findMany({
                    where: { createdAt: { gte: sixMonthsAgo } },
                    select: { total: true, createdAt: true },
                }),
                prisma.order.findMany({
                    select: {
                        id: true,
                        total: true,
                        status: true,
                        isPaid: true,
                        paymentMethod: true,
                        createdAt: true,
                        user: { select: { name: true, email: true } },
                        store: { select: { name: true } },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 8,
                }),
                prisma.store.findMany({
                    where: { status: 'pending' },
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                }),
            ])

        const startOfDay = (value) => new Date(value.getFullYear(), value.getMonth(), value.getDate())
        const today = startOfDay(now)
        const chartStart = new Date(today)
        chartStart.setDate(today.getDate() - 6)
        const prevStart = new Date(today)
        prevStart.setDate(today.getDate() - 13)

        const ordersChartData = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today)
            d.setDate(today.getDate() - 6 + i)
            return {
                name: d.toLocaleDateString('en-IN', { weekday: 'short' }),
                date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
                dayKey: `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
                orders: 0,
            }
        })
        const dayIndex = Object.fromEntries(ordersChartData.map((row, idx) => [row.dayKey, idx]))

        const revenueChartData = Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1)
            return {
                name: d.toLocaleString('en-US', { month: 'short' }),
                key: `${d.getFullYear()}-${d.getMonth()}`,
                revenue: 0,
                isCurrent: i === 5,
            }
        })
        const monthIndex = Object.fromEntries(revenueChartData.map((m, idx) => [m.key, idx]))

        let ordersPreviousTotal = 0
        for (const o of orderDates) {
            const day = startOfDay(o.createdAt)
            const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
            const idx = dayIndex[dayKey]
            if (idx !== undefined) {
                ordersChartData[idx].orders += 1
            } else if (day >= prevStart && day < chartStart) {
                ordersPreviousTotal += 1
            }
            const monthKey = `${o.createdAt.getFullYear()}-${o.createdAt.getMonth()}`
            const monthIdx = monthIndex[monthKey]
            if (monthIdx !== undefined) revenueChartData[monthIdx].revenue += o.total
        }

        return json({
            stats: {
                users: userCount,
                revenue: revenueAgg._sum.total || 0,
                orders: orderCount,
                stores: storeCount,
            },
            ordersChartData,
            ordersPreviousTotal,
            revenueChartData,
            pendingStores,
            recentOrders,
        })
    } catch (e) {
        return handleApiError(e)
    }
}
