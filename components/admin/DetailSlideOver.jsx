'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { brandLabelClass, BRAND_GREEN, BRAND_TEXT } from '@/lib/brand-ui'

export default function DetailSlideOver({
    isOpen,
    onClose,
    title,
    eyebrow = 'Details',
    subtitle,
    footer,
    children,
}) {
    useEffect(() => {
        if (!isOpen) return undefined
        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKey = (event) => {
            if (event.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = previous
            window.removeEventListener('keydown', onKey)
        }
    }, [isOpen, onClose])

    if (!isOpen || typeof document === 'undefined') return null

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-[#1f2937]/25"
            onClick={onClose}
        >
            <div
                className="flex max-h-[min(88vh,760px)] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-[#e4eee6] bg-white shadow-[0_20px_50px_rgba(47,125,74,0.16)]"
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="admin-detail-title"
            >
                <div className="shrink-0 border-b border-[#e4eee6] bg-[#f4f8f5] px-5 py-4 sm:px-6">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>
                                {eyebrow}
                            </p>
                            <h2
                                id="admin-detail-title"
                                className="mt-1 truncate text-lg font-bold"
                                style={{ color: BRAND_TEXT }}
                            >
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-0.5 truncate text-sm text-slate-500">{subtitle}</p>
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white"
                            aria-label="Close details"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                    <div className="space-y-5">{children}</div>
                </div>
                {footer && (
                    <div className="shrink-0 border-t border-[#e4eee6] bg-[#f4f8f5] px-5 py-4 sm:px-6">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body,
    )
}
