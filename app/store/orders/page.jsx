'use client'
import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import StatusBadge from '@/components/admin/StatusBadge'
import PageHeader from '@/components/admin/PageHeader'
import FilterChips from '@/components/admin/FilterChips'
import DataTable from '@/components/admin/DataTable'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import { DetailFields, DetailSection, formatAdminMoney } from '@/components/admin/AdminDetail'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { brandSelectClass, brandLinkClass, BRAND_GREEN } from '@/lib/brand-ui'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const FILTERS = ['All', ...STATUS_OPTIONS]

export default function VendorOrders() {
    const { data: vendorOrders, setData, loading, error, reload } = useCachedJson('/api/vendor/orders', 'list')
    const [statusFilter, setStatusFilter] = useState('All')
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [updating, setUpdating] = useState(false)

    const filtered = useMemo(() => {
        if (statusFilter === 'All') return vendorOrders
        return vendorOrders.filter((o) => o.status === statusFilter)
    }, [vendorOrders, statusFilter])

    const updateStatus = async (status) => {
        if (!selectedOrder) return
        setUpdating(true)
        try {
            const res = await fetch(`/api/vendor/orders/${selectedOrder.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Update failed')
            toast.success(`Status updated to ${status.replaceAll('_', ' ')}`)
            setData((prev) => prev.map((o) => (o.id === data.id ? { ...o, ...data } : o)))
            setSelectedOrder(null)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setUpdating(false)
        }
    }

    const columns = [
        {
            key: 'id',
            label: 'Order',
            render: (val) => (
                <span className="font-mono text-xs font-semibold text-slate-700">{String(val || '').slice(-8).toUpperCase()}</span>
            ),
        },
        {
            key: 'customer',
            label: 'Customer',
            render: (val, row) => (
                <div>
                    <p className="font-medium text-slate-700">{val}</p>
                    <p className="text-xs text-slate-400">{row.email}</p>
                </div>
            ),
        },
        {
            key: 'items',
            label: 'Items',
            render: (val) => `${val?.length || 0} item(s)`,
        },
        {
            key: 'total',
            label: 'Amount',
            render: (val) => <span className="font-semibold text-slate-800">₹{Number(val || 0).toLocaleString('en-IN')}</span>,
        },
        {
            key: 'payment',
            label: 'Payment',
            render: (val, row) => val || row.paymentMethod || '—',
        },
        {
            key: 'status',
            label: 'Status',
            render: (val) => <StatusBadge status={val} />,
        },
        {
            key: 'date',
            label: 'Date',
            render: (val) => (val ? new Date(val).toLocaleDateString('en-IN') : '—'),
        },
        {
            key: 'view',
            label: 'View',
            render: (_val, row) => (
                <button type="button" onClick={() => setSelectedOrder(row)} className={brandLinkClass} style={{ color: BRAND_GREEN }}>
                    <Eye size={16} />
                </button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Vendor" title="Orders" description={`${vendorOrders.length} total orders`} />

            <FilterChips
                options={FILTERS}
                value={statusFilter}
                onChange={setStatusFilter}
                getLabel={(status) => (status === 'All' ? 'All' : status.replaceAll('_', ' '))}
            />

            {loading && vendorOrders.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && vendorOrders.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : (
                <DataTable
                    columns={columns}
                    data={filtered}
                    searchKeys={['id', 'customer', 'email']}
                    emptyMessage="No orders found"
                />
            )}

            <DetailSlideOver
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                eyebrow="Order"
                title={selectedOrder ? String(selectedOrder.id || '').slice(-8).toUpperCase() : 'Order'}
                subtitle={selectedOrder?.customer}
                footer={selectedOrder ? (
                    <select
                        value={selectedOrder.status}
                        disabled={updating}
                        onChange={(e) => updateStatus(e.target.value)}
                        className={`w-full ${brandSelectClass}`}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>
                        ))}
                    </select>
                ) : null}
            >
                {selectedOrder && (
                    <>
                        <DetailSection title="Customer">
                            <DetailFields
                                items={[
                                    { label: 'Name', value: selectedOrder.customer },
                                    { label: 'Email', value: selectedOrder.email },
                                    { label: 'Address', value: selectedOrder.address },
                                    { label: 'Payment', value: selectedOrder.payment || selectedOrder.paymentMethod },
                                ]}
                            />
                        </DetailSection>
                        <DetailSection title="Items">
                            <div className="overflow-hidden rounded-xl border border-[#e4eee6]">
                                {(selectedOrder.items || []).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between border-b border-[#e4eee6] px-4 py-3 last:border-0">
                                        <span className="text-sm text-slate-700">{item.name} × {item.qty || item.quantity}</span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {formatAdminMoney(item.price * (item.qty || item.quantity || 1))}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </DetailSection>
                        <div className="flex items-center justify-between rounded-xl bg-[#f4f8f5] px-4 py-3">
                            <span className="text-sm font-medium text-slate-500">Total</span>
                            <span className="text-base font-bold text-slate-800">{formatAdminMoney(selectedOrder.total)}</span>
                        </div>
                    </>
                )}
            </DetailSlideOver>
        </div>
    )
}
