'use client'
import Link from 'next/link'
import { useDispatch } from 'react-redux'
import { addToCart, removeFromCart, deleteItemFromCart } from '@/lib/features/cart/cartSlice'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import CartLineItem from '@/components/cart/CartLineItem'
import useCartProducts from '@/components/cart/useCartProducts'
import OrderTotals from '@/components/checkout/OrderTotals'
import {
    brandCardClass,
    brandPrimaryCtaClass,
    brandLabelClass,
    BRAND_GREEN,
    BRAND_GREEN_LIGHT,
    BRAND_TEXT,
} from '@/lib/brand-ui'
import { formatMoney } from '@/lib/order-ui'
import toast from 'react-hot-toast'

export default function Cart() {
    const { items, subtotal, loading, productCount } = useCartProducts()
    const dispatch = useDispatch()

    const increment = (productId) => {
        const item = items.find((i) => i.id === productId)
        if (typeof item?.stock === 'number' && item.quantity >= item.stock) {
            toast.error('No more stock available')
            return
        }
        dispatch(addToCart({ productId }))
    }

    if (loading && productCount > 0) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <div className="h-8 w-32 animate-pulse rounded-xl bg-slate-100" />
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="h-40 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
                </div>
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
                <div
                    className="mb-5 flex h-20 w-20 items-center justify-center rounded-full"
                    style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                >
                    <ShoppingBag size={32} />
                </div>
                <h1 className="text-xl font-bold text-slate-800">Your cart is empty</h1>
                <p className="mt-1 max-w-sm text-center text-sm text-slate-500">
                    Browse plants and garden products, then add them here when you’re ready to order.
                </p>
                <Link
                    href="/products"
                    className={`${brandPrimaryCtaClass} mt-5 px-6 py-2.5`}
                    style={{ backgroundColor: BRAND_GREEN }}
                >
                    Continue shopping <ChevronRight size={16} />
                </Link>
            </div>
        )
    }

    const qtyCount = items.reduce((s, i) => s + i.quantity, 0)

    return (
        <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden px-3 pb-32 pt-4 sm:px-6 sm:pt-6 lg:pb-10">
            <div className="mb-6">
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Cart</p>
                <h1 className="mt-1 text-xl font-bold sm:text-2xl" style={{ color: BRAND_TEXT }}>My cart</h1>
                <p className="mt-1 text-sm text-slate-500">
                    {items.length} {items.length === 1 ? 'item' : 'items'} · {qtyCount} {qtyCount === 1 ? 'unit' : 'units'}
                </p>
            </div>

            <div className="flex flex-col gap-6 lg:flex-row">
                <div className="min-w-0 flex-1 space-y-3">
                    {items.map((item) => (
                        <CartLineItem
                            key={item.id}
                            item={item}
                            onIncrement={increment}
                            onDecrement={(id) => dispatch(removeFromCart({ productId: id }))}
                            onRemove={(id) => dispatch(deleteItemFromCart({ productId: id }))}
                        />
                    ))}
                    <Link href="/products" className="inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: BRAND_GREEN }}>
                        Continue shopping <ChevronRight size={14} />
                    </Link>
                </div>

                <aside className="w-full shrink-0 lg:w-80">
                    <div className={`${brandCardClass} p-5 lg:sticky lg:top-28`}>
                        <h2 className="mb-4 text-sm font-bold text-slate-800">Order summary</h2>
                        <OrderTotals subtotal={subtotal} />
                        <Link
                            href="/checkout"
                            className={`${brandPrimaryCtaClass} mt-5 w-full py-2.5`}
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            Proceed to order
                        </Link>
                        <p className="mt-3 text-center text-[11px] text-slate-400">
                            You’ll confirm delivery and pay on the next screens. Total {formatMoney(subtotal)}.
                        </p>
                    </div>
                </aside>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e4eee6] bg-white px-3 pt-3 lg:hidden" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Total</span>
                    <span className="font-bold" style={{ color: BRAND_GREEN }}>{formatMoney(subtotal)}</span>
                </div>
                <Link href="/checkout" className={`${brandPrimaryCtaClass} w-full py-2.5`} style={{ backgroundColor: BRAND_GREEN }}>
                    Proceed to order
                </Link>
            </div>
        </div>
    )
}
