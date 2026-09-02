'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import FilterChips from '@/components/admin/FilterChips'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import toast from 'react-hot-toast'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'
import {
  brandLinkClass,
  brandSelectClass,
  BRAND_GREEN,
} from '@/lib/brand-ui'
import { DetailFields, DetailSection, formatAdminDate, formatAdminMoney } from '@/components/admin/AdminDetail'

const STATUS_FILTERS = ['All', 'ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const ORDER_STATUS = {
  ORDER_PLACED: { label: 'Order Placed', cls: 'bg-slate-100 text-slate-600' },
  PROCESSING: { label: 'Processing', cls: 'bg-amber-100 text-amber-700' },
  SHIPPED: { label: 'Shipped', cls: 'bg-blue-100 text-blue-700' },
  DELIVERED: { label: 'Delivered', cls: 'bg-[#eef4ef] text-[#2f7d4a]' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-100 text-red-700' },
}

const StatusPill = ({ status }) => {
  const s = ORDER_STATUS[status] || { label: status, cls: 'bg-slate-100 text-slate-600' }
  return <span className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`
}

export default function OrdersPage() {
  const { data: orders, setData: setOrders, loading, error, reload: load } = useCachedJson('/api/admin/orders', 'list')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedOrder, setSelectedOrder] = useState(null)

  const filteredData = useMemo(() => {
    if (statusFilter === 'All') return orders
    return orders.filter((o) => o.status === statusFilter)
  }, [statusFilter, orders])

  const columns = [
    {
      key: 'id',
      label: 'Order ID',
      render: (val) => (
        <span className="font-mono text-sm font-semibold text-slate-800">{val}</span>
      ),
    },
    { key: 'customer', label: 'Customer' },
    { key: 'store', label: 'Store' },
    {
      key: 'total',
      label: 'Total',
      render: (val) => (
        <span className="font-semibold text-slate-800">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusPill status={val} />,
    },
    {
      key: 'date',
      label: 'Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'actions',
      label: 'View',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setSelectedOrder(row)}
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
      <PageHeader title="Orders" description="Manage all customer orders" />

      <FilterChips
        options={STATUS_FILTERS}
        value={statusFilter}
        onChange={setStatusFilter}
        getLabel={(s) => (s === 'All' ? 'All Statuses' : ORDER_STATUS[s]?.label || s)}
      />

      {loading && orders.length === 0 ? (
        <AdminTableSkeleton />
      ) : error && orders.length === 0 ? (
        <AdminError message={error} onRetry={load} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          searchKeys={['id', 'customer', 'store']}
          emptyMessage="No orders found"
        />
      )}

      <DetailSlideOver
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        eyebrow="Order"
        title={selectedOrder?.id ?? 'Order details'}
        subtitle={selectedOrder ? formatCurrency(selectedOrder.total) : undefined}
        footer={selectedOrder ? (
          <div>
            <label className="mb-2 block text-xs font-medium text-slate-500">Update status</label>
            <select
              value={selectedOrder.status}
              onChange={async (e) => {
                const status = e.target.value
                try {
                  const res = await fetch('/api/admin/orders', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: selectedOrder.id, status }),
                  })
                  const data = await res.json()
                  if (!res.ok) throw new Error(data.error || 'Update failed')
                  setOrders((prev) => {
                    const next = prev.map((o) => (o.id === data.id ? { ...o, ...data } : o))
                    setCachedJson('/api/admin/orders', next)
                    return next
                  })
                  setSelectedOrder((prev) => (prev ? { ...prev, ...data } : prev))
                  toast.success(`Status set to ${status}`)
                } catch (err) {
                  toast.error(err.message)
                }
              }}
              className={`w-full ${brandSelectClass}`}
            >
              {STATUS_FILTERS.filter((s) => s !== 'All').map((s) => (
                <option key={s} value={s}>{ORDER_STATUS[s]?.label || s}</option>
              ))}
            </select>
          </div>
        ) : null}
      >
        {selectedOrder && (
          <>
            <div className="flex items-center justify-between gap-3">
              <StatusPill status={selectedOrder.status} />
              <span className={`text-sm font-semibold ${selectedOrder.isPaid ? '' : 'text-red-600'}`} style={selectedOrder.isPaid ? { color: BRAND_GREEN } : undefined}>
                {selectedOrder.isPaid ? 'Paid' : 'Unpaid'}
              </span>
            </div>

            <DetailSection title="Summary">
              <DetailFields
                items={[
                  { label: 'Customer', value: selectedOrder.customer },
                  { label: 'Store', value: selectedOrder.store },
                  { label: 'Date', value: formatAdminDate(selectedOrder.date || selectedOrder.createdAt) },
                  { label: 'Payment', value: selectedOrder.paymentMethod || selectedOrder.payment },
                ]}
              />
            </DetailSection>

            <DetailSection title="Items">
              <div className="overflow-hidden rounded-xl border border-[#e4eee6]">
                {(selectedOrder.items || []).length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-400">No items</p>
                ) : (
                  (selectedOrder.items || []).map((item, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-[#e4eee6] px-4 py-3 last:border-0">
                      <span className="text-sm text-slate-700">
                        {item.name} <span className="text-slate-400">× {item.quantity}</span>
                      </span>
                      <span className="text-sm font-semibold text-slate-800">{formatAdminMoney(item.price)}</span>
                    </div>
                  ))
                )}
              </div>
            </DetailSection>

            <div className="flex items-center justify-between rounded-xl bg-[#f4f8f5] px-4 py-3">
              <span className="text-sm font-medium text-slate-500">Total</span>
              <span className="text-base font-bold text-slate-800">{formatCurrency(selectedOrder.total)}</span>
            </div>
          </>
        )}
      </DetailSlideOver>
    </div>
  )
}
