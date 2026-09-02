'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { assets } from '@/assets/assets'
import {
    BRAND_GREEN,
    BRAND_MINT,
    brandLabelClass,
    brandPrimaryCtaClass,
    brandSecondaryCtaClass,
} from '@/lib/brand-ui'

export default function ConfirmLogoutModal({ open, onClose }) {
    useEffect(() => {
        if (!open) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKey = (e) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = prev
            window.removeEventListener('keydown', onKey)
        }
    }, [open, onClose])

    if (!open || typeof document === 'undefined') return null

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1f2937]/25 backdrop-blur-[6px]"
            onClick={onClose}
        >
            <div
                className="w-full max-w-[400px] overflow-hidden rounded-xl border border-[#e4eee6] bg-white shadow-[0_20px_50px_rgba(47,125,74,0.18)]"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="logout-modal-title"
            >
                <div
                    className="border-b border-[#e4eee6] px-6 pb-5 pt-6 text-center"
                    style={{ backgroundColor: BRAND_MINT }}
                >
                    <Image
                        src={assets.logo}
                        alt="LeafyLand"
                        width={140}
                        height={36}
                        className="mx-auto h-8 w-auto object-contain"
                    />
                </div>

                <div className="px-6 pb-6 pt-5 text-center">
                    <p className={`${brandLabelClass} mb-2`} style={{ color: BRAND_GREEN }}>
                        Account
                    </p>
                    <h2
                        id="logout-modal-title"
                        className="text-[22px] font-bold leading-snug text-slate-800"
                    >
                        Sign out of LeafyLand?
                    </h2>
                    <p className="mx-auto mt-2 max-w-[280px] text-sm leading-relaxed text-slate-500">
                        You&apos;ll need to sign in again to get back to your dashboard.
                    </p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className={`${brandSecondaryCtaClass} py-2.5`}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className={`${brandPrimaryCtaClass} py-2.5`}
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            <LogOut size={15} />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    )
}
