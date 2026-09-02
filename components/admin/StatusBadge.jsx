'use client'

const STATUS_STYLES = {
  approved: 'bg-[#eef4ef] text-[#2f7d4a]',
  active: 'bg-[#eef4ef] text-[#2f7d4a]',
  delivered: 'bg-[#eef4ef] text-[#2f7d4a]',
  completed: 'bg-[#eef4ef] text-[#2f7d4a]',
  pending: 'bg-amber-100 text-amber-700',
  processing: 'bg-amber-100 text-amber-700',
  order_placed: 'bg-slate-100 text-slate-600',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  shipped: 'bg-blue-100 text-blue-700',
  inactive: 'bg-slate-100 text-slate-600',
}

const DEFAULT_STYLE = 'bg-slate-100 text-slate-600'

function prettyStatus(status) {
  if (!status) return '—'
  return String(status)
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function StatusBadge({ status }) {
  const key = String(status || '').toLowerCase().replace(/\s+/g, '_')
  const style = STATUS_STYLES[key] || DEFAULT_STYLE

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-xl px-2.5 py-0.5 text-xs font-semibold ${style}`}>
      {prettyStatus(status)}
    </span>
  )
}
