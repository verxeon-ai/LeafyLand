import 'server-only'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
/** Official Razorpay Node SDK — https://github.com/razorpay/razorpay-node */
const Razorpay = require('razorpay')
const { validatePaymentVerification, validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils')

function cleanEnv(value) {
    return String(value || '')
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .trim()
}

function isPlaceholderKey(keyId, keySecret) {
    const id = keyId.toLowerCase()
    const secret = keySecret.toLowerCase()
    if (!/^rzp_(test|live)_[a-z0-9]+$/i.test(keyId)) return true
    if (id.includes('xxxxxxxx') || /_x{6,}$/.test(id)) return true
    if (secret.includes('your_test') || secret.includes('changeme') || secret.includes('xxxxxxxx')) return true
    return false
}

function getKeys() {
    const keyId = cleanEnv(process.env.RAZORPAY_KEY_ID)
    const keySecret = cleanEnv(process.env.RAZORPAY_KEY_SECRET)
    if (!keyId || !keySecret) {
        throw new Error('Razorpay is not configured')
    }
    if (isPlaceholderKey(keyId, keySecret)) {
        const err = new Error(
            'Razorpay keys in .env are still placeholders. Generate test keys at dashboard.razorpay.com → Account & Settings → API Keys, then set RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, and NEXT_PUBLIC_RAZORPAY_KEY_ID to the same Key ID.',
        )
        err.status = 503
        throw err
    }
    return { keyId, keySecret }
}

function getRazorpay() {
    const { keyId, keySecret } = getKeys()
    return new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
    })
}

function mapSdkError(err) {
    const description =
        err?.error?.description ||
        err?.error?.reason ||
        err?.message ||
        (err?.statusCode ? `Razorpay error (${err.statusCode})` : 'Could not reach Razorpay')
    const mapped = new Error(description)
    const code = Number(err?.statusCode || err?.status) || 502
    mapped.status = code === 401 || code === 400 ? code : 502
    mapped.error = err?.error
    return mapped
}

async function sdkCall(fn) {
    try {
        return await fn()
    } catch (err) {
        throw mapSdkError(err)
    }
}

export function isRazorpayConfigured() {
    const keyId = cleanEnv(process.env.RAZORPAY_KEY_ID)
    const keySecret = cleanEnv(process.env.RAZORPAY_KEY_SECRET)
    if (!keyId || !keySecret) return false
    return !isPlaceholderKey(keyId, keySecret)
}

/** Key ID used to create the Razorpay order — must be the same key Checkout opens with. */
export function getPublicKeyId() {
    return cleanEnv(process.env.RAZORPAY_KEY_ID) || cleanEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID)
}

export function razorpayErrorMessage(err, fallback = 'Could not start payment') {
    return (
        err?.error?.description ||
        err?.error?.reason ||
        (typeof err?.error === 'string' ? err.error : null) ||
        err?.message ||
        fallback
    )
}

/** @param {{ amountPaise: number, receipt: string, notes?: Record<string, string> }} opts */
export async function createRazorpayOrder(opts) {
    const { amountPaise, receipt, notes = {} } = opts
    if (!Number.isInteger(amountPaise) || amountPaise < 100) {
        throw new Error('Invalid payment amount')
    }
    const safeNotes = Object.fromEntries(
        Object.entries(notes)
            .filter(([, value]) => value != null && String(value).trim())
            .map(([key, value]) => [key, String(value).slice(0, 256)]),
    )
    return sdkCall(() =>
        getRazorpay().orders.create({
            amount: amountPaise,
            currency: 'INR',
            receipt: String(receipt).slice(0, 40),
            partial_payment: false,
            ...(Object.keys(safeNotes).length ? { notes: safeNotes } : {}),
        }),
    )
}

export async function fetchRazorpayPayment(paymentId) {
    return sdkCall(() => getRazorpay().payments.fetch(paymentId))
}

export async function fetchRazorpayOrder(orderId) {
    return sdkCall(() => getRazorpay().orders.fetch(orderId))
}

/** Official Checkout signature check: HMAC SHA256 of `order_id|payment_id`. */
export function verifyCheckoutSignature(razorpayOrderId, razorpayPaymentId, signature) {
    const { keySecret } = getKeys()
    try {
        return Boolean(
            validatePaymentVerification(
                { order_id: razorpayOrderId, payment_id: razorpayPaymentId },
                signature,
                keySecret,
            ),
        )
    } catch {
        return false
    }
}

/** Official webhook check: HMAC SHA256 of the raw request body. */
export function verifyWebhookSignature(rawBody, signature) {
    const secret = cleanEnv(process.env.RAZORPAY_WEBHOOK_SECRET)
    if (!secret || !signature || rawBody == null) return false
    try {
        return Boolean(validateWebhookSignature(String(rawBody), signature, secret))
    } catch {
        return false
    }
}
