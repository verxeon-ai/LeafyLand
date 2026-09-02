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

export default function VendorVisits() {
    const { data: visits, setData, loading, error, reload } = useCachedJson('/api/vendor/visits', 'list')
    const [statusFilter, setStatusFilter] = useState('All')
    const [updatingId, setUpdatingId] = useState(null)

    const filtered = useMemo(() => {
        if (statusFilter === 'All') return visits
        return visits.filter((v) => v.status === statusFilter)
    }, [visits, statusFilter])

    const updateStatus = async (id, status) => {
        setUpdatingId(id)
        try {
            const res = await fetch(`/api/vendor/visits/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Update failed')
            setData((prev) => prev.map((v) => (v.id === id ? data : v)))
            toast.success('Visit status updated')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setUpdatingId(null)
        }
    }

    const columns = [
        {
            key: 'property',
            label: 'Property',
            render: (val) => (
                <div>
                    <p className="font-medium text-slate-700">{val?.title || '—'}</p>
                    <p className="text-xs text-slate-400">{val?.location}</p>
                </div>
            ),
        },
        {
            key: 'name',
            label: 'Visitor',
            render: (val, row) => (
                <div>
                    <p className="font-medium text-slate-700">{val}</p>
                    <p className="text-xs text-slate-400">{row.user?.email}</p>
                </div>
            ),
        },
        { key: 'phone', label: 'Phone' },
        {
            key: 'date',
            label: 'Date / Time',
            render: (val, row) => `${val ? new Date(val).toLocaleDateString('en-IN') : '—'}${row.time ? ` · ${row.time}` : ''}`,
        },
        { key: 'notes', label: 'Notes', render: (val) => val || '—' },
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
            <PageHeader eyebrow="Vendor" title="Visits" description={`${visits.length} total visit requests`} />

            <FilterChips
                options={['All', ...STATUSES]}
                value={statusFilter}
                onChange={setStatusFilter}
                getLabel={(s) => s === 'All' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            />

            {loading && visits.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && visits.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : (
                <DataTable
                    columns={columns}
                    data={filtered}
                    searchKeys={['name', 'phone', 'property.title']}
                    emptyMessage="No visit requests found"
                />
            )}
        </div>
    )
}
