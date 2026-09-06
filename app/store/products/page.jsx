'use client'
import { useMemo, useState } from 'react'
import { Plus, Edit, Trash2, Package } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/ConfirmDialog'
import CatalogImage from '@/components/CatalogImage'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { useVendorPageSearch } from '@/components/store/useVendorPageSearch'
import {
    brandCardClass,
    brandInputClass,
    brandSelectClass,
    brandPrimaryCtaClass,
    BRAND_GREEN,
} from '@/lib/brand-ui'

export default function VendorProducts() {
    const { data: vendorProducts, loading, error, reload } = useCachedJson('/api/vendor/products', 'list')
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('All')
    const [stockFilter, setStockFilter] = useState('All')
    const [deleting, setDeleting] = useState(null)

    useVendorPageSearch(setSearch)

    const categories = useMemo(
        () => ['All', ...new Set(vendorProducts.map((p) => p.category).filter(Boolean))],
        [vendorProducts],
    )

    const filtered = vendorProducts.filter((p) => {
        const matchSearch = (p.name || '').toLowerCase().includes(search.toLowerCase())
        const matchCategory = categoryFilter === 'All' || p.category === categoryFilter
        const matchStock = stockFilter === 'All' ||
            (stockFilter === 'In Stock' && p.inStock && p.stock > 3) ||
            (stockFilter === 'Low Stock' && p.stock <= 3) ||
            (stockFilter === 'Out of Stock' && !p.inStock)
        return matchSearch && matchCategory && matchStock
    })

    const handleDelete = async () => {
        if (!deleting) return
        const res = await fetch(`/api/vendor/products/${deleting.id}`, { method: 'DELETE' })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
            toast.error(data.error || 'Could not delete')
            throw new Error('delete')
        }
        toast.success(data.message || (data.softDeleted ? 'Marked out of stock (used in past orders)' : 'Product deleted'))
        reload({ silent: true })
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Vendor"
                title="Products"
                description={`${vendorProducts.length} products listed`}
                action={
                    <Link href="/store/add-product" className={brandPrimaryCtaClass} style={{ backgroundColor: BRAND_GREEN }}>
                        <Plus size={16} /> Add Product
                    </Link>
                }
            />

            <div className="flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={brandInputClass}
                />
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className={brandSelectClass}>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className={brandSelectClass}>
                    <option value="All">All Stock</option>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                </select>
            </div>

            {loading && vendorProducts.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && vendorProducts.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : filtered.length === 0 ? (
                <EmptyState icon={Package} title="No products found" description="Add a product or adjust your filters" />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((product) => (
                        <div key={product.id} className={`${brandCardClass} group overflow-hidden`}>
                            <div className="relative aspect-square bg-slate-50">
                                {product.images?.[0] ? (
                                    <CatalogImage
                                        fill
                                        src={product.images[0]}
                                        alt={product.name}
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, 25vw"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                                        <Package size={32} />
                                    </div>
                                )}
                                <span className={`absolute top-2 left-2 rounded-xl px-2 py-0.5 text-[9px] font-bold text-white ${
                                    product.stock <= 3 ? 'bg-red-500' : product.stock <= 10 ? 'bg-amber-500' : 'bg-[#2f7d4a]'
                                }`}>
                                    {product.stock <= 3 ? 'LOW STOCK' : `${product.stock} in stock`}
                                </span>
                                {(product.status || 'approved') !== 'approved' && (
                                    <span className="absolute top-2 right-2 rounded-xl bg-slate-800/80 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                                        {product.status || 'pending'}
                                    </span>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="truncate text-sm font-semibold text-slate-800">{product.name}</h3>
                                <p className="mt-0.5 text-xs text-slate-500">{product.category}</p>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-lg font-bold text-slate-800">₹{(product.price || 0).toLocaleString('en-IN')}</span>
                                    {product.mrp > product.price && (
                                        <span className="text-xs text-slate-400 line-through">₹{product.mrp.toLocaleString('en-IN')}</span>
                                    )}
                                </div>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <div className="text-xs text-slate-500">
                                        <span className="font-semibold text-slate-700">{product.totalSales}</span> sold
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/store/add-product?id=${product.id}`} className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-[#eef4ef] hover:text-[#2f7d4a]" title="Edit product">
                                            <Edit size={14} />
                                        </Link>
                                        <button
                                            type="button"
                                            onClick={() => setDeleting(product)}
                                            className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                danger
                eyebrow="Catalog"
                title="Delete this product?"
                description={deleting ? `"${deleting.name}" will be removed from your store.` : ''}
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </div>
    )
}
