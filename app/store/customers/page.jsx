'use client'
import { Mail, Phone } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { BRAND_GREEN, BRAND_GREEN_LIGHT } from '@/lib/brand-ui'

export default function VendorCustomers() {
    const { data: vendorCustomers, loading, error, reload } = useCachedJson('/api/vendor/customers', 'list')

    const columns = [
        {
            key: 'name',
            label: 'Customer',
            render: (val, row) => (
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold"
                        style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                    >
                        {(val || '?').charAt(0)}
                    </div>
                    <div>
                        <p className="font-semibold text-slate-700">{val || 'Customer'}</p>
                        <p className="text-xs text-slate-400">{row.city || '—'}</p>
                    </div>
                </div>
            ),
        },
        {
            key: 'email',
            label: 'Email',
            render: (val) => (
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <Mail size={12} className="text-slate-400" /> {val || '—'}
                </span>
            ),
        },
        {
            key: 'phone',
            label: 'Phone',
            render: (val) => (
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                    <Phone size={12} className="text-slate-400" /> {val || '—'}
                </span>
            ),
        },
        { key: 'totalOrders', label: 'Orders' },
        {
            key: 'totalSpent',
            label: 'Spent',
            render: (val) => <span className="font-semibold text-slate-800">₹{(val || 0).toLocaleString('en-IN')}</span>,
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Vendor" title="Customers" description={`${vendorCustomers.length} customers`} />

            {loading && vendorCustomers.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && vendorCustomers.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : (
                <DataTable
                    columns={columns}
                    data={vendorCustomers}
                    searchKeys={['name', 'email', 'phone', 'city']}
                    emptyMessage="No customers yet"
                />
            )}
        </div>
    )
}
