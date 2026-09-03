'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Package, ChevronRight } from 'lucide-react'
import FilterChips from '@/components/admin/FilterChips'
import StatusBadge from '@/components/admin/StatusBadge'
import CatalogImage from '@/components/CatalogImage'
import {
    brandCardClass,
    brandLabelClass,
    brandPrimaryCtaClass,
    brandSecondaryCtaClass,
    BRAND_GREEN,
    BRAND_GREEN_LIGHT,
    BRAND_TEXT,
} from '@/lib/brand-ui'
import {
    ORDER_FILTERS,
    formatMoney,
    formatOrderRef,
    formatOrderStatus,
} from '@/lib/order-ui'

export default function Orders() {
    const { status } = useSession()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('All')

    useEffect(() => {
        if (status === 'loading') return
        if (status !== 'authenticated') {
            setOrders([])
            setLoading(false)
            return
        }
        fetch('/api/orders')
            .then(async (res) => {
                const data = await res.json()
                if (Array.isArray(data)) setOrders(data)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [status])

    const filtered = useMemo(() => {
        if (filter === 'All') return orders
        return orders.filter((o) => o.status === filter)
    }, [orders, filter])

    if (status === 'unauthenticated') {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
                <h1 className="text-xl font-bold text-slate-800">Sign in to view orders</h1>
                <p className="mt-2 text-sm text-slate-500">Your order history and tracking live in your account.</p>
                <Link href="/login?callbackUrl=/orders" className={`${brandPrimaryCtaClass} mt-5 px-6 py-2.5`} style={{ backgroundColor: BRAND_GREEN }}>
                    Sign in
                </Link>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-4xl space-y-4 px-4 py-10 sm:px-6">
                <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-28 animate-pulse rounded-xl bg-slate-100" />
            </div>
        )
    }

    return (
        <div className="mx-auto w-full min-w-0 max-w-4xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-8">
            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Account</p>
            <h1 className="mt-1 text-xl font-bold sm:text-2xl" style={{ color: BRAND_TEXT }}>My orders</h1>
            <p className="mt-1 mb-5 text-sm text-slate-500">
                {orders.length} order{orders.length === 1 ? '' : 's'}
            </p>

            {orders.length > 0 && (
                <div className="mb-5">
                    <FilterChips
                        options={ORDER_FILTERS}
                        value={filter}
                        onChange={setFilter}
                        getLabel={(opt) => (opt === 'All' ? 'All' : formatOrderStatus(opt))}
                    />
                </div>
            )}

            {orders.length === 0 ? (
                <div className="flex flex-col items-center rounded-xl border border-slate-100 bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}>
                        <Package size={28} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">No orders yet</h2>
                    <p className="mt-1 max-w-sm text-sm text-slate-500">When you place an order, it will show up here with tracking from the seller.</p>
                    <Link href="/products" className={`${brandPrimaryCtaClass} mt-5 px-6 py-2.5`} style={{ backgroundColor: BRAND_GREEN }}>
                        Start shopping
                    </Link>
                </div>
            ) : filtered.length === 0 ? (
                <p className="py-12 text-center text-sm text-slate-500">No {formatOrderStatus(filter).toLowerCase()} orders.</p>
            ) : (
                <div className="space-y-3">
                    {filtered.map((order) => {
                        const items = order.orderItems || []
                        const first = items[0]?.product
                        const extra = Math.max(0, items.length - 1)
                        return (
                            <article key={order.id} className={`${brandCardClass} p-4 sm:p-5`}>
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="font-mono text-xs font-semibold text-slate-500">#{formatOrderRef(order.id)}</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-800">
                                            {new Date(order.createdAt || order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                        </p>
                                        {order.store && <p className="text-xs text-slate-500">{order.store}</p>}
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                                        {first?.images?.[0] ? (
                                            <CatalogImage src={first.images[0]} alt={first.name || ''} fill className="object-cover" sizes="56px" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                                                <Package size={18} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-slate-800">{first?.name || items[0]?.name || 'Order items'}</p>
                                        <p className="text-xs text-slate-500">
                                            {items.length} item{items.length === 1 ? '' : 's'}
                                            {extra > 0 ? ` · +${extra} more` : ''}
                                        </p>
                                    </div>
                                    <p className="text-sm font-bold" style={{ color: BRAND_GREEN }}>{formatMoney(order.total)}</p>
                                </div>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <Link href={`/orders/${order.id}`} className={`${brandPrimaryCtaClass} py-2`} style={{ backgroundColor: BRAND_GREEN }}>
                                        View details
                                    </Link>
                                    <Link href={`/orders/${order.id}#timeline`} className={brandSecondaryCtaClass}>
                                        Track <ChevronRight size={14} />
                                    </Link>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
