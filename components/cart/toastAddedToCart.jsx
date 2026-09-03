'use client'

import toast from 'react-hot-toast'
import { Check } from 'lucide-react'
import { BRAND_GREEN, BRAND_MINT, BRAND_MINT_BORDER } from '@/lib/brand-ui'

export function toastAddedToCart({ name, alreadyInCart } = {}) {
    toast.custom(
        (t) => (
            <div
                className={`pointer-events-auto flex w-[min(calc(100vw-2rem),360px)] items-start gap-3 rounded-xl border bg-white p-3 shadow-sm transition-opacity ${
                    t.visible ? 'opacity-100' : 'opacity-0'
                }`}
                style={{ borderColor: BRAND_MINT_BORDER }}
            >
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: BRAND_MINT, color: BRAND_GREEN }}
                >
                    <Check size={16} strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">
                        {alreadyInCart ? 'Quantity updated' : 'Added to cart'}
                    </p>
                    {name ? <p className="truncate text-xs text-slate-500 mt-0.5">{name}</p> : null}
                    <a
                        href="/cart"
                        className="mt-1.5 inline-block text-xs font-semibold hover:opacity-80"
                        style={{ color: BRAND_GREEN }}
                    >
                        View cart
                    </a>
                </div>
            </div>
        ),
        { duration: 2800 },
    )
}
