'use client'
import { useState, useEffect } from 'react'
import { XIcon } from 'lucide-react'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { clearCart } from '@/lib/features/cart/cartSlice'
import AddressPicker from './AddressPicker'
import { useRazorpayCheckout } from '@/components/RazorpayCheckout'

const OrderSummary = ({ totalPrice, items }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const router = useRouter()
    const dispatch = useDispatch()
    const { data: session } = useSession()
    const { pay, paying } = useRazorpayCheckout()

    const [selectedAddressId, setSelectedAddressId] = useState(null)
    const [couponCodeInput, setCouponCodeInput] = useState('')
    const [coupon, setCoupon] = useState('')
    const [razorpayEnabled, setRazorpayEnabled] = useState(false)
    const [configLoaded, setConfigLoaded] = useState(false)

    useEffect(() => {
        fetch('/api/razorpay/config')
            .then((r) => r.json())
            .then((d) => setRazorpayEnabled(Boolean(d?.enabled)))
            .catch(() => setRazorpayEnabled(false))
            .finally(() => setConfigLoaded(true))
    }, [])

    const handleCouponCode = async (event) => {
        event.preventDefault()
        const code = couponCodeInput.trim()
        if (!code) return
        const storeIds = [...new Set((items || []).map((i) => i.storeId).filter(Boolean))]
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
            setCoupon('')
            toast.error(data.error || 'Invalid coupon')
        }
    }

    const discounted = coupon ? totalPrice * (1 - coupon.discount / 100) : totalPrice
    const total = discounted
    const cartItemsPayload = Object.fromEntries((items || []).map((i) => [i.id, i.quantity]))

    const handlePay = async (e) => {
        e.preventDefault()
        if (!selectedAddressId) return toast.error('Please select a delivery address')
        if (!items?.length) return toast.error('Your cart is empty')
        if (!razorpayEnabled) {
            return toast.error('Online payment is not configured yet. Please try again later.')
        }

        try {
            const verified = await pay({
                addressId: selectedAddressId,
                couponCode: coupon ? coupon.code : undefined,
                cartItems: cartItemsPayload,
                user: session?.user,
            })
            dispatch(clearCart())
            toast.success('Payment successful')
            const orderId = verified?.primaryOrderId || verified?.orders?.[0]?.id
            router.push(orderId ? `/orders/${orderId}/success` : '/orders')
        } catch (err) {
            toast.error(err.message || 'Payment could not be completed')
        }
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[360px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>

            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='space-y-2'>
                <label className='flex gap-2 items-center'>
                    <input
                        type="radio"
                        name="payment"
                        checked
                        readOnly
                        className='accent-emerald-700'
                    />
                    <span>Pay online (Razorpay — UPI, Card, Netbanking)</span>
                </label>
            </div>

            {configLoaded && !razorpayEnabled && (
                <p className='text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mt-3'>
                    Razorpay keys are not configured on the server. Add them to enable checkout.
                </p>
            )}

            <div className='my-4 py-4 border-y border-slate-200'>
                <p className='mb-3 text-slate-400 text-xs'>Delivery Address</p>
                <AddressPicker value={selectedAddressId} onChange={setSelectedAddressId} />
            </div>

            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p>Free</p>
                        {coupon && <p>{`-${currency}${((coupon.discount / 100) * totalPrice).toFixed(2)}`}</p>}
                    </div>
                </div>
                {!coupon ? (
                    <form onSubmit={(e) => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-3 mt-3'>
                        <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-400 p-1.5 rounded w-full outline-none' />
                        <button type="submit" className='bg-emerald-700 text-white px-3 rounded hover:bg-emerald-900 active:scale-95 transition-all'>Apply</button>
                    </form>
                ) : (
                    <div className='w-full flex items-center justify-center gap-2 text-xs mt-2'>
                        <p>Code: <span className='font-semibold ml-1'>{coupon.code.toUpperCase()}</span></p>
                        <p>{coupon.description}</p>
                        <XIcon size={18} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                    </div>
                )}
            </div>

            <div className='flex justify-between py-4'>
                <p>Total:</p>
                <p className='font-medium text-right'>{currency}{total.toLocaleString()}</p>
            </div>
            <button
                type="button"
                onClick={(e) => toast.promise(handlePay(e), {
                    loading: 'Opening payment…',
                    success: 'Processing…',
                    error: 'Could not complete checkout',
                })}
                disabled={paying || !razorpayEnabled}
                className='w-full bg-emerald-900 text-white py-2.5 rounded hover:bg-emerald-950 active:scale-95 transition-all disabled:opacity-60'
            >
                {paying ? 'Please wait…' : 'Pay Now'}
            </button>
        </div>
    )
}

export default OrderSummary
