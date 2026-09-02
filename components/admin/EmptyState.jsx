'use client'

import { brandCardClass } from '@/lib/brand-ui'

export default function EmptyState({ icon: Icon, title, description, embedded = false }) {
  return (
    <div className={embedded ? 'px-6 py-12 text-center' : `${brandCardClass} border-dashed px-6 py-16 text-center`}>
      {Icon && <Icon className="mx-auto mb-3 h-10 w-10 text-slate-300" />}
      <p className="text-sm font-medium text-slate-700 sm:text-base">{title}</p>
      {description && (
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">{description}</p>
      )}
    </div>
  )
}
