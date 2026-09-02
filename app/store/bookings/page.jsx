'use client'
import { useMemo, useState } from 'react'
import StatusBadge from '@/components/admin/StatusBadge'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import FilterChips from '@/components/admin/FilterChips'
import DataTable from '@/components/admin/DataTable'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { brandSelectClass } from '@/lib/brand-ui'

const STATUSES = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']

export default function VendorBookings() {
    const { data: bookings, setData, loading, error, reload } = useCachedJson('/api/vendor/bookings', 'list')
    const [statusFilter, setStatusFilter] = useState('All')
    const [updatingId, setUpdatingId] = useState(null)

    const filtered = useMemo(() => {
        if (statusFilter === 'All') return bookings
        return bookings.filter((b) => b.status === statusFilter)
    }, [bookings, statusFilter])

    const updateStatus = async (id, status) => {
        setUpdatingId(id)
        try {
            const res = await fetch(`/api/vendor/bookings/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Update failed')
            setData((prev) => prev.map((b) => (b.id === id ? data : b)))
            toast.success('Booking status updated')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setUpdatingId(null)
        }
    }

    const columns = [
        {
            key: 'service',
            label: 'Service',
            render: (val) => (
                <div>
                    <p className="font-medium text-slate-700">{val?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{val?.category}</p>
                </div>
            ),
        },
        {
            key: 'user',
            label: 'Customer',
            render: (val) => (
                <div>
                    <p className="font-medium text-slate-700">{val?.name || '—'}</p>
                    <p className="text-xs text-slate-400">{val?.email}</p>
                </div>
            ),
        },
        {
            key: 'date',
            label: 'Date / Time',
            render: (val, row) => `${val ? new Date(val).toLocaleDateString('en-IN') : '—'}${row.time ? ` · ${row.time}` : ''}`,
        },
        { key: 'location', label: 'Location' },
        {
            key: 'price',
            label: 'Price',
            render: (val) => <span className="font-semibold text-slate-800">₹{(val || 0).toLocaleString('en-IN')}</span>,
        },
        { key: 'status', label: 'Status', render: (val) => <StatusBadge status={val} /> },
        {
            key: 'update',
            label: 'Update',
            render: (_val, row) => (
                <select
                    value={row.status}
                    disabled={updatingId === row.id}
                    onChange={(e) => updateStatus(row.id, e.target.value)}
                    className={`${brandSelectClass} py-1.5 text-xs`}
                >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>)}
                </select>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Vendor" title="Bookings" description={`${bookings.length} total bookings`} />

            <FilterChips
                options={['All', ...STATUSES]}
                value={statusFilter}
                onChange={setStatusFilter}
                getLabel={(s) => s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            />

            {loading && bookings.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && bookings.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : (
                <DataTable
                    columns={columns}
                    data={filtered}
                    searchKeys={['id', 'user.name', 'service.name']}
                    emptyMessage="No bookings found"
                />
            )}
        </div>
    )
}
