'use client'

import { useState } from 'react'
import CatalogImage from '@/components/CatalogImage'
import { brandLabelClass, BRAND_GREEN } from '@/lib/brand-ui'

export function displayValue(value) {
    if (value === 0 || value === false) return String(value)
    if (value == null || value === '') return '—'
    return value
}

export function formatAdminDate(value) {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export function formatAdminMoney(value) {
    return `₹${Number(value || 0).toLocaleString('en-IN')}`
}

export function DetailGallery({ images = [], alt = '' }) {
    const list = (Array.isArray(images) ? images : [images]).filter(Boolean)
    const [active, setActive] = useState(0)

    if (!list.length) {
        return (
            <div className="flex h-56 items-center justify-center rounded-xl bg-[#f4f8f5] text-sm text-slate-400">
                No photo
            </div>
        )
    }

    const src = list[Math.min(active, list.length - 1)]

    return (
        <div className="space-y-3">
            <div className="flex min-h-[260px] items-center justify-center overflow-hidden rounded-xl bg-[#f4f8f5] px-4 py-5">
                <CatalogImage
                    src={src}
                    alt={alt}
                    width={800}
                    height={600}
                    className="max-h-[360px] w-full object-contain"
                />
            </div>
            {list.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {list.map((image, index) => (
                        <button
                            key={`${image}-${index}`}
                            type="button"
                            onClick={() => setActive(index)}
                            className={`h-14 w-14 shrink-0 overflow-hidden rounded-xl border ${
                                index === active ? 'border-[#2f7d4a]' : 'border-[#e4eee6]'
                            }`}
                            aria-label={`Photo ${index + 1}`}
                        >
                            <CatalogImage
                                src={image}
                                alt=""
                                width={56}
                                height={56}
                                className="h-full w-full object-cover"
                            />
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

export function DetailSection({ title, children }) {
    return (
        <section className="space-y-2.5">
            {title && (
                <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>
                    {title}
                </p>
            )}
            {children}
        </section>
    )
}

export function DetailNote({ children }) {
    return (
        <div className="rounded-xl bg-[#f4f8f5] px-4 py-3 text-sm leading-relaxed text-slate-600">
            {children || '—'}
        </div>
    )
}

export function DetailFields({ items }) {
    const rows = items.filter(Boolean)
    return (
        <dl className="overflow-hidden rounded-xl border border-[#e4eee6] bg-white">
            {rows.map((item, index) => (
                <div
                    key={item.label}
                    className={`grid grid-cols-[7.5rem_1fr] gap-3 px-4 py-3 sm:grid-cols-[8.5rem_1fr] ${
                        index < rows.length - 1 ? 'border-b border-[#e4eee6]' : ''
                    }`}
                >
                    <dt className="text-xs font-medium text-slate-500">{item.label}</dt>
                    <dd className="break-words text-sm font-medium text-slate-800">
                        {item.value == null || item.value === '' ? '—' : item.value}
                    </dd>
                </div>
            ))}
        </dl>
    )
}
