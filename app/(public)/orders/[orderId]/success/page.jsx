'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, Loader2, Package, Truck } from 'lucide-react'
import { useParams } from 'next/navigation'
import OrderDetailsContent from '@/components/orders/OrderDetailsContent'
import {
    brandPrimaryCtaClass,
    brandSecondaryCtaClass,
    BRAND_GREEN,
    BRAND_GREEN_LIGHT,
} from '@/lib/brand-ui'
import { formatMoney, formatOrderRef, paymentMethodLabel } from '@/lib/order-ui'

export default function OrderSuccessPage() {
    const { orderId } = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch(`/api/orders/${orderId}`)
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not load order')
                setOrder(data)
            })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false))
    }, [orderId])

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center text-slate-500">
                <Loader2 className="mr-2 animate-spin" size={20} /> Confirming your order…
            </div>
        )
    }

    if (error || !order) {
        return (
            <div className="mx-auto max-w-lg px-4 py-16 text-center">
                <p className="text-red-600">{error || 'Order not found'}</p>
                <Link href="/orders" className="mt-4 inline-block text-sm font-semibold" style={{ color: BRAND_GREEN }}>
                    View orders
                </Link>
            </div>
        )
    }

    const paid = order.isPaid && order.paymentStatus === 'CAPTURED'

    return (
        <div className="mx-auto w-full min-w-0 max-w-3xl overflow-x-hidden px-3 py-6 sm:px-6 sm:py-12">
            <div className="mb-8 text-center">
                {paid ? (
                    <>
                        <div
                            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full"
                            style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                        >
                            <CheckCircle size={36} />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-800">Order placed successfully</h1>
                        <p className="mt-2 text-sm text-slate-500">
                            Order #{formatOrderRef(order.id)} · {new Date(order.createdAt || order.date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                        </p>
                        <p className="mt-3 text-lg font-bold" style={{ color: BRAND_GREEN }}>{formatMoney(order.total)}</p>
                        <p className="mt-1 text-xs text-slate-500">{paymentMethodLabel(order.paymentMethod)}</p>
                        <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
                            The seller will confirm this order next. You can track it as it moves to processing, shipped, and delivered.
                        </p>
                    </>
                ) : (
                    <>
                        <Loader2 className="mx-auto mb-4 animate-spin" size={40} style={{ color: BRAND_GREEN }} />
                        <h1 className="text-xl font-bold text-slate-800">Payment processing</h1>
                        <p className="mt-2 text-sm text-slate-500">We are confirming your payment. Refresh this page in a moment.</p>
                    </>
                )}
                <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                    <Link href={`/orders/${order.id}`} className={`${brandPrimaryCtaClass} px-5 py-2.5`} style={{ backgroundColor: BRAND_GREEN }}>
                        <Package size={16} /> View order
                    </Link>
                    <Link href={`/orders/${order.id}#timeline`} className={`${brandSecondaryCtaClass} px-5 py-2.5`}>
                        <Truck size={16} /> Track order
                    </Link>
                    <Link href="/products" className={`${brandSecondaryCtaClass} px-5 py-2.5`}>
                        Continue shopping
                    </Link>
                </div>
            </div>
            <OrderDetailsContent order={order} confirmMode />
        </div>
    )
}
