export const ORDER_STATUSES = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

/** Statuses that appear on the customer tracking timeline (backend order only). */
export const ORDER_TIMELINE = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export const ORDER_STATUS_LABELS = {
    ORDER_PLACED: 'Order placed',
    PROCESSING: 'Processing',
    SHIPPED: 'Shipped',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
}

export const ORDER_FILTERS = ['All', ...ORDER_STATUSES]

export function formatOrderStatus(status) {
    return ORDER_STATUS_LABELS[status] || String(status || '').replace(/_/g, ' ')
}

export function formatOrderRef(id) {
    if (!id) return ''
    return String(id).slice(-8).toUpperCase()
}

export function formatMoney(value, currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹') {
    const n = Number(value || 0)
    return `${currency}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
}

export function paymentMethodLabel(method) {
    const key = String(method || '').toUpperCase()
    if (key === 'RAZORPAY') return 'Pay online (Razorpay)'
    if (key === 'COD') return 'Cash on Delivery'
    if (key === 'UPI') return 'UPI'
    if (key === 'CARD') return 'Card'
    if (key === 'WALLET') return 'Wallet'
    if (key === 'STRIPE') return 'Stripe'
    if (key === 'BANK_TRANSFER') return 'Bank transfer'
    return key ? key.replace(/_/g, ' ').toLowerCase() : 'Payment'
}

export function paymentStatusLabel(status) {
    const key = String(status || '').toUpperCase()
    if (key === 'CAPTURED') return 'Paid'
    if (key === 'PENDING') return 'Pending'
    if (key === 'AUTHORIZED') return 'Authorized'
    if (key === 'FAILED') return 'Failed'
    if (key === 'REFUNDED') return 'Refunded'
    return formatOrderStatus(status)
}

export function formatAddressLines(addr) {
    if (!addr) return []
    return [
        addr.name,
        addr.street,
        [addr.city, addr.state, addr.zip].filter(Boolean).join(', '),
        addr.country,
        addr.phone,
    ].filter(Boolean)
}
