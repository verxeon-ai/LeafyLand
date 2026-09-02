'use client'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { BRAND_GREEN } from '@/lib/brand-ui'

export default function StoreManageProducts() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const { data: products, setData, loading, error, reload } = useCachedJson('/api/vendor/products', 'list')

    const toggleStock = async (productId) => {
        const product = products.find((p) => p.id === productId)
        if (!product) return
        const res = await fetch(`/api/vendor/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ inStock: !product.inStock }),
        })
        if (!res.ok) throw new Error('Update failed')
        setData((prev) => prev.map((p) => p.id === productId ? { ...p, inStock: !p.inStock } : p))
    }

    const columns = [
        {
            key: 'name',
            label: 'Name',
            render: (val, row) => (
                <div className="flex items-center gap-2">
                    {row.images?.[0] && (
                        <Image width={40} height={40} className="h-10 w-10 rounded-xl object-cover" src={row.images[0]} alt="" />
                    )}
                    <span className="font-medium">{val}</span>
                </div>
            ),
        },
        { key: 'description', label: 'Description', render: (val) => <span className="max-w-xs truncate text-slate-600">{val}</span> },
        { key: 'mrp', label: 'MRP', render: (val) => `${currency} ${(val || 0).toLocaleString('en-IN')}` },
        { key: 'price', label: 'Price', render: (val) => `${currency} ${(val || 0).toLocaleString('en-IN')}` },
        {
            key: 'inStock',
            label: 'In stock',
            render: (val, row) => (
                <label className="relative inline-flex cursor-pointer items-center">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={!!val}
                        onChange={() => toast.promise(toggleStock(row.id), { loading: 'Updating…' })}
                    />
                    <div
                        className="h-5 w-9 rounded-full bg-slate-300 transition-colors duration-200 peer-checked:bg-[#2f7d4a]"
                        style={{ backgroundColor: val ? BRAND_GREEN : undefined }}
                    />
                    <span className="absolute top-1 left-1 h-3 w-3 rounded-full bg-white transition-transform duration-200 peer-checked:translate-x-4" />
                </label>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Vendor"
                title="Manage products"
                description="Toggle stock availability for your listings"
            />

            {loading && products.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && products.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : (
                <DataTable
                    columns={columns}
                    data={products}
                    searchKeys={['name', 'description']}
                    emptyMessage="No products yet"
                />
            )}
        </div>
    )
}
