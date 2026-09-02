'use client'
import { useMemo, useState } from 'react'
import { AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import FilterChips from '@/components/admin/FilterChips'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useCachedJson } from '@/lib/useCachedJson'
import { brandGhostCtaClass, brandCardClass } from '@/lib/brand-ui'

export default function VendorInventory() {
    const { data: vendorProducts, loading, error, reload } = useCachedJson('/api/vendor/products', 'list')
    const [sort, setSort] = useState('stock-asc')
    const [editing, setEditing] = useState(null)

    const vendorInventoryAlerts = vendorProducts
        .filter((p) => (p.stock ?? 0) <= 5)
        .map((p) => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            status: p.stock <= 2 ? 'critical' : 'low',
        }))

    const sorted = useMemo(() => {
        return [...vendorProducts].sort((a, b) => {
            if (sort === 'stock-asc') return (a.stock ?? 0) - (b.stock ?? 0)
            if (sort === 'stock-desc') return (b.stock ?? 0) - (a.stock ?? 0)
            return String(a.name || '').localeCompare(String(b.name || ''))
        })
    }, [vendorProducts, sort])

    const updateStock = async (value) => {
        if (!editing) return
        const stock = Number(value)
        if (Number.isNaN(stock) || stock < 0) {
            toast.error('Enter a valid stock number')
            throw new Error('invalid')
        }
        const res = await fetch(`/api/vendor/products/${editing.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stock }),
        })
        if (!res.ok) {
            toast.error('Could not update stock')
            throw new Error('update')
        }
        toast.success('Stock updated')
        reload({ silent: true })
    }

    const columns = [
        { key: 'name', label: 'Product', render: (val) => <span className="font-medium text-slate-700">{val}</span> },
        { key: 'category', label: 'Category' },
        {
            key: 'stock',
            label: 'Stock',
            render: (val) => (
                <span className={`font-semibold ${val <= 3 ? 'text-red-600' : val <= 10 ? 'text-amber-600' : 'text-[#2f7d4a]'}`}>
                    {val}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Status',
            render: (_val, row) => (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-xl ${
                    row.stock <= 3 ? 'bg-red-100 text-red-600' :
                    row.stock <= 10 ? 'bg-amber-100 text-amber-600' :
                    'bg-[#eef4ef] text-[#2f7d4a]'
                }`}>
                    {row.stock <= 3 ? 'Critical' : row.stock <= 10 ? 'Low' : 'In Stock'}
                </span>
            ),
        },
        { key: 'totalSales', label: 'Total sold', render: (val) => val || 0 },
        {
            key: 'action',
            label: 'Action',
            render: (_val, row) => (
                <button type="button" onClick={() => setEditing(row)} className={brandGhostCtaClass}>
                    Update stock
                </button>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Vendor" title="Inventory" description={`${vendorProducts.length} products tracked`} />

            {vendorInventoryAlerts.length > 0 && (
                <div className={`${brandCardClass} border-amber-200 bg-amber-50 p-5`}>
                    <div className="mb-3 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-amber-600" />
                        <h2 className="text-sm font-semibold text-amber-800">Low stock alerts</h2>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {vendorInventoryAlerts.map((item) => (
                            <span
                                key={item.id}
                                className={`rounded-xl px-3 py-1.5 text-xs font-semibold ${
                                    item.status === 'critical' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                }`}
                            >
                                {item.name} — {item.stock} left
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <FilterChips
                options={['stock-asc', 'stock-desc', 'name']}
                value={sort}
                onChange={setSort}
                getLabel={(opt) => (
                    opt === 'stock-asc' ? 'Stock: Low to High' : opt === 'stock-desc' ? 'Stock: High to Low' : 'Name A–Z'
                )}
            />

            {loading && vendorProducts.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && vendorProducts.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : (
                <DataTable
                    columns={columns}
                    data={sorted}
                    searchKeys={['name', 'category']}
                    emptyMessage="No inventory yet"
                />
            )}

            <ConfirmDialog
                open={!!editing}
                onClose={() => setEditing(null)}
                eyebrow="Inventory"
                title={`Update stock${editing ? ` · ${editing.name}` : ''}`}
                description="Enter the new quantity available for this product."
                confirmLabel="Save"
                input={{ type: 'number', min: 0, defaultValue: String(editing?.stock ?? 0) }}
                onConfirm={updateStock}
            />
        </div>
    )
}
