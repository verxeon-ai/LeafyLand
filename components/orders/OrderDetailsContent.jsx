'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import CatalogImage from '@/components/CatalogImage'
import OrderTimeline from '@/components/orders/OrderTimeline'
import Rating from '@/components/Rating'
import RatingModal from '@/components/RatingModal'
import StatusBadge from '@/components/admin/StatusBadge'
import {
    brandCardClass,
    brandDangerCtaClass,
    brandLabelClass,
    BRAND_GREEN,
} from '@/lib/brand-ui'
import {
    formatAddressLines,
    formatMoney,
    formatOrderRef,
    paymentMethodLabel,
    paymentStatusLabel,
} from '@/lib/order-ui'

function findProductRating(ratings, orderId, productId) {
    return ratings.find((r) => r.orderId === orderId && r.productId === productId)
}

export default function OrderDetailsContent({
    order,
    productRatings = [],
    onRated,
    onUpdated,
    confirmMode = false,
}) {
    const [ratingModal, setRatingModal] = useState(null)
    const [cancelling, setCancelling] = useState(false)
    const addr = order.addressObj
    const canCancel = ['ORDER_PLACED', 'PROCESSING'].includes(order.status)
    const paid = order.isPaid && order.paymentStatus === 'CAPTURED'

    const cancelOrder = async () => {
        if (!canCancel || cancelling) return
        setCancelling(true)
        try {
            const res = await fetch(`/api/orders/${order.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not cancel')
            toast.success('Order cancelled')
            onUpdated?.(data)
        } catch (e) {
            toast.error(e.message)
        } finally {
            setCancelling(false)
        }
    }

    const items = order.orderItems || []
    const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0)
    const discount = Math.max(0, subtotal - Number(order.total || 0))

    return (
        <div className="min-w-0 space-y-5">
            <div className={`${brandCardClass} p-5 sm:p-6`}>
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>
                    {confirmMode ? 'Order confirmation' : 'Order details'}
                </p>
                <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">
                            Order #{formatOrderRef(order.id)}
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {new Date(order.createdAt || order.date).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </p>
                    </div>
                    <StatusBadge status={order.status} />
                </div>
                <div className="mt-5" id="timeline">
                    <p className="mb-3 text-sm font-semibold text-slate-700">Tracking</p>
                    <OrderTimeline status={order.status} />
                    <p className="mt-3 text-xs text-slate-400">
                        The seller updates this as they confirm, process, ship, and complete your order.
                    </p>
                </div>
            </div>

            <div className={`${brandCardClass} p-5 sm:p-6`}>
                <h2 className="text-sm font-bold text-slate-800">Items</h2>
                <div className="mt-4 space-y-4">
                    {items.map((item) => {
                        const product = item.product || {}
                        const productId = item.productId || product.id
                        const existing = findProductRating(productRatings, order.id, productId)
                        const image = product.images?.[0]
                        return (
                            <div key={`${order.id}-${productId}`} className="flex gap-3">
                                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-50">
                                    {image ? <CatalogImage src={image} alt={product.name || ''} fill className="object-cover" sizes="64px" /> : null}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-800">{product.name || item.name}</p>
                                    <p className="text-xs text-slate-500">
                                        {formatMoney(item.price)} × {item.quantity}
                                    </p>
                                    {order.status === 'DELIVERED' && (
                                        existing ? (
                                            <div className="mt-1"><Rating value={existing.rating} /></div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => setRatingModal({ orderId: order.id, productId })}
                                                className="mt-1 text-xs font-semibold hover:underline"
                                                style={{ color: BRAND_GREEN }}
                                            >
                                                Rate product
                                            </button>
                                        )
                                    )}
                                </div>
                                <p className="text-sm font-bold text-slate-800">
                                    {formatMoney(Number(item.price || 0) * Number(item.quantity || 0))}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <div className={`${brandCardClass} p-5`}>
                    <h2 className="text-sm font-bold text-slate-800">Customer</h2>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                        <p>{addr?.name || order.customer}</p>
                        {addr?.phone && <p>{addr.phone}</p>}
                        <p>{addr?.email || order.email}</p>
                    </div>
                </div>
                <div className={`${brandCardClass} p-5`}>
                    <h2 className="text-sm font-bold text-slate-800">Delivery</h2>
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                        {addr ? formatAddressLines(addr).map((line) => <p key={line}>{line}</p>) : (
                            <p className="text-slate-400">Address removed</p>
                        )}
                        {order.store && <p className="pt-2 text-xs text-slate-400">Seller: {order.store}</p>}
                    </div>
                </div>
            </div>

            <div className={`${brandCardClass} p-5`}>
                <h2 className="text-sm font-bold text-slate-800">Payment summary</h2>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between"><span>Subtotal</span><span>{formatMoney(subtotal)}</span></div>
                    <div className="flex justify-between"><span>Delivery</span><span style={{ color: BRAND_GREEN }}>Free</span></div>
                    {discount > 0 && (
                        <div className="flex justify-between">
                            <span>Discount{order.coupon?.code ? ` (${order.coupon.code})` : ''}</span>
                            <span style={{ color: BRAND_GREEN }}>-{formatMoney(discount)}</span>
                        </div>
                    )}
                    <div className="flex justify-between border-t border-slate-100 pt-2 font-bold text-slate-800">
                        <span>Total</span>
                        <span style={{ color: BRAND_GREEN }}>{formatMoney(order.total)}</span>
                    </div>
                    <div className="flex justify-between pt-1 text-xs">
                        <span>{paymentMethodLabel(order.paymentMethod)}</span>
                        <span>{paid ? 'Paid' : paymentStatusLabel(order.paymentStatus)}</span>
                    </div>
                </div>
            </div>

            {canCancel && (
                <button
                    type="button"
                    disabled={cancelling}
                    onClick={cancelOrder}
                    className={`${brandDangerCtaClass} disabled:opacity-50`}
                >
                    {cancelling ? 'Cancelling…' : 'Cancel order'}
                </button>
            )}

            {ratingModal && (
                <RatingModal
                    ratingModal={ratingModal}
                    setRatingModal={setRatingModal}
                    onRated={(created) => {
                        onRated?.({ ...created, orderId: order.id, productId: ratingModal.productId })
                    }}
                />
            )}
        </div>
    )
}
