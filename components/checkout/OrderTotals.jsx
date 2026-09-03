'use client'

import { formatMoney } from '@/lib/order-ui'
import { BRAND_GREEN, BRAND_TEXT } from '@/lib/brand-ui'

export default function OrderTotals({
    subtotal,
    discount = 0,
    couponCode,
    shippingLabel = 'Free',
    compact = false,
}) {
    const total = Math.max(0, Number(subtotal || 0) - Number(discount || 0))

    return (
        <div className={`w-full min-w-0 ${compact ? 'space-y-2 text-sm' : 'space-y-2.5 text-sm'}`}>
            <div className="flex items-start justify-between gap-3 text-slate-600">
                <span className="min-w-0">Subtotal</span>
                <span className="shrink-0 tabular-nums">{formatMoney(subtotal)}</span>
            </div>
            <div className="flex items-start justify-between gap-3 text-slate-600">
                <span className="min-w-0">Delivery</span>
                <span className="shrink-0 font-medium" style={{ color: BRAND_GREEN }}>{shippingLabel}</span>
            </div>
            {Number(discount) > 0 && (
                <div className="flex items-start justify-between gap-3 text-slate-600">
                    <span className="min-w-0 break-words">Discount{couponCode ? ` (${couponCode})` : ''}</span>
                    <span className="shrink-0 tabular-nums" style={{ color: BRAND_GREEN }}>-{formatMoney(discount)}</span>
                </div>
            )}
            <div
                className="flex items-start justify-between gap-3 border-t border-slate-100 pt-3 text-base font-bold"
                style={{ color: BRAND_TEXT }}
            >
                <span className="min-w-0">Grand total</span>
                <span className="shrink-0 tabular-nums" style={{ color: BRAND_GREEN }}>{formatMoney(total)}</span>
            </div>
        </div>
    )
}
