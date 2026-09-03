'use client'

import { useCallback, useRef, useState } from 'react'

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            resolve(window.Razorpay)
            return
        }
        const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT}"]`)
        if (existing) {
            existing.addEventListener('load', () => resolve(window.Razorpay))
            existing.addEventListener('error', () => reject(new Error('Could not load Razorpay Checkout')))
            return
        }
        const script = document.createElement('script')
        script.src = CHECKOUT_SCRIPT
        script.async = true
        script.onload = () => {
            if (!window.Razorpay) {
                reject(new Error('Could not load Razorpay Checkout'))
                return
            }
            resolve(window.Razorpay)
        }
        script.onerror = () => reject(new Error('Could not load Razorpay Checkout'))
        document.body.appendChild(script)
    })
}

/** Official Checkout prefill.contact format: +{country code}{number}. */
function toRazorpayContact(phone) {
    const raw = String(phone || '').trim()
    if (!raw) return ''
    const digits = raw.replace(/\D/g, '')
    if (raw.startsWith('+')) return raw
    if (digits.length === 10) return `+91${digits}`
    if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
    return digits ? `+${digits}` : ''
}

/**
 * Official Standard Checkout:
 * 1. Server creates a Razorpay Order
 * 2. checkout.js opens with that order_id
 * 3. handler posts razorpay_order_id / razorpay_payment_id / razorpay_signature for verification
 *
 * @param {{ addressId: string, couponCode?: string, cartItems: Record<string, number>, user?: { name?: string, email?: string, contact?: string } }} opts
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
            if (!createData.keyId || !createData.razorpayOrderId) {
                throw new Error('Could not start payment')
            }

            const Razorpay = await loadRazorpayScript()
            const contact = toRazorpayContact(opts.user?.contact)

            const verified = await new Promise((resolve, reject) => {
                const rzp = new Razorpay({
                    key: createData.keyId,
                    amount: Number(createData.amount),
                    currency: createData.currency || 'INR',
                    name: 'LeafyLand',
                    description: 'Order payment',
                    order_id: createData.razorpayOrderId,
                    prefill: {
                        name: opts.user?.name || '',
                        email: opts.user?.email || '',
                        ...(contact ? { contact } : {}),
                    },
                    theme: { color: '#2f7d4a' },
                    handler(response) {
                        fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        })
                            .then(async (verifyRes) => {
                                const verifyData = await verifyRes.json()
                                if (!verifyRes.ok) {
                                    throw new Error(
                                        verifyData.error ||
                                            'Payment verification failed. Please contact support if your account was charged.',
                                    )
                                }
                                resolve(verifyData)
                            })
                            .catch(reject)
                    },
                    modal: {
                        ondismiss() {
                            reject(new Error('Payment cancelled'))
                        },
                    },
                })
                rzp.on('payment.failed', (response) => {
                    reject(new Error(response?.error?.description || 'Payment failed. You can try again.'))
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
