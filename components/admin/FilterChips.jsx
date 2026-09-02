'use client'

import { brandChipActiveClass, brandChipIdleClass } from '@/lib/brand-ui'

export default function FilterChips({ options, value, onChange, getLabel }) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      {options.map((opt) => {
        const active = value === opt
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={active ? brandChipActiveClass : brandChipIdleClass}
          >
            {getLabel ? getLabel(opt) : opt}
          </button>
        )
      })}
    </div>
  )
}
