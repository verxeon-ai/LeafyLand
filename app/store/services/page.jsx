'use client'
import { useState } from 'react'
import { Plus, Trash2, Wrench } from 'lucide-react'
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

export default function VendorServices() {
    const { data: services, loading, error, reload } = useCachedJson('/api/vendor/services', 'list')
    const [search, setSearch] = useState('')
    const [deleting, setDeleting] = useState(null)

    useVendorPageSearch(setSearch)

    const filtered = services.filter((s) =>
        (s.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (s.category || '').toLowerCase().includes(search.toLowerCase())
    )

    const handleDelete = async () => {
        if (!deleting) return
        const res = await fetch(`/api/vendor/services/${deleting.id}`, { method: 'DELETE' })
        if (!res.ok) {
            toast.error('Could not delete')
            throw new Error('delete')
        }
        toast.success('Service deleted')
        reload({ silent: true })
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Vendor"
                title="Services"
                description={`${services.length} services listed`}
                action={
                    <Link href="/store/add-service" className={brandPrimaryCtaClass} style={{ backgroundColor: BRAND_GREEN }}>
                        <Plus size={16} /> Add Service
                    </Link>
                }
            />

            <input
                type="text"
                placeholder="Search services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={brandInputClass}
            />

            {loading && services.length === 0 ? (
                <AdminTableSkeleton />
            ) : error && services.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : filtered.length === 0 ? (
                <EmptyState icon={Wrench} title="No services found" description="Add a service or adjust your search" />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filtered.map((service) => (
                        <div key={service.id} className={`${brandCardClass} group overflow-hidden`}>
                            <div className="relative aspect-[4/3] bg-slate-50">
                                {service.images?.[0] ? (
                                    <CatalogImage
                                        fill
                                        src={service.images[0]}
                                        alt={service.name}
                                        className="object-cover transition duration-300 group-hover:scale-105"
                                        sizes="(max-width: 640px) 100vw, 25vw"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                                        <Wrench size={32} />
                                    </div>
                                )}
                                <span className="absolute top-2 left-2">
                                    <StatusBadge status={service.status || 'pending'} />
                                </span>
                            </div>
                            <div className="p-4">
                                <h3 className="truncate text-sm font-semibold text-slate-800">{service.name}</h3>
                                <p className="mt-0.5 text-xs text-slate-500">{service.category}</p>
                                <p className="mt-1 truncate text-xs text-slate-400">{service.location}</p>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <span className="text-lg font-bold text-slate-800">₹{(service.startingPrice || 0).toLocaleString('en-IN')}</span>
                                    <button
                                        type="button"
                                        onClick={() => setDeleting(service)}
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
                title="Delete this service?"
                description={deleting ? `"${deleting.name}" will be removed from your listings.` : ''}
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </div>
    )
}
