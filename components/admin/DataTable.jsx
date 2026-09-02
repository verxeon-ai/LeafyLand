'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search } from 'lucide-react'
import SearchBar from './SearchBar'
import EmptyState from './EmptyState'
import { brandCardClass, brandSecondaryCtaClass } from '@/lib/brand-ui'

export default function DataTable({ columns, data, searchKeys = [], emptyMessage = 'No results found' }) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 10

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((row) =>
      searchKeys.some((key) => {
        const val = key.split('.').reduce((acc, part) => acc?.[part], row)
        return val !== undefined && val !== null && String(val).toLowerCase().includes(q)
      })
    )
  }, [data, search, searchKeys])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const safePage = Math.min(page, totalPages)
  const startIdx = (safePage - 1) * perPage
  const paginated = filtered.slice(startIdx, startIdx + perPage)

  const handleSearch = (val) => {
    setSearch(val)
    setPage(1)
  }

  useEffect(() => {
    const onAdminSearch = (event) => {
      if (typeof event.detail === 'string') handleSearch(event.detail)
    }
    window.addEventListener('leafyland-admin-search', onAdminSearch)
    return () => window.removeEventListener('leafyland-admin-search', onAdminSearch)
  }, [])

  return (
    <div className="space-y-4">
      <SearchBar value={search} onChange={handleSearch} placeholder="Search..." />

      <div className={`${brandCardClass} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-xs sm:text-sm">
            <thead>
              <tr className="bg-[#f4f8f5]">
                {columns.map((col, colIdx) => (
                  <th
                    key={col.key ?? `col-${colIdx}`}
                    className="whitespace-nowrap px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:px-4"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={columns.length}>
                    <EmptyState embedded icon={Search} title={emptyMessage} description="Try adjusting your search terms" />
                  </td>
                </tr>
              ) : (
                paginated.map((row, idx) => (
                  <tr key={row.id ?? idx} className="transition-colors hover:bg-[#f4f8f5]/60">
                    {columns.map((col, colIdx) => (
                      <td key={col.key ?? `col-${colIdx}`} className="whitespace-nowrap px-3 py-3 sm:px-4">
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e4eee6] bg-[#f4f8f5] px-4 py-3">
            <p className="whitespace-nowrap text-sm text-slate-500">
              Showing {startIdx + 1}–{Math.min(startIdx + perPage, filtered.length)} of {filtered.length}
            </p>
            {totalPages > 1 && (
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className={`${brandSecondaryCtaClass} min-w-[5.5rem] disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Previous
                </button>
                <span className="min-w-[4.5rem] whitespace-nowrap text-center text-xs font-semibold text-slate-600">
                  {safePage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className={`${brandSecondaryCtaClass} min-w-[5.5rem] disabled:cursor-not-allowed disabled:opacity-40`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
