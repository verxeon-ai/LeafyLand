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

const STATUS_OPTIONS = ['All', 'pending', 'approved', 'rejected']

const TYPE_COLORS = {
  Farmhouse: 'bg-[#eef4ef] text-[#2f7d4a]',
  Farmland: 'bg-amber-100 text-amber-700',
  Cottage: 'bg-amber-100 text-amber-700',
  'Nursery Land': 'bg-slate-100 text-slate-600',
  'Agricultural Land': 'bg-amber-100 text-amber-700',
}

export default function PropertiesPage() {
  const { data: properties, setData: setProperties, loading, error, reload: load } = useCachedJson('/api/admin/properties', 'list')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedProperty, setSelectedProperty] = useState(null)

  const updateStatus = async (id, status) => {
    const res = await fetch('/api/admin/properties', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!res.ok) return toast.error(`${status === 'approved' ? 'Approve' : 'Reject'} failed`)
    toast.success(status === 'approved' ? 'Property approved' : 'Property rejected')
    setProperties((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, status } : p))
      setCachedJson('/api/admin/properties', next)
      return next
    })
    setSelectedProperty((prev) => (prev?.id === id ? { ...prev, status } : prev))
  }

  const filteredData = useMemo(() => {
    if (statusFilter === 'All') return properties
    return properties.filter((p) => (p.status || 'pending') === statusFilter)
  }, [statusFilter, properties])

  const columns = [
    {
      key: 'title',
      label: 'Title',
      render: (val) => <span className="font-semibold">{val || 'N/A'}</span>,
    },
    {
      key: 'store',
      label: 'Store',
      render: (_val, row) => row.store?.name || 'N/A',
    },
    {
      key: 'propertyType',
      label: 'Type',
      render: (val) => {
        const color = TYPE_COLORS[val] || 'bg-slate-100 text-slate-600'
        return <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-semibold ${color}`}>{val || 'N/A'}</span>
      },
    },
    {
      key: 'listingType',
      label: 'Listing',
      render: (val) => (
        <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-semibold ${val === 'SALE' ? 'bg-[#eef4ef] text-[#2f7d4a]' : 'bg-amber-100 text-amber-700'}`}>
          {val || 'N/A'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`,
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
            onClick={() => setSelectedProperty(row)}
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
      <PageHeader title="Properties" description="Manage all property listings" />

      <FilterChips
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        getLabel={(s) => (s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1))}
      />

      {loading && properties.length === 0 ? (
        <AdminTableSkeleton />
      ) : error && properties.length === 0 ? (
        <AdminError message={error} onRetry={load} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          searchKeys={['title', 'propertyType', 'location']}
          emptyMessage="No properties found"
        />
      )}

      <DetailSlideOver
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        eyebrow="Property"
        title={selectedProperty?.title || 'Property details'}
        subtitle={selectedProperty?.store?.name}
        footer={(selectedProperty?.status || 'pending') === 'pending' ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => updateStatus(selectedProperty.id, 'approved')}
              className={brandPrimaryCtaClass}
              style={{ backgroundColor: BRAND_GREEN }}
            >
              Approve
            </button>
            <button
              type="button"
              onClick={() => updateStatus(selectedProperty.id, 'rejected')}
              className={brandDangerCtaClass}
            >
              Reject
            </button>
          </div>
        ) : null}
      >
        {selectedProperty && (
          <>
            <img
              src={selectedProperty.images?.[0] || 'https://via.placeholder.com/400'}
              alt=""
              className="h-48 w-full rounded-xl object-cover"
            />

            <div>
              <StatusBadge status={selectedProperty.status || 'pending'} />
            </div>

            <DetailSection title="About">
              <DetailNote>{displayValue(selectedProperty.description)}</DetailNote>
            </DetailSection>

            <DetailSection title="Details">
              <DetailFields
                items={[
                  { label: 'Type', value: selectedProperty.propertyType },
                  { label: 'Listing', value: selectedProperty.listingType },
                  { label: 'Price', value: formatAdminMoney(selectedProperty.price) },
                  { label: 'Location', value: selectedProperty.location },
                  { label: 'Land size', value: selectedProperty.landSize },
                  { label: 'Covered', value: selectedProperty.coveredArea },
                  { label: 'Bedrooms', value: selectedProperty.bedrooms },
                  { label: 'Bathrooms', value: selectedProperty.bathrooms },
                  { label: 'Features', value: (selectedProperty.features || []).join(', ') },
                ]}
              />
            </DetailSection>
          </>
        )}
      </DetailSlideOver>
    </div>
  )
}
