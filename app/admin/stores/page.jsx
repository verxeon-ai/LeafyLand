'use client'

import { useState, useMemo } from 'react'
import { Eye } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import FilterChips from '@/components/admin/FilterChips'
import { AdminTableSkeleton } from '@/components/admin/AdminStates'
import { brandLinkClass, BRAND_GREEN, BRAND_GREEN_LIGHT, BRAND_TEXT } from '@/lib/brand-ui'
import { DetailFields, DetailNote, DetailSection, displayValue, formatAdminDate } from '@/components/admin/AdminDetail'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'

export default function AdminStores() {
  const { data: stores, setData: setStores, loading } = useCachedJson('/api/admin/stores', 'list')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStore, setSelectedStore] = useState(null)

  const filteredStores = useMemo(() => {
    if (statusFilter === 'all') return stores
    if (statusFilter === 'active') return stores.filter((s) => s.isActive)
    if (statusFilter === 'inactive') return stores.filter((s) => !s.isActive)
    return stores
  }, [stores, statusFilter])

  const toggleActive = async (id) => {
    const row = stores.find((s) => s.id === id)
    if (!row) return
    const nextActive = !row.isActive
    setStores((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, isActive: nextActive } : s))
      setCachedJson('/api/admin/stores', updated)
      return updated
    })
    await fetch(`/api/admin/stores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: nextActive }),
    })
  }

  const columns = [
    {
      key: 'name',
      label: 'Store Name',
      render: (val) => <span className="font-bold text-slate-800">{val}</span>,
    },
    {
      key: 'owner',
      label: 'Owner',
      render: (_, row) => row.user?.name ?? '—',
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      key: 'username',
      label: 'Username',
      render: (val) => val || '—',
    },
    {
      key: 'isActive',
      label: 'Active',
      render: (val, row) => (
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            className="peer sr-only"
            checked={val}
            onChange={() => toggleActive(row.id)}
          />
          <div className="h-5 w-9 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-[#2f7d4a]" />
          <span className="dot absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition-transform duration-200 ease-in-out peer-checked:translate-x-4" />
        </label>
      ),
    },
    {
      key: 'view',
      label: 'View',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setSelectedStore(row)}
          className={`${brandLinkClass} inline-flex items-center gap-1.5 text-xs`}
          style={{ color: BRAND_GREEN }}
        >
          <Eye className="h-4 w-4" />
          View
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Stores" description="Manage all registered stores" />

      <FilterChips
        options={['all', 'active', 'inactive']}
        value={statusFilter}
        onChange={setStatusFilter}
        getLabel={(v) => (v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1))}
      />

      {loading && stores.length === 0 ? (
        <AdminTableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={filteredStores}
          searchKeys={['name', 'owner']}
          emptyMessage="No stores found"
        />
      )}

      <DetailSlideOver
        isOpen={!!selectedStore}
        onClose={() => setSelectedStore(null)}
        eyebrow="Store"
        title={selectedStore?.name ?? 'Store details'}
        subtitle={selectedStore?.username ? `@${selectedStore.username}` : undefined}
      >
        {selectedStore && (
          <>
            <div className="flex items-start gap-4">
              {selectedStore.logo ? (
                <img
                  src={selectedStore.logo}
                  alt=""
                  className="h-16 w-16 rounded-xl border border-[#e4eee6] object-cover"
                />
              ) : (
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-lg font-bold"
                  style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                >
                  {(selectedStore.name || '?').charAt(0)}
                </div>
              )}
              <div className="min-w-0 pt-0.5">
                <p className="truncate text-base font-bold" style={{ color: BRAND_TEXT }}>
                  {selectedStore.name}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={selectedStore.status} />
                  <StatusBadge status={selectedStore.isActive ? 'active' : 'inactive'} />
                </div>
              </div>
            </div>

            <DetailSection title="About">
              <DetailNote>{displayValue(selectedStore.description)}</DetailNote>
            </DetailSection>

            <DetailSection title="Contact">
              <DetailFields
                items={[
                  { label: 'Email', value: selectedStore.email },
                  { label: 'Phone', value: selectedStore.contact },
                  { label: 'Address', value: selectedStore.address },
                ]}
              />
            </DetailSection>

            <DetailSection title="Owner">
              <DetailFields
                items={[
                  { label: 'Name', value: selectedStore.user?.name },
                  { label: 'Email', value: selectedStore.user?.email },
                  { label: 'Applied', value: formatAdminDate(selectedStore.createdAt) },
                ]}
              />
            </DetailSection>
          </>
        )}
      </DetailSlideOver>
    </div>
  )
}
