'use client'

import { brandCardClass, brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

export function AdminTableSkeleton({ rows = 6 }) {
  return (
    <div className={`${brandCardClass} overflow-hidden`}>
      <div className="h-12 border-b border-slate-100 bg-[#f4f8f5] animate-pulse" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-14 border-b border-slate-50 last:border-0 px-4 flex items-center">
          <div className="h-4 w-full max-w-md bg-slate-100 rounded-xl animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export function AdminStatSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`${brandCardClass} h-24 animate-pulse`} />
      ))}
    </div>
  )
}

export function AdminError({ message, onRetry }) {
  return (
    <div className={`${brandCardClass} px-6 py-12 text-center`}>
      <p className="text-sm font-medium text-red-600">{message || 'Something went wrong'}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`${brandPrimaryCtaClass} mt-4`}
          style={{ backgroundColor: BRAND_GREEN }}
        >
          Try again
        </button>
      )}
    </div>
  )
}
