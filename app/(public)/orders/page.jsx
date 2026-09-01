'use client'
import PageTitle from '@/components/PageTitle'
import { useEffect, useState } from 'react'
import OrderItem from '@/components/OrderItem'

export default function Orders() {
    const [orders, setOrders] = useState([])
    const [productRatings, setProductRatings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([fetch('/api/orders'), fetch('/api/ratings')])
            .then(async ([ordersRes, ratingsRes]) => {
                const ordersData = await ordersRes.json()
                const ratingsData = await ratingsRes.json()
                if (Array.isArray(ordersData)) setOrders(ordersData)
                if (Array.isArray(ratingsData)) setProductRatings(ratingsData)
            })
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [])

    const handleRated = (created) => {
        setProductRatings((prev) => [...prev, created])
    }

    return (
        <div className="min-h-[70vh] mx-6">
            {loading ? (
                <div className="my-20 max-w-7xl mx-auto space-y-4 animate-pulse">
                    <div className="h-8 w-48 bg-slate-100 rounded" />
                    <div className="h-24 bg-slate-100 rounded-xl" />
                    <div className="h-24 bg-slate-100 rounded-xl" />
                </div>
            ) : orders.length > 0 ? (
                <div className="my-20 max-w-7xl mx-auto">
                    <PageTitle heading="My Orders" text={`Showing total ${orders.length} orders`} linkText={'Go to home'} />

                    <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                        <thead>
                            <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                <th className="text-left">Product</th>
                                <th className="text-center">Total Price</th>
                                <th className="text-left">Address</th>
                                <th className="text-left">Payment</th>
                                <th className="text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <OrderItem
                                    order={order}
                                    key={order.id}
                                    productRatings={productRatings}
                                    onRated={handleRated}
                                    onUpdated={(updated) =>
                                        setOrders((prev) =>
                                            prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)),
                                        )
                                    }
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="min-h-[80vh] mx-6 flex items-center justify-center text-slate-400">
                    <h1 className="text-2xl sm:text-4xl font-semibold">You have no orders</h1>
                </div>
            )}
        </div>
    )
}
