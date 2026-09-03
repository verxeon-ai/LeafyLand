'use client'

import { Check, X } from 'lucide-react'
import { ORDER_TIMELINE, formatOrderStatus } from '@/lib/order-ui'
import { BRAND_GREEN, BRAND_GREEN_LIGHT, BRAND_MINT_BORDER } from '@/lib/brand-ui'

export default function OrderTimeline({ status }) {
    const cancelled = status === 'CANCELLED'
    const currentIndex = ORDER_TIMELINE.indexOf(status)

    if (cancelled) {
        return (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                <div className="flex items-center gap-2 font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
                        <X size={14} />
                    </span>
                    This order was cancelled
                </div>
                <p className="mt-1 text-xs text-red-600">It will no longer move through processing or delivery.</p>
            </div>
        )
    }

    return (
        <ol className="grid gap-3 sm:grid-cols-4">
            {ORDER_TIMELINE.map((step, index) => {
                const done = currentIndex > index
                const active = currentIndex === index
                return (
                    <li key={step} className="flex items-start gap-2">
                        <span
                            className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                            style={
                                done || active
                                    ? { backgroundColor: BRAND_GREEN, color: '#fff' }
                                    : { backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN, border: `1px solid ${BRAND_MINT_BORDER}` }
                            }
                        >
                            {done ? <Check size={14} strokeWidth={2.5} /> : index + 1}
                        </span>
                        <div className="min-w-0">
                            <p className={`text-sm font-semibold ${active || done ? 'text-slate-800' : 'text-slate-400'}`}>
                                {formatOrderStatus(step)}
                            </p>
                            {active && <p className="text-[11px] font-medium" style={{ color: BRAND_GREEN }}>Current</p>}
                        </div>
                    </li>
                )
            })}
        </ol>
    )
}
