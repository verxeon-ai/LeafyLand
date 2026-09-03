'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { useParams } from 'next/navigation'
import OrderDetailsContent from '@/components/orders/OrderDetailsContent'
import { brandSecondaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

export default function OrderDetailsPage() {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [productRatings, setProductRatings] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        Promise.all([fetch(`/api/orders/${orderId}`), fetch('/api/ratings')])
            .then(async ([orderRes, ratingsRes]) => {
                const orderData = await orderRes.json()
                if (!orderRes.ok) throw new Error(orderData.error || 'Could not load order')
                setOrder(orderData)
                const ratingsData = await ratingsRes.json()
                if (Array.isArray(ratingsData)) setProductRatings(ratingsData)
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [orderId])

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
                <Loader2 className="mr-2 animate-spin" size={20} /> Loading order…
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="mx-auto max-w-lg px-4 py-16 text-center">
                <p className="text-red-600">{error || 'Order not found'}</p>
                <Link href="/orders" className="mt-4 inline-block text-sm font-semibold" style={{ color: BRAND_GREEN }}>
                    Back to orders
                </Link>
            </div>
        )
    }

    return (
        <div className="mx-auto w-full min-w-0 max-w-3xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-8">
            <Link href="/orders" className={`${brandSecondaryCtaClass} mb-5`}>
                Back to my orders
            </Link>
            <OrderDetailsContent
                order={order}
                productRatings={productRatings}
                onRated={(created) => setProductRatings((prev) => [...prev, created])}
                onUpdated={(updated) => setOrder((prev) => ({ ...prev, ...updated }))}
            />
        </div>
    )
}
