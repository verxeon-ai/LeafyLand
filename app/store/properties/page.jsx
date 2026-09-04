'use client'
import { useState } from 'react'
import { Plus, Trash2, Home } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import StatusBadge from '@/components/admin/StatusBadge'
import PageHeader from '@/components/admin/PageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/ConfirmDialog'
import CatalogImage from '@/components/CatalogImage'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { useVendorPageSearch } from '@/components/store/useVendorPageSearch'
import { brandPrimaryCtaClass, brandCardClass, brandInputClass, BRAND_GREEN } from '@/lib/brand-ui'

export default function VendorProperties() {
    const { data: properties, loading, error, reload } = useCachedJson('/api/vendor/properties', 'list')
    const [search, setSearch] = useState('')
    const [deleting, setDeleting] = useState(null)

    useVendorPageSearch(setSearch)

    const filtered = properties.filter((p) =>
        (p.title || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.location || '').toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async () => {
        if (!deleting) return
        const res = await fetch(`/api/vendor/properties/${deleting.id}`, { method: 'DELETE' })
        if (!res.ok) {
            toast.error('Could not delete')
            throw new Error('delete')
        }
        toast.success('Property deleted')
        reload({ silent: true })
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Vendor"
                title="Properties"
                description={`${properties.length} properties listed`}
                action={
                    <Link href="/store/add-property" className={brandPrimaryCtaClass} style={{ backgroundColor: BRAND_GREEN }}>
                        <Plus size={16} /> Add Property
                    </Link>
                }
            />

            <input
                type="text"
                placeholder="Search properties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={brandInputClass}
            />

            {loading && properties.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && properties.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : filtered.length === 0 ? (
                <EmptyState icon={Home} title="No properties found" description="Add a property or adjust your search" />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((property) => (
                        <div key={property.id} className={`${brandCardClass} group overflow-hidden`}>
                            <div className="relative aspect-[4/3] bg-slate-50">
                                {property.images?.[0] ? (
                                    <CatalogImage
                                        fill
                                        src={property.images[0]}
                                        alt={property.title}
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, 25vw"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                                        <Home size={32} />
                                    </div>
                                )}
                                <span className="absolute top-2 left-2">
                                    <StatusBadge status={property.status || 'pending'} />
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="truncate text-sm font-semibold text-slate-800">{property.title}</h3>
                                <p className="mt-0.5 text-xs text-slate-500">{property.propertyType} · {property.listingType}</p>
                                <p className="mt-1 truncate text-xs text-slate-400">{property.location}</p>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="text-lg font-bold text-slate-800">₹{(property.price || 0).toLocaleString('en-IN')}</span>
                                    <button
                                        type="button"
                                        onClick={() => setDeleting(property)}
                                        className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
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
                eyebrow="Listings"
                title="Delete this property?"
                description={deleting ? `"${deleting.title}" will be removed from your listings.` : ''}
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </div>
    )
}
