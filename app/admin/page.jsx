'use client'

import { useState } from 'react'
import { Users, IndianRupee, ShoppingBag, Store } from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import toast from 'react-hot-toast'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import PageHeader from '@/components/admin/PageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { AdminError, AdminStatSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'
import {
    brandCardClass,
    brandLabelClass,
    brandPrimaryCtaClass,
    brandDangerCtaClass,
    brandLinkClass,
    BRAND_GREEN,
} from '@/lib/brand-ui'

const AdminDashboardCharts = dynamic(() => import('@/components/charts/AdminDashboardCharts'), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`${brandCardClass} h-44 animate-pulse`} />
            <div className={`${brandCardClass} h-44 animate-pulse`} />
        </div>
    ),
})

const formatDate = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatCurrency = (value) =>
    `₹${(Number(value) || 0).toLocaleString('en-IN')}`

export default function AdminDashboard() {
    const { data, setData, loading, error, reload: load } = useCachedJson('/api/admin/dashboard', 'object')
    const [actingId, setActingId] = useState('')

    const updateStoreStatus = async (id, status) => {
        setActingId(id)
        try {
            const res = await fetch(`/api/admin/stores/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            if (!res.ok) throw new Error(status === 'approved' ? 'Approve failed' : 'Reject failed')
            setData((prev) => {
                if (!prev) return prev
                const next = {
                    ...prev,
                    pendingStores: prev.pendingStores.filter((s) => s.id !== id),
                }
                setCachedJson('/api/admin/dashboard', next)
                return next
            })
            toast.success(status === 'approved' ? 'Store approved' : 'Store rejected')
        } catch (e) {
            toast.error(e.message)
        } finally {
            setActingId('')
        }
    }

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <PageHeader title="Dashboard" description="Platform overview and recent activity" />
                <AdminStatSkeleton />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className={`${brandCardClass} h-44 animate-pulse`} />
                    <div className={`${brandCardClass} h-44 animate-pulse`} />
                </div>
            </div>
        )
    }

    if (!data) {
        return (
            <div className="space-y-6">
                <PageHeader title="Dashboard" description="Platform overview and recent activity" />
                <AdminError message={error || 'No data available'} onRetry={load} />
            </div>
        )
    }

    const { stats, ordersChartData, revenueChartData, ordersPreviousTotal, pendingStores, recentOrders } = data

    return (
        <div className="space-y-6">
            <PageHeader title="Dashboard" description="Platform overview and recent activity" />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={Users} label="Total Users" value={stats.users.toLocaleString('en-IN')} />
                <StatCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(stats.revenue)} />
                <StatCard icon={ShoppingBag} label="Total Orders" value={stats.orders.toLocaleString('en-IN')} />
                <StatCard icon={Store} label="Active Stores" value={stats.stores.toLocaleString('en-IN')} />
            </div>

            <AdminDashboardCharts
                ordersChartData={ordersChartData}
                revenueChartData={revenueChartData}
                ordersPreviousTotal={ordersPreviousTotal}
            />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                <div className={`${brandCardClass} flex min-w-0 flex-col p-5`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Orders</p>
                            <h2 className="text-lg font-bold text-slate-800">Recent orders</h2>
                        </div>
                        <Link href="/admin/orders" className={`${brandLinkClass} shrink-0`} style={{ color: BRAND_GREEN }}>
                            See all
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <EmptyState embedded icon={ShoppingBag} title="No orders yet" description="New orders will appear here" />
                    ) : (
                        <div className="min-w-0 overflow-x-auto">
                            <table className="w-full min-w-[560px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#e4eee6] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        <th className="pb-3 pr-4 font-semibold">Order</th>
                                        <th className="pb-3 pr-4 font-semibold">Customer</th>
                                        <th className="pb-3 pr-4 font-semibold">Amount</th>
                                        <th className="pb-3 pr-4 font-semibold">Status</th>
                                        <th className="pb-3 font-semibold">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-slate-50 last:border-0">
                                            <td className="whitespace-nowrap py-3 pr-4 font-medium text-slate-800">
                                                {order.id.slice(-8).toUpperCase()}
                                            </td>
                                            <td className="max-w-[9rem] truncate py-3 pr-4 text-slate-600" title={order.user?.name || 'Customer'}>
                                                {order.user?.name || 'Customer'}
                                            </td>
                                            <td className="whitespace-nowrap py-3 pr-4 font-medium text-slate-800">
                                                {formatCurrency(order.total)}
                                            </td>
                                            <td className="whitespace-nowrap py-3 pr-4">
                                                <StatusBadge status={order.status} />
                                            </td>
                                            <td className="whitespace-nowrap py-3 text-slate-500">
                                                {formatDate(order.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={`${brandCardClass} flex min-w-0 flex-col p-5`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Stores</p>
                            <h2 className="text-lg font-bold text-slate-800">Pending approvals</h2>
                        </div>
                        <Link href="/admin/approve" className={`${brandLinkClass} shrink-0`} style={{ color: BRAND_GREEN }}>
                            See all
                        </Link>
                    </div>
                    {pendingStores.length === 0 ? (
                        <EmptyState embedded icon={Store} title="No pending stores" description="New store applications will appear here" />
                    ) : (
                        <div className="min-w-0 overflow-x-auto">
                            <table className="w-full min-w-[480px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#e4eee6] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        <th className="pb-3 pr-4 font-semibold">Store</th>
                                        <th className="pb-3 pr-4 font-semibold">Owner</th>
                                        <th className="pb-3 pr-4 font-semibold">Date</th>
                                        <th className="pb-3 text-right font-semibold">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingStores.map((store) => (
                                        <tr key={store.id} className="border-b border-slate-50 last:border-0">
                                            <td className="max-w-[10rem] truncate py-3 pr-4 font-medium text-slate-800" title={store.name}>
                                                {store.name}
                                            </td>
                                            <td className="max-w-[8rem] truncate py-3 pr-4 text-slate-600" title={store.user?.name || 'Owner'}>
                                                {store.user?.name || 'Owner'}
                                            </td>
                                            <td className="whitespace-nowrap py-3 pr-4 text-slate-500">
                                                {formatDate(store.createdAt)}
                                            </td>
                                            <td className="whitespace-nowrap py-3 text-right">
                                                <button
                                                    type="button"
                                                    disabled={actingId === store.id}
                                                    onClick={() => updateStoreStatus(store.id, 'approved')}
                                                    className={`${brandPrimaryCtaClass} mr-2 text-xs disabled:opacity-50`}
                                                    style={{ backgroundColor: BRAND_GREEN }}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    type="button"
                                                    disabled={actingId === store.id}
                                                    onClick={() => updateStoreStatus(store.id, 'rejected')}
                                                    className={`${brandDangerCtaClass} text-xs disabled:opacity-50`}
                                                >
                                                    Reject
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
