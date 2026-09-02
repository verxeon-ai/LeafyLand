'use client'

import { BRAND_GREEN, brandLabelClass } from '@/lib/brand-ui'

export default function PageHeader({ title, description, action, eyebrow = 'Admin' }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>{eyebrow}</p>
        <h1 className="mt-1 text-xl font-bold text-slate-800 sm:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
