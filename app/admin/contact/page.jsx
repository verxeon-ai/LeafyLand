'use client'

import { useMemo, useState } from 'react'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import FilterChips from '@/components/admin/FilterChips'
import EmptyState from '@/components/admin/EmptyState'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'
import {
  brandLinkClass,
  brandPrimaryCtaClass,
  brandSecondaryCtaClass,
  BRAND_GREEN,
} from '@/lib/brand-ui'
import { DetailFields, DetailNote, DetailSection, formatAdminDate } from '@/components/admin/AdminDetail'

const STATUS_OPTIONS = ['All', 'NEW', 'READ', 'CLOSED']

export default function AdminContactPage() {
  const { data: items, setData: setItems, loading, error, reload } = useCachedJson('/api/admin/contact', 'list')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selected, setSelected] = useState(null)

  const updateStatus = async (id, status) => {
    const res = await fetch('/api/admin/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || 'Could not update')
      return
    }
    toast.success(status === 'READ' ? 'Marked as read' : status === 'CLOSED' ? 'Closed' : 'Updated')
    setItems((prev) => {
      const next = prev.map((row) => (row.id === id ? { ...row, status } : row))
      setCachedJson('/api/admin/contact', next)
      return next
    })
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev))
  }

  const openItem = (row) => {
    setSelected(row)
    if ((row.status || 'NEW') === 'NEW') updateStatus(row.id, 'READ')
  }

  const filtered = useMemo(() => {
    if (statusFilter === 'All') return items
    return items.filter((row) => (row.status || 'NEW') === statusFilter)
  }, [items, statusFilter])

  const columns = [
    {
      key: 'subject',
      label: 'Subject',
      render: (val) => <span className="font-semibold text-slate-800">{val || '—'}</span>,
    },
    {
      key: 'name',
      label: 'From',
      render: (_val, row) => (
        <div>
          <p className="text-sm font-medium text-slate-800">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Received',
      render: (val) => formatAdminDate(val),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={(val || 'NEW').toLowerCase()} />,
    },
    {
      key: 'id',
      label: 'Open',
      render: (_val, row) => (
        <button
          type="button"
          onClick={() => openItem(row)}
          className={brandLinkClass}
          style={{ color: BRAND_GREEN }}
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contact inbox"
        description="Messages submitted from the public contact form"
      />

      <FilterChips
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        getLabel={(s) => (s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase())}
      />

      {loading && items.length === 0 ? (
        <AdminTableSkeleton />
      ) : error && items.length === 0 ? (
        <AdminError message={error} onRetry={reload} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={Mail} title="No messages" description="Contact form submissions will appear here" />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          searchKeys={['name', 'email', 'subject', 'message']}
          emptyMessage="No messages found"
        />
      )}

      <DetailSlideOver
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        eyebrow="Contact"
        title={selected?.subject || 'Message'}
        subtitle={selected?.email}
      >
        {selected && (
          <>
            <DetailSection title="Sender">
              <DetailFields
                items={[
                  { label: 'Name', value: selected.name },
                  { label: 'Email', value: selected.email },
                  { label: 'Received', value: formatAdminDate(selected.createdAt) },
                  { label: 'Status', value: selected.status || 'NEW' },
                ]}
              />
            </DetailSection>
            <DetailSection title="Message">
              <DetailNote>{selected.message}</DetailNote>
            </DetailSection>
            <div className="flex flex-wrap gap-2">
              {(selected.status || 'NEW') !== 'READ' && (
                <button
                  type="button"
                  onClick={() => updateStatus(selected.id, 'READ')}
                  className={brandSecondaryCtaClass}
                >
                  Mark read
                </button>
              )}
              {(selected.status || 'NEW') !== 'CLOSED' && (
                <button
                  type="button"
                  onClick={() => updateStatus(selected.id, 'CLOSED')}
                  className={brandPrimaryCtaClass}
                  style={{ backgroundColor: BRAND_GREEN }}
                >
                  Close
                </button>
              )}
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || '')}`}
                className={brandSecondaryCtaClass}
              >
                Reply by email
              </a>
            </div>
          </>
        )}
      </DetailSlideOver>
    </div>
  )
}
