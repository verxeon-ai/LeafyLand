'use client'

import { BRAND_GREEN, BRAND_MINT } from '@/lib/brand-ui'

const MESSAGES = [
    'Fast delivery',
    'Trusted vendors',
    'Secure payments',
    'Quality guarantee',
    'Easy returns',
    'Fresh & healthy plants',
    'Safe packaging',
    'Verified sellers',
    'Buyer protection',
    '24/7 support',
    'Authentic products',
]

function Track() {
    return (
        <div className="flex shrink-0 items-center gap-8 pr-8">
            {MESSAGES.map((text) => (
                <span key={text} className="inline-flex shrink-0 items-center gap-8">
                    <span className="text-sm font-semibold whitespace-nowrap" style={{ color: BRAND_GREEN }}>
                        {text}
                    </span>
                    <span
                        className="inline-block size-1.5 shrink-0 rounded-full"
                        style={{ backgroundColor: BRAND_GREEN, opacity: 0.35 }}
                        aria-hidden
                    />
                </span>
            ))}
        </div>
    )
}

export default function ProductTrustMarquee() {
    return (
        <div
            className="mt-10 overflow-hidden rounded-xl select-none group"
            style={{ backgroundColor: BRAND_MINT }}
            aria-label="Shopping benefits"
        >
            <div className="overflow-hidden py-3.5">
                <div className="flex w-max animate-[marqueeScroll_28s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                    <Track />
                    <Track />
                </div>
            </div>
        </div>
    )
}
