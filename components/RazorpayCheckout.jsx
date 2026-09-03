'use client'

import { useCallback, useRef, useState } from 'react'

function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            resolve(window.Razorpay)
            return
        }
        const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
        if (existing) {
            existing.addEventListener('load', () => resolve(window.Razorpay))
            existing.addEventListener('error', reject)
            return
        }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.async = true
        script.onload = () => resolve(window.Razorpay)
        script.onerror = reject
        document.body.appendChild(script)
    })
}

/**
 * @param {{ addressId: string, couponCode?: string, cartItems: Record<string, number>, user?: { name?: string, email?: string } }} opts
 */
export function useRazorpayCheckout() {
    const [paying, setPaying] = useState(false)
    const payingRef = useRef(false)

    const pay = useCallback(async (opts) => {
        if (payingRef.current) return null
        payingRef.current = true
        setPaying(true)
        try {
            const createRes = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    addressId: opts.addressId,
                    couponCode: opts.couponCode,
                    cartItems: opts.cartItems,
                }),
            })
            const createData = await createRes.json()
            if (!createRes.ok) {
                throw new Error(createData.error || 'Could not start payment')
            }

            const Razorpay = await loadRazorpayScript()

            const verified = await new Promise((resolve, reject) => {
                const rzp = new Razorpay({
                    key: createData.keyId,
                    amount: createData.amount,
                    currency: createData.currency,
                    name: 'LeafyLand',
                    description: 'Order payment',
                    order_id: createData.razorpayOrderId,
                    prefill: {
                        name: opts.user?.name || '',
                        email: opts.user?.email || '',
                    },
                    theme: { color: '#2f7d4a' },
                    handler: async (response) => {
                        try {
                            const verifyRes = await fetch('/api/razorpay/verify', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                }),
                            })
                            const verifyData = await verifyRes.json()
                            if (!verifyRes.ok) {
                                throw new Error(
                                    verifyData.error ||
                                        'Payment verification failed. Please contact support if your account was charged.',
                                )
                            }
                            resolve(verifyData)
                        } catch (err) {
                            reject(err)
                        }
                    },
                    modal: {
                        ondismiss: () => reject(new Error('Payment cancelled')),
                    },
                })
                rzp.on('payment.failed', () => {
                    reject(new Error('Payment failed. You can try again.'))
                })
                rzp.open()
            })

            return verified
        } finally {
            payingRef.current = false
            setPaying(false)
        }
    }, [])

    return { pay, paying }
}
