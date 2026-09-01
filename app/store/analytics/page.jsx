'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { TrendingUp, ShoppingCart, Users, IndianRupee, ArrowUpRight } from 'lucide-react'

const VendorAnalyticsCharts = dynamic(() => import('@/components/charts/VendorAnalyticsCharts'), {
    ssr: false,
    loading: () => <div className="h-[320px] bg-white rounded-2xl border border-slate-100 animate-pulse" />,
})

export default function VendorAnalytics() {
    const [data, setData] = useState(null)

    useEffect(() => {
        fetch('/api/vendor/analytics')
            .then((r) => r.json())
            .then((d) => { if (!d.error) setData(d) })
    }, [])

    const totalRevenue = data?.totalRevenue || 0
    const avgOrderValue = data?.avgOrderValue || 0
    const totalCustomers = data?.totalCustomers || 0
    const vendorProducts = data?.products || []
    const vendorCustomers = data?.customers || []
    const monthlyRevenueData = data?.monthlyRevenueData || []
    const repeatCustomers = vendorCustomers.filter(c => c.totalOrders > 1).length
    const repeatRate = totalCustomers ? Math.round((repeatCustomers / totalCustomers) * 100) : 0

    const categoryData = vendorProducts.reduce((acc, p) => {
        const existing = acc.find(a => a.name === p.category)
        if (existing) { existing.value += p.totalSales || 0 }
        else { acc.push({ name: p.category, value: p.totalSales || 0 }) }
        return acc
    }, []).sort((a, b) => b.value - a.value)

    const topProducts = [...vendorProducts].sort((a, b) => (b.revenue || 0) - (a.revenue || 0)).slice(0, 6)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-slate-800">
                Store <span className="font-bold">Analytics</span>
            </h1>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'bg-emerald-100' },
                    { label: 'Avg Order Value', value: `₹${avgOrderValue.toLocaleString()}`, icon: ShoppingCart, color: 'bg-blue-100' },
                    { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'bg-purple-100' },
                    { label: 'Repeat Rate', value: `${repeatRate}%`, icon: TrendingUp, color: 'bg-amber-100' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`w-10 h-10 ${kpi.color} rounded-xl flex items-center justify-center`}>
                                <kpi.icon size={18} className="text-slate-600" />
                            </div>
                            <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-600">
                                <ArrowUpRight size={12} />
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">{kpi.label}</p>
                        <p className="text-xl font-bold text-slate-800 mt-0.5">{kpi.value}</p>
                    </div>
                ))}
            </div>

            <VendorAnalyticsCharts monthlyRevenueData={monthlyRevenueData} categoryData={categoryData} />

            <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Products by Revenue</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm min-w-[500px]">
                        <thead>
                            <tr className="text-left text-slate-500 border-b border-slate-100">
                                <th className="pb-3 px-2 sm:px-3 font-medium">#</th>
                                <th className="pb-3 px-2 sm:px-3 font-medium">Product</th>
                                <th className="pb-3 px-2 sm:px-3 font-medium">Category</th>
                                <th className="pb-3 px-2 sm:px-3 font-medium">Sales</th>
                                <th className="pb-3 px-2 sm:px-3 font-medium">Revenue</th>
                                <th className="pb-3 px-2 sm:px-3 font-medium">Avg Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topProducts.map((p, i) => (
                                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-400 font-medium">{i + 1}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-slate-700">{p.name}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-500">{p.category}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-600">{p.totalSales || 0}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-3 font-semibold text-slate-800">₹{(p.revenue || 0).toLocaleString()}</td>
                                    <td className="py-2 sm:py-3 px-2 sm:px-3 text-amber-500 font-semibold">
                                        {Array.isArray(p.rating) && p.rating.length ? (p.rating.reduce((a, b) => a + b, 0) / p.rating.length).toFixed(1) : (p.avgRating || '—')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
