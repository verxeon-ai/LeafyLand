'use client'

import { useEffect, useState } from 'react'
import { Users, IndianRupee, ShoppingBag, Store } from 'lucide-react'
import dynamic from 'next/dynamic'
import StatCard from '@/components/admin/StatCard'
import StatusBadge from '@/components/admin/StatusBadge'

const AdminDashboardCharts = dynamic(() => import('@/components/charts/AdminDashboardCharts'), {
    ssr: false,
    loading: () => <div className="h-[340px] bg-white rounded-2xl border border-slate-100 animate-pulse" />,
})

const formatDate = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
}

const formatCurrency = (value) =>
    `₹${(Number(value) || 0).toLocaleString('en-IN')}`

export default function AdminDashboard() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/admin/dashboard')
            .then(async (res) => {
                if (!res.ok) throw new Error('Failed to load dashboard')
                return res.json()
            })
            .then((json) => setData(json))
            .catch((e) => setError(e.message || 'Something went wrong'))
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="space-y-6">
                <h1 className="text-2xl font-semibold text-slate-800">
                    Admin <span className="font-bold">Dashboard</span>
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100" />
                    ))}
                </div>
                <div className="h-[340px] bg-white rounded-2xl border border-slate-100 animate-pulse" />
            </div>
        )
    }

    if (error || !data) {
        return <p className="text-red-600">{error || 'No data available'}</p>
    }

    const { stats, ordersChartData, revenueChartData, pendingStores, recentOrders } = data

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold text-slate-800">
                Admin <span className="font-bold">Dashboard</span>
            </h1>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Users" value={stats.users.toLocaleString('en-IN')} color="bg-blue-100" />
                <StatCard icon={IndianRupee} label="Total Revenue" value={formatCurrency(stats.revenue)} color="bg-emerald-100" />
                <StatCard icon={ShoppingBag} label="Total Orders" value={stats.orders.toLocaleString('en-IN')} color="bg-purple-100" />
                <StatCard icon={Store} label="Active Stores" value={stats.stores.toLocaleString('en-IN')} color="bg-amber-100" />
            </div>

            <AdminDashboardCharts ordersChartData={ordersChartData} revenueChartData={revenueChartData} />

            {/* Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Orders</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[400px]">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-100">
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Order ID</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Customer</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Amount</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Status</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-6 text-center text-slate-400">No orders yet</td>
                                    </tr>
                                )}
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="border-b border-slate-50 last:border-0">
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-slate-700">{order.id.slice(-8).toUpperCase()}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-600">{order.user?.name || 'Customer'}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-700">{formatCurrency(order.total)}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3"><StatusBadge status={order.status} /></td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-500">{formatDate(order.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">Pending Approvals</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs sm:text-sm min-w-[350px]">
                            <thead>
                                <tr className="text-left text-slate-500 border-b border-slate-100">
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Store Name</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Owner</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium">Date</th>
                                    <th className="pb-3 px-2 sm:px-3 font-medium text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingStores.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-6 text-center text-slate-400">No pending stores</td>
                                    </tr>
                                )}
                                {pendingStores.map((store) => (
                                    <tr key={store.id} className="border-b border-slate-50 last:border-0">
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 font-medium text-slate-700">{store.name}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-600">{store.user?.name || 'Owner'}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-slate-500">{formatDate(store.createdAt)}</td>
                                        <td className="py-2 sm:py-3 px-2 sm:px-3 text-right space-x-2">
                                            <button className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-lg hover:bg-emerald-700 transition-colors">
                                                Approve
                                            </button>
                                            <button className="bg-red-50 text-red-600 text-xs px-3 py-1 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">
                                                Reject
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
