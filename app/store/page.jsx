'use client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
    IndianRupee, ShoppingBag, Package, Star, AlertTriangle,
    Plus, Boxes, MessageSquare, Home, Wrench,
} from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'
import PageHeader from '@/components/admin/PageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { AdminError, AdminStatSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import {
    brandCardClass,
    brandLabelClass,
    brandLinkClass,
    brandPrimaryCtaClass,
    brandSecondaryCtaClass,
    BRAND_GREEN,
    BRAND_GREEN_LIGHT,
} from '@/lib/brand-ui'

const VendorDashboardCharts = dynamic(() => import('@/components/charts/VendorDashboardCharts'), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`${brandCardClass} h-44 animate-pulse`} />
            <div className={`${brandCardClass} h-44 animate-pulse`} />
        </div>
    ),
})

const QUICK_ACTIONS = [
    { href: '/store/add-product', icon: Plus, label: 'Add product' },
    { href: '/store/orders', icon: ShoppingBag, label: 'Orders' },
    { href: '/store/inventory', icon: Boxes, label: 'Inventory' },
    { href: '/store/messages', icon: MessageSquare, label: 'Messages' },
    { href: '/store/add-property', icon: Home, label: 'Add property' },
    { href: '/store/add-service', icon: Wrench, label: 'Add service' },
]

const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function VendorDashboard() {
    const { data: dash, loading, error, reload } = useCachedJson('/api/vendor/dashboard', 'object')

    if (loading && !dash) {
        return (
            <div className="space-y-6">
                <PageHeader eyebrow="Vendor" title="Dashboard" description="Store overview, orders and inventory" />
                <AdminStatSkeleton />
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className={`${brandCardClass} h-44 animate-pulse`} />
                    <div className={`${brandCardClass} h-44 animate-pulse`} />
                </div>
            </div>
        )
    }

    if (!dash) {
        return (
            <div className="space-y-6">
                <PageHeader eyebrow="Vendor" title="Dashboard" description="Store overview, orders and inventory" />
                <AdminError message={error || 'No data available'} onRetry={reload} />
            </div>
        )
    }

    const totalRevenue = dash.stats?.totalRevenue || 0
    const totalProducts = dash.stats?.totalProducts || 0
    const totalOrders = dash.stats?.totalOrders || 0
    const avgRating = dash.stats?.avgRating || 0
    const recentOrders = (dash.recentOrders || []).slice(0, 5)
    const topProducts = (dash.topProducts || []).slice(0, 5)
    const vendorReviews = dash.recentReviews || []
    const vendorInventoryAlerts = dash.inventoryAlerts || []
    const revenueChartData = dash.revenueChartData || []
    const ratingDist = dash.ratingDist || [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 }))
    const maxRatingCount = Math.max(...ratingDist.map((r) => r.count), 1)

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Vendor"
                title="Dashboard"
                description="Store overview, orders and inventory"
                action={
                    <Link href="/store/add-product" className={brandPrimaryCtaClass} style={{ backgroundColor: BRAND_GREEN }}>
                        <Plus size={16} /> Add product
                    </Link>
                }
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} />
                <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders.toLocaleString('en-IN')} />
                <StatCard icon={Package} label="Active Products" value={totalProducts.toLocaleString('en-IN')} />
                <StatCard icon={Star} label="Average Rating" value={avgRating} />
            </div>

            <VendorDashboardCharts data={revenueChartData} />

            <div className={`${brandCardClass} p-5`}>
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Shortcuts</p>
                <h2 className="mt-1 text-lg font-semibold text-slate-800">Quick actions</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {QUICK_ACTIONS.map((action) => (
                        <Link
                            key={action.href}
                            href={action.href}
                            className={`${brandSecondaryCtaClass} flex-col py-3 text-center`}
                        >
                            <action.icon size={18} style={{ color: BRAND_GREEN }} />
                            {action.label}
                        </Link>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className={`${brandCardClass} flex min-w-0 flex-col p-5`}>
                    <div className="mb-4 flex items-center justify-between gap-3">
                        <div>
                            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Orders</p>
                            <h2 className="text-lg font-bold text-slate-800">Recent orders</h2>
                        </div>
                        <Link href="/store/orders" className={`${brandLinkClass} shrink-0`} style={{ color: BRAND_GREEN }}>
                            See all
                        </Link>
                    </div>
                    {recentOrders.length === 0 ? (
                        <EmptyState embedded icon={ShoppingBag} title="No orders yet" description="Paid orders will show up here" />
                    ) : (
                        <div className="min-w-0 overflow-x-auto">
                            <table className="w-full min-w-[480px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#e4eee6] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        <th className="pb-3 pr-4 font-semibold">Order</th>
                                        <th className="pb-3 pr-4 font-semibold">Customer</th>
                                        <th className="pb-3 pr-4 font-semibold">Amount</th>
                                        <th className="pb-3 font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map((order) => (
                                        <tr key={order.id} className="border-b border-slate-50 last:border-0">
                                            <td className="whitespace-nowrap py-3 pr-4 font-medium text-slate-800">
                                                {String(order.id || '').slice(-8).toUpperCase()}
                                            </td>
                                            <td className="max-w-[9rem] truncate py-3 pr-4 text-slate-600">{order.customer}</td>
                                            <td className="whitespace-nowrap py-3 pr-4 font-medium text-slate-800">
                                                ₹{Number(order.total || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td className="whitespace-nowrap py-3"><StatusBadge status={order.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={`${brandCardClass} flex min-w-0 flex-col p-5`}>
                    <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Reviews</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-800">Rating distribution</h2>
                    <div className="mt-4 space-y-3">
                        {ratingDist.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="w-8 text-xs font-semibold text-slate-600">{star} ★</span>
                                <div className="h-3 flex-1 overflow-hidden rounded-full bg-[#eef4ef]">
                                    <div
                                        className="h-full rounded-full transition-all"
                                        style={{ width: `${(count / maxRatingCount) * 100}%`, backgroundColor: BRAND_GREEN }}
                                    />
                                </div>
                                <span className="w-8 text-right text-xs text-slate-500">{count}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 border-t border-[#e4eee6] pt-4 text-center">
                        <p className="text-3xl font-extrabold text-slate-800">{avgRating}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Average from {dash.stats?.reviewCount || 0} reviews</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className={`${brandCardClass} flex min-w-0 flex-col p-5`}>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Catalog</p>
                            <h2 className="text-lg font-bold text-slate-800">Top products</h2>
                        </div>
                        <Link href="/store/products" className={brandLinkClass} style={{ color: BRAND_GREEN }}>See all</Link>
                    </div>
                    {topProducts.length === 0 ? (
                        <EmptyState embedded icon={Package} title="No products yet" description="Add a product to start selling" />
                    ) : (
                        <div className="min-w-0 overflow-x-auto">
                            <table className="w-full min-w-[420px] text-sm">
                                <thead>
                                    <tr className="border-b border-[#e4eee6] text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                        <th className="pb-3 pr-4 font-semibold">Product</th>
                                        <th className="pb-3 pr-4 font-semibold">Sales</th>
                                        <th className="pb-3 pr-4 font-semibold">Revenue</th>
                                        <th className="pb-3 font-semibold">Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {topProducts.map((product) => (
                                        <tr key={product.id} className="border-b border-slate-50 last:border-0">
                                            <td className="max-w-[180px] truncate py-3 pr-4 font-medium text-slate-800">{product.name}</td>
                                            <td className="whitespace-nowrap py-3 pr-4 text-slate-600">{product.totalSales}</td>
                                            <td className="whitespace-nowrap py-3 pr-4 font-medium text-slate-800">
                                                ₹{Number(product.revenue || 0).toLocaleString('en-IN')}
                                            </td>
                                            <td className="whitespace-nowrap py-3">
                                                <span
                                                    className="rounded-xl px-2 py-0.5 text-xs font-semibold"
                                                    style={product.stock <= 3
                                                        ? { backgroundColor: '#fef2f2', color: '#dc2626' }
                                                        : { backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                                                >
                                                    {product.stock}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className={`${brandCardClass} flex min-w-0 flex-col p-5`}>
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Feedback</p>
                            <h2 className="text-lg font-bold text-slate-800">Recent reviews</h2>
                        </div>
                        <Link href="/store/reviews" className={brandLinkClass} style={{ color: BRAND_GREEN }}>See all</Link>
                    </div>
                    {vendorReviews.length === 0 ? (
                        <EmptyState embedded icon={Star} title="No reviews yet" description="Customer ratings will appear here" />
                    ) : (
                        <div className="space-y-4">
                            {vendorReviews.slice(0, 3).map((review) => (
                                <div key={review.id} className="flex gap-3 border-b border-slate-50 pb-4 last:border-0 last:pb-0">
                                    <div
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                                        style={{ backgroundColor: BRAND_GREEN_LIGHT }}
                                    >
                                        <span className="text-xs font-bold" style={{ color: BRAND_GREEN }}>
                                            {String(review.customer || '?').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="truncate text-sm font-semibold text-slate-700">
                                                {String(review.customer || 'Customer').slice(0, 12)}
                                            </p>
                                            <div className="flex items-center gap-0.5">
                                                {Array(5).fill('').map((_, i) => (
                                                    <Star key={i} size={10} fill={i < review.rating ? '#f59e0b' : '#e2e8f0'} className={i < review.rating ? 'text-amber-400' : 'text-slate-200'} />
                                                ))}
                                            </div>
                                            <span className="ml-auto text-[11px] text-slate-400">{formatDate(review.date)}</span>
                                        </div>
                                        <p className="mt-1 line-clamp-2 text-sm text-slate-600">{review.review}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {vendorInventoryAlerts.length > 0 && (
                <div className={`${brandCardClass} p-5`}>
                    <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-amber-500" />
                            <div>
                                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Inventory</p>
                                <h2 className="text-lg font-bold text-slate-800">Stock alerts</h2>
                            </div>
                        </div>
                        <Link href="/store/inventory" className={brandLinkClass} style={{ color: BRAND_GREEN }}>Manage</Link>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {vendorInventoryAlerts.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-3 rounded-xl border p-3 ${
                                    item.status === 'critical' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                                }`}
                            >
                                <AlertTriangle size={18} className={item.status === 'critical' ? 'text-red-600' : 'text-amber-600'} />
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">{item.name}</p>
                                    <p className={`text-xs ${item.status === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>
                                        {item.stock} units left
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
