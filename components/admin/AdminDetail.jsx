'use client'

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
