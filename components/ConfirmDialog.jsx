'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
    BRAND_GREEN,
    BRAND_MINT,
    brandLabelClass,
    brandPrimaryCtaClass,
    brandSecondaryCtaClass,
    brandDangerCtaClass,
    brandInputClass,
} from '@/lib/brand-ui'

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    eyebrow = 'Please confirm',
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    danger = false,
    input,
}) {
    const [busy, setBusy] = useState(false)
    const [value, setValue] = useState(input?.defaultValue ?? '')

    useEffect(() => {
        if (!open) {
            setBusy(false)
            setValue(input?.defaultValue ?? '')
            return undefined
        }
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const onKey = (event) => {
            if (event.key === 'Escape' && !busy) onClose()
        }
        window.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = prev
            window.removeEventListener('keydown', onKey)
        }
    }, [open, onClose, busy, input?.defaultValue])

    if (!open || typeof document === 'undefined') return null

    const close = () => {
        if (!busy) onClose()
    }

    const confirm = async () => {
        if (busy) return
        setBusy(true)
        try {
            await onConfirm(input ? value : undefined)
            onClose()
        } catch {
            setBusy(false)
        }
    }

    return createPortal(
        <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            onClick={(event) => {
                if (event.target === event.currentTarget) close()
            }}
        >
            <div className="pointer-events-none absolute inset-0 bg-[#1f2937]/25" aria-hidden />
            <div
                className="relative z-10 w-full max-w-[400px] overflow-hidden rounded-xl border border-[#e4eee6] bg-white shadow-[0_20px_50px_rgba(47,125,74,0.18)]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                onClick={(event) => event.stopPropagation()}
            >
                <div className="border-b border-[#e4eee6] px-6 pb-4 pt-5" style={{ backgroundColor: BRAND_MINT }}>
                    <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>{eyebrow}</p>
                    <h2 id="confirm-dialog-title" className="mt-1 text-lg font-bold text-slate-800">
                        {title}
                    </h2>
                </div>
                <div className="px-6 py-5">
                    {description && (
                        <p className="text-sm leading-relaxed text-slate-500">{description}</p>
                    )}
                    {input && (
                        <input
                            autoFocus
                            type={input.type || 'text'}
                            min={input.min}
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder={input.placeholder}
                            className={`${brandInputClass} mt-4`}
                        />
                    )}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={close}
                            disabled={busy}
                            className={`${brandSecondaryCtaClass} py-2.5 disabled:opacity-50`}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={confirm}
                            disabled={busy}
                            className={`${danger ? brandDangerCtaClass : brandPrimaryCtaClass} py-2.5 disabled:opacity-50`}
                            style={danger ? undefined : { backgroundColor: BRAND_GREEN }}
                        >
                            {busy ? 'Working…' : confirmLabel}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body,
    )
}
