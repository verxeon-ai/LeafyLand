'use client'
import dynamic from 'next/dynamic'
import { TrendingUp, ShoppingCart, Users, IndianRupee } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import DataTable from '@/components/admin/DataTable'
import { AdminError, AdminStatSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { brandCardClass } from '@/lib/brand-ui'

const VendorAnalyticsCharts = dynamic(() => import('@/components/charts/VendorAnalyticsCharts'), {
    ssr: false,
    loading: () => (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className={`${brandCardClass} h-[320px] animate-pulse`} />
            <div className={`${brandCardClass} h-[320px] animate-pulse`} />
        </div>
    ),
})

export default function VendorAnalytics() {
    const { data, loading, error, reload } = useCachedJson('/api/vendor/analytics', 'object')

    const totalRevenue = data?.totalRevenue || 0
    const avgOrderValue = data?.avgOrderValue || 0
    const totalCustomers = data?.totalCustomers || 0
    const vendorProducts = data?.products || []
    const vendorCustomers = data?.customers || []
    const monthlyRevenueData = data?.monthlyRevenueData || []
    const repeatCustomers = vendorCustomers.filter((c) => c.totalOrders > 1).length
    const repeatRate = totalCustomers ? Math.round((repeatCustomers / totalCustomers) * 100) : 0

    const categoryData = vendorProducts.reduce((acc, p) => {
        const existing = acc.find((a) => a.name === p.category)
        if (existing) { existing.value += p.totalSales || 0 }
        else { acc.push({ name: p.category, value: p.totalSales || 0 }) }
        return acc
    }, []).sort((a, b) => b.value - a.value)

    const topProducts = [...vendorProducts]
        .sort((a, b) => (b.revenue || 0) - (a.revenue || 0))
        .slice(0, 6)
        .map((p, i) => ({ ...p, rank: i + 1 }))

    const columns = [
        { key: 'rank', label: '#' },
        { key: 'name', label: 'Product', render: (val) => <span className="font-medium text-slate-700">{val}</span> },
        { key: 'category', label: 'Category' },
        { key: 'totalSales', label: 'Sales', render: (val) => val || 0 },
        { key: 'revenue', label: 'Revenue', render: (val) => <span className="font-semibold text-slate-800">₹{(val || 0).toLocaleString('en-IN')}</span> },
        {
            key: 'avgRating',
            label: 'Avg rating',
            render: (val, row) => (
                Array.isArray(row.rating) && row.rating.length
                    ? (row.rating.reduce((a, b) => a + b, 0) / row.rating.length).toFixed(1)
                    : (val || '—')
            ),
        },
    ]

    if (loading && !data) {
        return (
            <div className="space-y-6">
                <PageHeader eyebrow="Vendor" title="Analytics" description="Revenue, customers and top products" />
                <AdminStatSkeleton />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="space-y-6">
                <PageHeader eyebrow="Vendor" title="Analytics" description="Revenue, customers and top products" />
                <AdminError message={error || 'No data available'} onRetry={reload} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Vendor" title="Analytics" description="Revenue, customers and top products" />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} />
                <StatCard icon={ShoppingCart} label="Avg Order Value" value={`₹${avgOrderValue.toLocaleString('en-IN')}`} />
                <StatCard icon={Users} label="Total Customers" value={totalCustomers} />
                <StatCard icon={TrendingUp} label="Repeat Rate" value={`${repeatRate}%`} />
            </div>

            <VendorAnalyticsCharts monthlyRevenueData={monthlyRevenueData} categoryData={categoryData} />

            <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#2f7d4a' }}>Catalog</p>
                <h2 className="mt-1 mb-4 text-lg font-bold text-slate-800">Top products by revenue</h2>
                <DataTable columns={columns} data={topProducts} searchKeys={['name', 'category']} emptyMessage="No product sales yet" />
            </div>
        </div>
    )
}
