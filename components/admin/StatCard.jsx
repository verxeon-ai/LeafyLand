'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { brandCardClass, BRAND_GREEN, BRAND_GREEN_LIGHT } from '@/lib/brand-ui'

export default function StatCard({ icon: Icon, label, value, change, color }) {
  const isPositive = change >= 0

  return (
    <div className={`${brandCardClass} flex items-center gap-4 p-5`}>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color || ''}`}
        style={color ? undefined : { backgroundColor: BRAND_GREEN_LIGHT }}
      >
        <Icon className="h-6 w-6" style={{ color: BRAND_GREEN }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 truncate text-xl font-bold text-slate-800">{value}</p>
        {change !== undefined && (
          <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${isPositive ? '' : 'text-red-500'}`}
            style={isPositive ? { color: BRAND_GREEN } : undefined}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{isPositive ? '+' : ''}{change}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
