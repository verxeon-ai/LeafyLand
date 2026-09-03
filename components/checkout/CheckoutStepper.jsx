'use client'

import { Check } from 'lucide-react'
import { BRAND_GREEN, BRAND_GREEN_LIGHT, BRAND_MINT_BORDER } from '@/lib/brand-ui'

export const CHECKOUT_STEPS = [
    { id: 1, label: 'Customer', hint: 'Your details' },
    { id: 2, label: 'Delivery', hint: 'Where to send it' },
    { id: 3, label: 'Order', hint: 'Review items' },
    { id: 4, label: 'Payment', hint: 'How you pay' },
    { id: 5, label: 'Confirm', hint: 'Place order' },
]

export default function CheckoutStepper({ step, onStepSelect }) {
    const current = CHECKOUT_STEPS.find((s) => s.id === step) || CHECKOUT_STEPS[0]

    return (
        <div className="mb-5 min-w-0">
            <p className="mb-2 text-xs font-medium text-slate-500 sm:hidden">
                Step {step} of {CHECKOUT_STEPS.length} — {current.label}
            </p>

            <ol className="flex w-full items-center sm:hidden" aria-label="Checkout progress">
                {CHECKOUT_STEPS.map((s, index) => {
                    const done = s.id < step
                    const active = s.id === step
                    const clickable = s.id < step
                    return (
                        <li key={s.id} className="flex min-w-0 flex-1 items-center last:flex-none">
                            <button
                                type="button"
                                disabled={!clickable}
                                onClick={() => clickable && onStepSelect?.(s.id)}
                                aria-current={active ? 'step' : undefined}
                                aria-label={s.label}
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                                style={
                                    active || done
                                        ? { backgroundColor: BRAND_GREEN, color: '#fff' }
                                        : { backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN, border: `1px solid ${BRAND_MINT_BORDER}` }
                                }
                            >
                                {done ? <Check size={13} strokeWidth={2.5} /> : s.id}
                            </button>
                            {index < CHECKOUT_STEPS.length - 1 && (
                                <span
                                    className="mx-1 h-px min-w-2 flex-1"
                                    style={{ backgroundColor: done ? BRAND_GREEN : BRAND_MINT_BORDER }}
                                />
                            )}
                        </li>
                    )
                })}
            </ol>

            <ol className="hidden items-center gap-1 sm:flex md:gap-2">
                {CHECKOUT_STEPS.map((s, index) => {
                    const done = s.id < step
                    const active = s.id === step
                    const clickable = s.id < step
                    return (
                        <li key={s.id} className="flex min-w-0 flex-1 items-center">
                            <button
                                type="button"
                                disabled={!clickable}
                                onClick={() => clickable && onStepSelect?.(s.id)}
                                className={`flex w-full min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors md:px-3 ${
                                    clickable ? 'cursor-pointer hover:bg-[#f4f8f5]' : 'cursor-default'
                                }`}
                            >
                                <span
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                    style={
                                        active || done
                                            ? { backgroundColor: BRAND_GREEN, color: '#fff' }
                                            : { backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN, border: `1px solid ${BRAND_MINT_BORDER}` }
                                    }
                                >
                                    {done ? <Check size={14} strokeWidth={2.5} /> : s.id}
                                </span>
                                <span className="min-w-0">
                                    <span className={`block truncate text-xs font-semibold ${active ? 'text-slate-800' : 'text-slate-500'}`}>
                                        {s.label}
                                    </span>
                                    <span className="hidden truncate text-[11px] text-slate-400 lg:block">{s.hint}</span>
                                </span>
                            </button>
                            {index < CHECKOUT_STEPS.length - 1 && (
                                <span
                                    className="mx-0.5 hidden h-px w-3 shrink-0 md:block md:w-5"
                                    style={{ backgroundColor: done ? BRAND_GREEN : BRAND_MINT_BORDER }}
                                />
                            )}
                        </li>
                    )
                })}
            </ol>
        </div>
    )
}
