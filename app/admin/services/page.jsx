'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import FilterChips from '@/components/admin/FilterChips'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import toast from 'react-hot-toast'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'
import {
  brandLinkClass,
  brandPrimaryCtaClass,
  brandDangerCtaClass,
  BRAND_GREEN,
} from '@/lib/brand-ui'
import { DetailFields, DetailNote, DetailSection, displayValue, formatAdminMoney } from '@/components/admin/AdminDetail'

export default function ServicesPage() {
  const { data: services, setData: setServices, loading, error, reload: load } = useCachedJson('/api/admin/services', 'list')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedService, setSelectedService] = useState(null)

  const updateStatus = async (id, status) => {
    const res = await fetch('/api/admin/services', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!res.ok) return toast.error(`${status === 'approved' ? 'Approve' : 'Reject'} failed`)
    toast.success(status === 'approved' ? 'Service approved' : 'Service rejected')
    setServices((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, status } : s))
      setCachedJson('/api/admin/services', next)
      return next
    })
    setSelectedService((prev) => (prev?.id === id ? { ...prev, status } : prev))
  }

  const categories = useMemo(() => {
    const set = new Set(services.map((s) => s.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [services])

  const filteredData = useMemo(() => {
    if (categoryFilter === 'All') return services
    return services.filter((s) => s.category === categoryFilter)
  }, [categoryFilter, services])

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (val) => <span className="font-semibold">{val || 'N/A'}</span>,
    },
    {
      key: 'store',
      label: 'Store',
      render: (_val, row) => row.store?.name || 'N/A',
    },
    { key: 'category', label: 'Category' },
    {
      key: 'startingPrice',
      label: 'Starting Price',
      render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'duration',
      label: 'Duration',
      render: (val) => (val ? `${val} hrs` : 'N/A'),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val || 'pending'} />,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_val, row) => (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedService(row)}
            className={brandLinkClass}
            style={{ color: BRAND_GREEN }}
          >
            View
          </button>
          {(row.status || 'pending') === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => updateStatus(row.id, 'approved')}
                className={brandLinkClass}
                style={{ color: BRAND_GREEN }}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => updateStatus(row.id, 'rejected')}
                className="text-sm font-semibold text-red-600 transition-colors hover:opacity-80"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Services" description="Manage all service listings" />

      <FilterChips
        options={categories}
        value={categoryFilter}
        onChange={setCategoryFilter}
        getLabel={(cat) => (cat === 'All' ? 'All Categories' : cat)}
      />

      {loading && services.length === 0 ? (
        <AdminTableSkeleton />
      ) : error && services.length === 0 ? (
        <AdminError message={error} onRetry={load} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          searchKeys={['name', 'category', 'store.name']}
          emptyMessage="No services found"
        />
      )}

      <DetailSlideOver
        isOpen={!!selectedService}
        onClose={() => setSelectedService(null)}
        eyebrow="Service"
        title={selectedService?.name || 'Service details'}
        subtitle={selectedService?.store?.name}
        footer={(selectedService?.status || 'pending') === 'pending' ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateStatus(selectedService.id, 'approved')}
              className={brandPrimaryCtaClass}
              style={{ backgroundColor: BRAND_GREEN }}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => updateStatus(selectedService.id, 'rejected')}
              className={brandDangerCtaClass}
            >
              Reject
            </button>
          </div>
        ) : null}
      >
        {selectedService && (
          <>
            <div>
              <StatusBadge status={selectedService.status || 'pending'} />
            </div>

            <DetailSection title="About">
              <DetailNote>{displayValue(selectedService.description)}</DetailNote>
            </DetailSection>

            <DetailSection title="Details">
              <DetailFields
                items={[
                  { label: 'Category', value: selectedService.category },
                  { label: 'Price', value: formatAdminMoney(selectedService.startingPrice) },
                  { label: 'Duration', value: selectedService.duration ? `${selectedService.duration} hrs` : '—' },
                  { label: 'Location', value: selectedService.location },
                  { label: 'Store', value: selectedService.store?.name },
                ]}
              />
            </DetailSection>
          </>
        )}
      </DetailSlideOver>
    </div>
  )
}
