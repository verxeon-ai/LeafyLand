import { prisma } from '@/lib/prisma'

function liveItem({ id, type, title, body, link, createdAt }) {
    return {
        id,
        type,
        title,
        body,
        link,
        createdAt: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
        readAt: null,
        live: true,
    }
}

function waitingCopy(names, count, singular, plural) {
    const label = count === 1 ? singular : plural
    if (count === 1) return `${names[0] || `1 ${singular}`} is waiting for review.`
    if (count === 2 && names.length === 2) return `${names[0]} and ${names[1]} are waiting for review.`
    if (names[0]) return `${names[0]} and ${count - 1} more ${label} are waiting for review.`
    return `${count} ${label} are waiting for review.`
}

async function adminLiveAlerts() {
    const now = new Date()
    const [stores, storeCount, properties, propertyCount, services, serviceCount, dueCount, latestDue, newOrders] =
        await Promise.all([
            prisma.store.findMany({
                where: { status: 'pending' },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: { name: true, createdAt: true },
            }),
            prisma.store.count({ where: { status: 'pending' } }),
            prisma.property.findMany({
                where: { status: 'pending' },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: { title: true, createdAt: true },
            }),
            prisma.property.count({ where: { status: 'pending' } }),
            prisma.service.findMany({
                where: { status: 'pending' },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: { name: true, createdAt: true },
            }),
            prisma.service.count({ where: { status: 'pending' } }),
            prisma.earning.count({ where: { status: 'DUE', eligibleAt: { lte: now } } }),
            prisma.earning.findFirst({
                where: { status: 'DUE', eligibleAt: { lte: now } },
                orderBy: { eligibleAt: 'desc' },
                select: { eligibleAt: true },
            }),
            prisma.order.count({ where: { status: 'ORDER_PLACED', isPaid: true } }),
        ])

    const items = []
    if (storeCount) {
        items.push(liveItem({
            id: 'live-stores-pending',
            type: 'STORE_PENDING',
            title: storeCount === 1 ? 'Store application pending' : `${storeCount} store applications pending`,
            body: waitingCopy(stores.map((s) => s.name), storeCount, 'store', 'stores'),
            link: '/admin/approve',
            createdAt: stores[0]?.createdAt || now,
        }))
    }
    if (propertyCount) {
        items.push(liveItem({
            id: 'live-properties-pending',
            type: 'PROPERTY_PENDING',
            title: propertyCount === 1 ? 'Property listing pending' : `${propertyCount} property listings pending`,
            body: waitingCopy(properties.map((p) => p.title), propertyCount, 'listing', 'listings'),
            link: '/admin/properties',
            createdAt: properties[0]?.createdAt || now,
        }))
    }
    if (serviceCount) {
        items.push(liveItem({
            id: 'live-services-pending',
            type: 'SERVICE_PENDING',
            title: serviceCount === 1 ? 'Service listing pending' : `${serviceCount} service listings pending`,
            body: waitingCopy(services.map((s) => s.name), serviceCount, 'listing', 'listings'),
            link: '/admin/services',
            createdAt: services[0]?.createdAt || now,
        }))
    }
    if (dueCount) {
        items.push(liveItem({
            id: 'live-payouts-due',
            type: 'PAYOUT_DUE',
            title: dueCount === 1 ? 'Vendor payout due' : `${dueCount} vendor payouts due`,
            body: `${dueCount} earning${dueCount === 1 ? '' : 's'} ready to release.`,
            link: '/admin/payouts',
            createdAt: latestDue?.eligibleAt || now,
        }))
    }
    if (newOrders) {
        items.push(liveItem({
            id: 'live-orders-new',
            type: 'ORDER_PAID',
            title: newOrders === 1 ? 'New paid order' : `${newOrders} new paid orders`,
            body: 'Orders placed and paid, waiting to be processed.',
            link: '/admin/orders',
            createdAt: now,
        }))
    }
    return items
}

async function vendorLiveAlerts(userId) {
    const store = await prisma.store.findUnique({
        where: { userId },
        select: { id: true, name: true, status: true, updatedAt: true, createdAt: true },
    })
    if (!store) return []

    const now = new Date()
    const items = []

    if (store.status === 'pending') {
        items.push(liveItem({
            id: 'live-store-pending',
            type: 'STORE_PENDING',
            title: 'Store awaiting approval',
            body: `${store.name} is still under review.`,
            link: '/create-store',
            createdAt: store.createdAt,
        }))
        return items
    }

    if (store.status === 'rejected') {
        items.push(liveItem({
            id: 'live-store-rejected',
            type: 'STORE_REJECTED',
            title: 'Store application rejected',
            body: `${store.name} was not approved.`,
            link: '/create-store',
            createdAt: store.updatedAt,
        }))
        return items
    }

    const [lowStock, propertyCount, serviceCount, newOrders] = await Promise.all([
        prisma.product.count({ where: { storeId: store.id, stock: { lte: 5 } } }),
        prisma.property.count({ where: { storeId: store.id, status: 'pending' } }),
        prisma.service.count({ where: { storeId: store.id, status: 'pending' } }),
        prisma.order.count({
            where: { storeId: store.id, status: 'ORDER_PLACED', isPaid: true },
        }),
    ])

    if (newOrders) {
        items.push(liveItem({
            id: 'live-orders-new',
            type: 'ORDER_PAID',
            title: newOrders === 1 ? 'New order to fulfill' : `${newOrders} new orders to fulfill`,
            body: 'Paid orders are waiting in your orders list.',
            link: '/store/orders',
            createdAt: now,
        }))
    }
    if (lowStock) {
        items.push(liveItem({
            id: 'live-stock-low',
            type: 'STOCK_LOW',
            title: lowStock === 1 ? 'Low stock alert' : `${lowStock} products are low on stock`,
            body: 'Some items have 5 or fewer units left.',
            link: '/store/inventory',
            createdAt: now,
        }))
    }
    if (propertyCount) {
        items.push(liveItem({
            id: 'live-property-review',
            type: 'PROPERTY_PENDING',
            title: propertyCount === 1 ? 'Property under review' : `${propertyCount} properties under review`,
            body: 'Listings go live after admin approval.',
            link: '/store/properties',
            createdAt: now,
        }))
    }
    if (serviceCount) {
        items.push(liveItem({
            id: 'live-service-review',
            type: 'SERVICE_PENDING',
            title: serviceCount === 1 ? 'Service under review' : `${serviceCount} services under review`,
            body: 'Listings go live after admin approval.',
            link: '/store/services',
            createdAt: now,
        }))
    }
    return items
}

export async function getNotificationInbox(user) {
    const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { role: true },
    })
    const role = dbUser?.role || user.role

    const [stored, unread, live] = await Promise.all([
        prisma.notification.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 40,
        }),
        prisma.notification.count({ where: { userId: user.id, readAt: null } }),
        role === 'ADMIN' ? adminLiveAlerts() : vendorLiveAlerts(user.id),
    ])

    return {
        items: [...live, ...stored],
        unread,
    }
}
