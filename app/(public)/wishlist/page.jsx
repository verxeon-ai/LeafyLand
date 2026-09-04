'use client'

import WishlistSection from '@/components/WishlistSection'
import { brandLabelClass, BRAND_GREEN, BRAND_MINT, BRAND_MUTED, BRAND_TEXT } from '@/lib/brand-ui'

export default function WishlistPage() {
    return (
        <div className="flex-1" style={{ backgroundColor: BRAND_MINT }}>
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Saved</p>
                <h1 className="mt-1 text-xl sm:text-2xl font-bold" style={{ color: BRAND_TEXT }}>
                    Wishlist
                </h1>
                <p className="mt-1 text-sm mb-2" style={{ color: BRAND_MUTED }}>
                    Products, services, and properties you saved.
                </p>
                <WishlistSection />
            </div>
        </div>
    )
}
