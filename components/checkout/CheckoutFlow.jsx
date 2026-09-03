'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { X, ShoppingBag, ChevronRight, Lock } from 'lucide-react'
import { clearCart } from '@/lib/features/cart/cartSlice'
import { useRazorpayCheckout } from '@/components/RazorpayCheckout'
import AddressPicker from '@/components/AddressPicker'
import CartLineItem from '@/components/cart/CartLineItem'
import useCartProducts from '@/components/cart/useCartProducts'
import CheckoutStepper from '@/components/checkout/CheckoutStepper'
import OrderTotals from '@/components/checkout/OrderTotals'
import {
    brandCardClass,
    brandInputClass,
    brandLabelClass,
    brandPrimaryCtaClass,
    brandSecondaryCtaClass,
    BRAND_GREEN,
    BRAND_GREEN_LIGHT,
    BRAND_MINT_BORDER,
    BRAND_TEXT,
} from '@/lib/brand-ui'
import { loadCheckoutDraft, saveCheckoutDraft, clearCheckoutDraft, emptyCheckoutDraft } from '@/lib/checkout-draft'
import { formatAddressLines, formatMoney, paymentMethodLabel } from '@/lib/order-ui'

function emailOk(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim())
}

function phoneDigits(value) {
    return String(value || '').replace(/\D/g, '')
}

export default function CheckoutFlow() {
    const router = useRouter()
    const dispatch = useDispatch()
    const { data: session, status } = useSession()
    const { items, subtotal, loading } = useCartProducts()
    const { pay, paying } = useRazorpayCheckout()

    const [step, setStep] = useState(1)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [addressId, setAddressId] = useState('')
    const [addresses, setAddresses] = useState([])
    const [couponCodeInput, setCouponCodeInput] = useState('')
    const [coupon, setCoupon] = useState(null)
    const [couponBusy, setCouponBusy] = useState(false)
    const [razorpayEnabled, setRazorpayEnabled] = useState(false)
    const [configLoaded, setConfigLoaded] = useState(false)
    const [touched, setTouched] = useState({})
    const [submitAttempt, setSubmitAttempt] = useState(0)
    const [ready, setReady] = useState(false)
    const prefilled = useRef(false)

    useEffect(() => {
        const draft = loadCheckoutDraft()
        if (draft) {
            setStep(Math.min(Math.max(Number(draft.step) || 1, 1), 5))
            setName(draft.name || '')
            setEmail(draft.email || '')
            setPhone(draft.phone || '')
            setAddressId(draft.addressId || '')
            setCouponCodeInput(draft.couponCodeInput || '')
            setCoupon(draft.coupon || null)
        }
        setReady(true)
    }, [])

    useEffect(() => {
        if (!ready) return
        saveCheckoutDraft({
            ...emptyCheckoutDraft,
            step,
            name,
            email,
            phone,
            addressId,
            couponCodeInput,
            coupon,
        })
    }, [ready, step, name, email, phone, addressId, couponCodeInput, coupon])

    useEffect(() => {
        fetch('/api/razorpay/config')
            .then((r) => r.json())
            .then((d) => setRazorpayEnabled(Boolean(d?.enabled)))
            .catch(() => setRazorpayEnabled(false))
            .finally(() => setConfigLoaded(true))
    }, [])

    useEffect(() => {
        if (!ready || status !== 'authenticated' || prefilled.current) return
        if (!name && session?.user?.name) setName(session.user.name)
        if (!email && session?.user?.email) setEmail(session.user.email)
        prefilled.current = true
    }, [ready, status, session, name, email])

    useEffect(() => {
        if (!ready || status !== 'authenticated') return
        let cancelled = false
        fetch('/api/addresses')
            .then(async (r) => {
                if (!r.ok) return []
                const data = await r.json()
                return Array.isArray(data) ? data : []
            })
            .then((list) => {
                if (cancelled) return
                setAddresses(list)
                if (!phone) {
                    const selected = list.find((a) => a.id === addressId) || list.find((a) => a.isDefault) || list[0]
                    if (selected?.phone) setPhone(selected.phone)
                    if (!name && selected?.name) setName(selected.name)
                    if (!email && selected?.email) setEmail(selected.email)
                }
            })
            .catch(() => {})
        return () => {
            cancelled = true
        }
    }, [ready, status]) // eslint-disable-line react-hooks/exhaustive-deps

    const selectedAddress = addresses.find((a) => a.id === addressId) || null
    const discount = coupon ? subtotal * (coupon.discount / 100) : 0
    const total = Math.max(0, subtotal - discount)
    const cartItemsPayload = Object.fromEntries(items.map((i) => [i.id, i.quantity]))
    const unavailable = items.some((i) => i.inStock === false)

    const errors = useMemo(() => {
        const next = {}
        if (!name.trim() || name.trim().length < 2) next.name = 'Enter your full name'
        if (!emailOk(email)) next.email = 'Enter a valid email address'
        if (phoneDigits(phone).length < 8) next.phone = 'Enter a valid phone number'
        return next
    }, [name, email, phone])

    const showError = (field) => (touched[field] || submitAttempt > 0) && errors[field]

    const markTouched = (field) => setTouched((prev) => ({ ...prev, [field]: true }))

    const goNext = () => {
        if (step === 1) {
            setSubmitAttempt((n) => n + 1)
            if (Object.keys(errors).length) {
                toast.error('Please complete your contact details')
                return
            }
        }
        if (step === 2 && !addressId) {
            toast.error('Select or add a delivery address')
            return
        }
        if (step === 3 && unavailable) {
            toast.error('Remove unavailable items before continuing')
            return
        }
        if (step === 4 && !razorpayEnabled) {
            toast.error('Online payment is not configured yet')
            return
        }
        setStep((s) => Math.min(s + 1, 5))
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const applyCoupon = async (event) => {
        event.preventDefault()
        const code = couponCodeInput.trim()
        if (!code) return
        setCouponBusy(true)
        try {
            const storeIds = [...new Set(items.map((i) => i.storeId).filter(Boolean))]
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, storeIds }),
            })
            const data = await res.json()
            if (res.ok && data.valid) {
                setCoupon(data.coupon)
                toast.success(`Coupon ${data.coupon.code} applied`)
            } else {
                setCoupon(null)
                toast.error(data.error || 'Invalid coupon')
            }
        } catch {
            toast.error('Could not check coupon')
        } finally {
            setCouponBusy(false)
        }
    }

    const syncAddressContact = async () => {
        if (!addressId) return
        const addr = addresses.find((a) => a.id === addressId)
        if (!addr) return
        if (addr.name === name.trim() && addr.email === email.trim() && addr.phone === phone.trim()) return
        await fetch(`/api/addresses/${addressId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...addr,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
            }),
        }).catch(() => {})
    }

    const placeOrder = async () => {
        if (paying) return
        if (!addressId) return toast.error('Please select a delivery address')
        if (!items.length) return toast.error('Your cart is empty')
        if (unavailable) return toast.error('Remove unavailable items before placing the order')
        if (!razorpayEnabled) return toast.error('Online payment is not configured yet. Please try again later.')
        if (Object.keys(errors).length) {
            setStep(1)
            setSubmitAttempt((n) => n + 1)
            return toast.error('Please complete your contact details')
        }

        try {
            await syncAddressContact()
            const verified = await pay({
                addressId,
                couponCode: coupon ? coupon.code : undefined,
                cartItems: cartItemsPayload,
                user: { name: name.trim(), email: email.trim(), contact: phone.trim() },
            })
            if (!verified) return
            dispatch(clearCart())
            clearCheckoutDraft()
            toast.success('Order placed successfully')
            const orderId = verified?.primaryOrderId || verified?.orders?.[0]?.id
            router.push(orderId ? `/orders/${orderId}/success` : '/orders')
        } catch (err) {
            toast.error(err.message || 'Payment could not be completed')
        }
    }

    if (status === 'loading' || loading) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
                <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-100" />
                <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                    <div className="h-72 animate-pulse rounded-xl bg-slate-100" />
                    <div className="h-56 animate-pulse rounded-xl bg-slate-100" />
                </div>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
                <div className="w-full max-w-md rounded-xl border border-slate-100 bg-white p-8 text-center shadow-sm">
                    <div
                        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                        style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                    >
                        <Lock size={22} />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800">Sign in to checkout</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        We use your account to save your address, payment, and order tracking.
                    </p>
                    <Link
                        href="/login?callbackUrl=/checkout"
                        className={`${brandPrimaryCtaClass} mt-6 w-full`}
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        Sign in to continue
                    </Link>
                    <Link href="/cart" className="mt-3 block text-xs font-medium text-slate-500 hover:underline">
                        Back to cart
                    </Link>
                </div>
            </div>
        )
    }

    if (!items.length) {
        return (
            <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-5">
                    <ShoppingBag size={32} className="text-slate-300" />
                </div>
                <h1 className="text-xl font-bold text-slate-800 mb-1">Your cart is empty</h1>
                <p className="text-sm text-slate-500 mb-5">Add items before checking out</p>
                <Link
                    href="/products"
                    className={`${brandPrimaryCtaClass} px-6 py-2.5`}
                    style={{ backgroundColor: BRAND_GREEN }}
                >
                    Continue shopping <ChevronRight size={16} />
                </Link>
            </div>
        )
    }

    const continueLabel = step === 5 ? (paying ? 'Placing order…' : 'Place order') : 'Continue'

    return (
        <div className="mx-auto w-full min-w-0 max-w-6xl overflow-x-hidden px-3 pb-32 pt-4 sm:px-6 sm:pt-6 lg:pb-10">
            <div className="mb-2 min-w-0">
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Checkout</p>
                <h1 className="mt-1 text-xl font-bold break-words sm:text-2xl" style={{ color: BRAND_TEXT }}>Complete your order</h1>
                <p className="mt-1 text-sm leading-relaxed text-slate-500">
                    {items.length === 1 ? '1 item' : `${items.length} items`}. You can go back to the cart without losing these details.
                </p>
            </div>

            <CheckoutStepper step={step} onStepSelect={setStep} />

            <div className="grid min-w-0 gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                <div className={`${brandCardClass} min-w-0 p-3.5 sm:p-6`}>
                    {step === 1 && (
                        <section>
                            <h2 className="text-base font-bold text-slate-800">Customer information</h2>
                            <p className="mt-1 text-sm text-slate-500">We’ll use this on your order confirmation.</p>
                            <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                <label className="sm:col-span-2">
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Full name <span style={{ color: BRAND_GREEN }}>*</span>
                                    </span>
                                    <input
                                        className={brandInputClass}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onBlur={() => markTouched('name')}
                                        placeholder="As it should appear on the order"
                                        autoComplete="name"
                                    />
                                    {showError('name') && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </label>
                                <label>
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Email <span style={{ color: BRAND_GREEN }}>*</span>
                                    </span>
                                    <input
                                        className={brandInputClass}
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onBlur={() => markTouched('email')}
                                        placeholder="you@example.com"
                                        autoComplete="email"
                                    />
                                    {showError('email') && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                                </label>
                                <label>
                                    <span className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Phone number <span style={{ color: BRAND_GREEN }}>*</span>
                                    </span>
                                    <input
                                        className={brandInputClass}
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        onBlur={() => markTouched('phone')}
                                        placeholder="For delivery updates"
                                        autoComplete="tel"
                                    />
                                    {showError('phone') && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
                                </label>
                            </div>
                            {session?.user?.email && (
                                <p className="mt-4 text-xs text-slate-400">Signed in as {session.user.email}</p>
                            )}
                        </section>
                    )}

                    {step === 2 && (
                        <section>
                            <h2 className="text-base font-bold text-slate-800">Delivery details</h2>
                            <p className="mt-1 text-sm leading-relaxed text-slate-500">
                                These items ship from LeafyLand sellers. Choose where we should deliver them.
                            </p>
                            <div className="mt-5">
                                {ready && (
                                    <AddressPicker
                                        value={addressId || null}
                                        onChange={(id) => setAddressId(id || '')}
                                        contactDefaults={{ name, email, phone }}
                                        onAddressesChange={setAddresses}
                                    />
                                )}
                            </div>
                        </section>
                    )}

                    {step === 3 && (
                        <section>
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800">Order details</h2>
                                    <p className="mt-1 text-sm text-slate-500">Confirm what you’re ordering before payment.</p>
                                </div>
                                <Link href="/cart" className="text-xs font-semibold hover:underline" style={{ color: BRAND_GREEN }}>
                                    Edit cart
                                </Link>
                            </div>
                            <div className="mt-4 space-y-3">
                                {items.map((item) => (
                                    <CartLineItem key={item.id} item={item} readOnly />
                                ))}
                            </div>
                            <form onSubmit={applyCoupon} className="mt-5 flex min-w-0 flex-col gap-2 sm:flex-row">
                                <input
                                    className={brandInputClass}
                                    value={couponCodeInput}
                                    onChange={(e) => setCouponCodeInput(e.target.value)}
                                    placeholder="Coupon code"
                                    aria-label="Coupon code"
                                />
                                <button
                                    type="submit"
                                    disabled={couponBusy}
                                    className={`${brandSecondaryCtaClass} shrink-0 disabled:opacity-60 sm:w-auto`}
                                >
                                    {couponBusy ? 'Checking…' : 'Apply'}
                                </button>
                            </form>
                            {coupon && (
                                <div className="mt-3 flex items-center justify-between rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: BRAND_GREEN_LIGHT }}>
                                    <span>
                                        <span className="font-semibold">{coupon.code}</span>
                                        {coupon.description ? ` — ${coupon.description}` : ''}
                                    </span>
                                    <button type="button" onClick={() => setCoupon(null)} className="text-slate-500 hover:text-red-600" aria-label="Remove coupon">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                        </section>
                    )}

                    {step === 4 && (
                        <section>
                            <h2 className="text-base font-bold text-slate-800">Payment</h2>
                            <p className="mt-1 text-sm text-slate-500">You’ll complete payment securely on the next step.</p>
                            <div className="mt-5 space-y-3">
                                <label
                                    className="flex cursor-pointer items-start gap-3 rounded-xl border p-4"
                                    style={{ borderColor: BRAND_GREEN, backgroundColor: BRAND_GREEN_LIGHT }}
                                >
                                    <input type="radio" name="payment" checked readOnly className="mt-1 accent-[#2f7d4a]" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">Pay online</p>
                                        <p className="text-xs text-slate-500">Razorpay — UPI, cards, and netbanking</p>
                                    </div>
                                </label>
                                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 opacity-70">
                                    <input type="radio" name="payment-cod" disabled className="mt-1" />
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-slate-700">Cash on Delivery</p>
                                            <span className="rounded-xl bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                                                Coming soon
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500">Not available for this checkout yet.</p>
                                    </div>
                                </div>
                            </div>
                            {configLoaded && !razorpayEnabled && (
                                <p className="mt-4 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                    Online payment is not configured on the server yet. Please try again later.
                                </p>
                            )}
                        </section>
                    )}

                    {step === 5 && (
                        <section>
                            <h2 className="text-base font-bold text-slate-800">Review & confirm</h2>
                            <p className="mt-1 text-sm text-slate-500">Place order will open Razorpay to complete payment.</p>

                            <div className="mt-5 space-y-4">
                                <ReviewBlock title="Customer" onEdit={() => setStep(1)}>
                                    <p className="font-medium text-slate-800">{name}</p>
                                    <p>{phone}</p>
                                    <p>{email}</p>
                                </ReviewBlock>
                                <ReviewBlock title="Delivery" onEdit={() => setStep(2)}>
                                    {selectedAddress ? (
                                        formatAddressLines(selectedAddress).map((line) => <p key={line}>{line}</p>)
                                    ) : (
                                        <p className="text-slate-400">No address selected</p>
                                    )}
                                </ReviewBlock>
                                <ReviewBlock title="Order" onEdit={() => setStep(3)}>
                                    {items.map((item) => (
                                        <p key={item.id}>
                                            {item.name} × {item.quantity} — {formatMoney(item.price * item.quantity)}
                                        </p>
                                    ))}
                                </ReviewBlock>
                                <ReviewBlock title="Payment" onEdit={() => setStep(4)}>
                                    <p>{paymentMethodLabel('RAZORPAY')}</p>
                                </ReviewBlock>
                            </div>
                        </section>
                    )}

                    <div className="mt-6 hidden items-center justify-between gap-3 sm:flex">
                        {step > 1 ? (
                            <button type="button" onClick={() => setStep((s) => s - 1)} className={brandSecondaryCtaClass}>
                                Back
                            </button>
                        ) : (
                            <Link href="/cart" className={brandSecondaryCtaClass}>
                                Back to cart
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={step === 5 ? placeOrder : goNext}
                            disabled={paying || (step === 4 && !razorpayEnabled) || (step === 5 && !razorpayEnabled)}
                            className={`${brandPrimaryCtaClass} min-w-40 px-6 py-2.5 disabled:cursor-not-allowed disabled:opacity-60`}
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            {continueLabel}
                        </button>
                    </div>
                </div>

                <aside className={`${brandCardClass} min-w-0 p-3.5 sm:p-5 lg:sticky lg:top-28`}>
                    <h2 className="mb-4 text-sm font-bold text-slate-800">Order summary</h2>
                    <div className="mb-4 max-h-40 space-y-2 overflow-y-auto">
                        {items.map((item) => (
                            <div key={item.id} className="flex items-start justify-between gap-3 text-xs text-slate-600">
                                <span className="min-w-0 break-words">{item.name} × {item.quantity}</span>
                                <span className="shrink-0 font-medium tabular-nums">{formatMoney(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <OrderTotals subtotal={subtotal} discount={discount} couponCode={coupon?.code} />
                    <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
                        After you place the order, the seller will confirm it and update tracking from processing to shipped and delivered.
                    </p>
                </aside>
            </div>

            <div
                className="fixed inset-x-0 bottom-0 z-40 border-t bg-white px-3 pt-3 sm:hidden"
                style={{ borderColor: BRAND_MINT_BORDER, paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
            >
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-500">Total</span>
                    <span className="shrink-0 font-bold tabular-nums" style={{ color: BRAND_GREEN }}>{formatMoney(total)}</span>
                </div>
                <div className="flex min-w-0 gap-2">
                    {step > 1 ? (
                        <button type="button" onClick={() => setStep((s) => s - 1)} className={`${brandSecondaryCtaClass} min-h-11 min-w-0 flex-1 py-2.5`}>
                            Back
                        </button>
                    ) : (
                        <Link href="/cart" className={`${brandSecondaryCtaClass} min-h-11 min-w-0 flex-1 py-2.5`}>
                            Cart
                        </Link>
                    )}
                    <button
                        type="button"
                        onClick={step === 5 ? placeOrder : goNext}
                        disabled={paying || (step >= 4 && !razorpayEnabled)}
                        className={`${brandPrimaryCtaClass} min-h-11 min-w-0 flex-[1.6] py-2.5 disabled:opacity-60`}
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        {continueLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}

function ReviewBlock({ title, onEdit, children }) {
    return (
        <div className="rounded-xl border border-slate-100 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
                <button type="button" onClick={onEdit} className="text-xs font-semibold hover:underline" style={{ color: BRAND_GREEN }}>
                    Edit
                </button>
            </div>
            <div className="space-y-0.5 break-words text-sm text-slate-600">{children}</div>
        </div>
    )
}
