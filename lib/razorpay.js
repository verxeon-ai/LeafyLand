import 'server-only'
import crypto from 'node:crypto'
import https from 'node:https'

const API_HOST = 'api.razorpay.com'
const API_BASE = `https://${API_HOST}/v1`

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

export function isRazorpayConfigured() {
    const keyId = cleanEnv(process.env.RAZORPAY_KEY_ID)
    const keySecret = cleanEnv(process.env.RAZORPAY_KEY_SECRET)
    if (!keyId || !keySecret) return false
    return !isPlaceholderKey(keyId, keySecret)
}

export function getPublicKeyId() {
    return cleanEnv(process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) || cleanEnv(process.env.RAZORPAY_KEY_ID)
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

function parseBody(raw) {
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch {
        return null
    }
}

/**
 * Talk to Razorpay with curl-equivalent headers.
 * Node fetch/undici adds Accept-Encoding: zstd, which some Razorpay edges reject with HTTP 406.
 */
function razorpayRequest(method, path, payload) {
    const { keyId, keySecret } = getKeys()
    const body = payload === undefined ? '' : JSON.stringify(payload)
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')

    return new Promise((resolve, reject) => {
        const req = https.request(
            {
                hostname: API_HOST,
                path: `/v1${path}`,
                method,
                headers: {
                    Authorization: `Basic ${auth}`,
                    Accept: '*/*',
                    'Accept-Encoding': 'identity',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                    Host: API_HOST,
                    'User-Agent': 'Razorpay/v1 Node.js',
                },
            },
            (res) => {
                const chunks = []
                res.on('data', (chunk) => chunks.push(chunk))
                res.on('end', () => {
                    const raw = Buffer.concat(chunks).toString('utf8')
                    const parsed = parseBody(raw)
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        const description =
                            parsed?.error?.description ||
                            parsed?.error?.reason ||
                            (res.statusCode === 401
                                ? 'Razorpay authentication failed. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.'
                                : res.statusCode === 406
                                    ? 'Razorpay rejected the request. Confirm the full Key ID and Key Secret from the Razorpay dashboard, and that NEXT_PUBLIC_RAZORPAY_KEY_ID matches the Key ID.'
                                    : `Razorpay request failed (${res.statusCode})`)
                        const err = new Error(description)
                        err.status = res.statusCode === 401 || res.statusCode === 400 ? res.statusCode : 502
                        err.detail = parsed || raw.slice(0, 240)
                        reject(err)
                        return
                    }
                    resolve(parsed)
                })
            },
        )
        req.on('error', (error) => {
            const err = new Error(error.message || 'Could not reach Razorpay')
            err.status = 502
            reject(err)
        })
        if (body) req.write(body)
        req.end()
    })
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
    return razorpayRequest('POST', '/orders', {
        amount: amountPaise,
        currency: 'INR',
        receipt: String(receipt).slice(0, 40),
        ...(Object.keys(safeNotes).length ? { notes: safeNotes } : {}),
    })
}

export async function fetchRazorpayPayment(paymentId) {
    return razorpayRequest('GET', `/payments/${encodeURIComponent(paymentId)}`)
}

export async function fetchRazorpayOrder(orderId) {
    return razorpayRequest('GET', `/orders/${encodeURIComponent(orderId)}`)
}

function timingSafeEqualHex(a, b) {
    if (typeof a !== 'string' || typeof b !== 'string') return false
    const bufA = Buffer.from(a, 'utf8')
    const bufB = Buffer.from(b, 'utf8')
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
}

/** Verify Razorpay Checkout payment signature (order_id|payment_id). */
export function verifyCheckoutSignature(razorpayOrderId, razorpayPaymentId, signature) {
    const { keySecret } = getKeys()
    const payload = `${razorpayOrderId}|${razorpayPaymentId}`
    const expected = crypto.createHmac('sha256', keySecret).update(payload).digest('hex')
    return timingSafeEqualHex(expected, signature)
}

/** Verify webhook using raw body and x-razorpay-signature header. */
export function verifyWebhookSignature(rawBody, signature) {
    const secret = cleanEnv(process.env.RAZORPAY_WEBHOOK_SECRET)
    if (!secret || !signature) return false
    const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
    return timingSafeEqualHex(expected, signature)
}

export { API_BASE }
