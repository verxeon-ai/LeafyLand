'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { IndianRupee, ShoppingBag, Package, Star, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'

const VendorRevenueChart = dynamic(() => import('@/components/charts/VendorRevenueChart'), {
    ssr: false,
    loading: () => <div className="h-[260px] bg-slate-50 rounded-xl animate-pulse" />,
})

export default function VendorDashboard() {
    const [dash, setDash] = useState(null)

    useEffect(() => {
        fetch('/api/vendor/dashboard')
            .then((r) => r.json())
            .then((data) => { if (!data.error) setDash(data) })
    }, [])

    const totalRevenue = dash?.stats?.totalRevenue || 0
    const totalProducts = dash?.stats?.totalProducts || 0
    const totalOrders = dash?.stats?.totalOrders || 0
    const avgRating = dash?.stats?.avgRating || 0
    const vendorOrders = dash?.recentOrders || []
    const vendorProducts = dash?.topProducts || []
    const vendorReviews = dash?.recentReviews || []
    const vendorInventoryAlerts = dash?.inventoryAlerts || []
    const revenueChartData = dash?.revenueChartData || []
    const recentOrders = vendorOrders.slice(0, 5)
    const topProducts = vendorProducts.slice(0, 5)
    const ratingDist = dash?.ratingDist || [5, 4, 3, 2, 1].map((star) => ({ star, count: 0 }))
    const maxRatingCount = Math.max(...ratingDist.map(r => r.count), 1)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-slate-800">
                Vendor <span className="font-bold">Dashboard</span>
            </h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={IndianRupee} label="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN')}`} change={12.5} color="bg-emerald-100" />
                <StatCard icon={ShoppingBag} label="Total Orders" value={totalOrders} change={8.2} color="bg-blue-100" />
                <StatCard icon={Package} label="Active Products" value={totalProducts} change={5.0} color="bg-purple-100" />
                <StatCard icon={Star} label="Average Rating" value={avgRating} change={2.1} color="bg-amber-100" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Revenue This Week</h2>
                    <div className="w-full" style={{ minWidth: 0 }}>
                    <VendorRevenueChart data={revenueChartData} />
                    </div>
                </div>

                {/* Rating Distribution */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Rating Distribution</h2>
                    <div className="space-y-3">
                        {ratingDist.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-xs font-semibold text-slate-600 w-8">{star} ★</span>
                                <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 rounded-full transition-all"
                                        style={{ width: `${(count / maxRatingCount) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 w-8 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                        <p className="text-3xl font-extrabold text-slate-800">{avgRating}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Average from {dash?.stats?.reviewCount || 0} reviews</p>
                    </div>
                </div>
            </div>

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[350px]">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-100">
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Order ID</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Customer</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Amount</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-slate-50 last:border-0">
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-slate-700">{order.id}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-600">{order.customer}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-700">₹{order.total.toLocaleString('en-IN')}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3"><StatusBadge status={order.status} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Top Products</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[350px]">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-100">
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Product</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Sales</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Revenue</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-slate-50 last:border-0">
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-slate-700 truncate max-w-[140px] sm:max-w-[180px]">{product.name}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-600">{product.totalSales}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-700">₹{product.revenue.toLocaleString('en-IN')}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                product.stock <= 3 ? 'bg-red-100 text-red-600' :
                                                product.stock <= 10 ? 'bg-amber-100 text-amber-600' :
                                                'bg-emerald-100 text-emerald-600'
                                            }`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Stock Alerts */}
            {vendorInventoryAlerts.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={18} className="text-amber-500" />
                        <h2 className="text-lg font-semibold text-slate-800">Stock Alerts</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {vendorInventoryAlerts.map((item) => (
                            <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                                item.status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
                            }`}>
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    item.status === 'critical' ? 'bg-red-100' : 'bg-amber-100'
                                }`}>
                                    <AlertTriangle size={18} className={item.status === 'critical' ? 'text-red-600' : 'text-amber-600'} />
                                </div>
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

            {/* Recent Reviews */}
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Reviews</h2>
                <div className="space-y-4">
                    {vendorReviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="flex gap-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                            <div className="w-9 h-9 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-emerald-700">{review.customer.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-slate-700">{review.customer}</p>
                                    <div className="flex items-center gap-0.5">
                                        {Array(5).fill('').map((_, i) => (
                                            <Star key={i} size={10} fill={i < review.rating ? '#f59e0b' : '#e2e8f0'} className={i < review.rating ? 'text-amber-400' : 'text-slate-200'} />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{review.product}</p>
                                <p className="text-sm text-slate-600 mt-1 line-clamp-2">{review.review}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
