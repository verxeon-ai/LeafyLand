'use client'
import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Search, Sparkles } from 'lucide-react'
import ServiceCategoryCard from '@/components/ServiceCategoryCard'
import { BRAND_GREEN } from '@/lib/brand-ui'
import { cachedJson, peekCachedJson } from '@/lib/cachedJson'
import { ServiceGridSkeleton } from '@/components/CatalogSkeleton'

const CATEGORY_COPY = {
    Landscaping: 'Layouts, planting plans and outdoor makeovers',
    Irrigation: 'Drip systems, watering and water-wise setups',
    'Garden Maintenance': 'Pruning, feeding and keep-it-green care',
    'Daily Needs Services': 'On-demand green and home help at your door',
    'Home Services': 'Professional home maintenance and repair',
}

function ServicesContent() {
    const searchParams = useSearchParams()
    const urlCategory = searchParams.get('category') || ''
    const urlSearch = searchParams.get('search') || ''
    const [search, setSearch] = useState(urlSearch)
    const [services, setServices] = useState(() => Array.isArray(peekCachedJson('/api/services')) ? peekCachedJson('/api/services') : [])
    const [loading, setLoading] = useState(() => !Array.isArray(peekCachedJson('/api/services')))

    useEffect(() => {
        setSearch(urlSearch)
    }, [urlSearch])

    useEffect(() => {
        let cancelled = false
        cachedJson('/api/services')
            .then((data) => { if (!cancelled && Array.isArray(data)) setServices(data) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const filtered = useMemo(() => services.filter((s) => {
        const hay = `${s.name} ${s.category || ''}`.toLowerCase()
        const matchSearch = !search || hay.includes(search.toLowerCase())
        const matchCategory = !urlCategory || (s.category || '') === urlCategory
        return matchSearch && matchCategory
    }), [services, search, urlCategory])

    const grouped = useMemo(() => {
        const map = {}
        filtered.forEach((s) => {
            const cat = s.category || 'Other'
            ;(map[cat] ||= []).push(s)
        })
        return Object.entries(map)
    }, [filtered])

    const heading = urlCategory || 'Services'
    const lede = urlCategory
        ? (CATEGORY_COPY[urlCategory] || 'Professional services to get the job done')
        : 'On-demand green, home & professional services'

    return (
        <div className="bg-slate-50/50 min-h-[60vh] pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-2">
                <p className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] mb-2" style={{ color: BRAND_GREEN }}>
                    <Sparkles size={12} /> Book at your doorstep
                </p>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{heading}</h1>
                <p className="text-sm text-slate-500 mt-1">{lede}</p>
                {urlCategory && (
                    <Link href="/services" className="inline-block mt-2 text-xs font-semibold hover:underline" style={{ color: BRAND_GREEN }}>
                        All services
                    </Link>
                )}
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search services..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2f7d4a] focus:ring-1 focus:ring-[#2f7d4a]/20 transition"
                    />
                </div>
            </div>

            {loading ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
                    <ServiceGridSkeleton count={8} />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500 text-sm">No services found matching your search.</p>
                    <Link href="/services" className="mt-3 inline-block text-sm font-medium hover:underline" style={{ color: BRAND_GREEN }}>
                        View all services
                    </Link>
                </div>
            ) : (
                grouped.map(([category, items]) => (
                    <section key={category} id={category.toLowerCase().replace(/\s+/g, '-')} className="max-w-7xl mx-auto px-4 sm:px-6 pb-10">
                        <div className="flex items-end justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-lg sm:text-xl font-bold text-slate-800">{category}</h2>
                                <p className="text-sm text-slate-500 mt-0.5">
                                    {CATEGORY_COPY[category] || 'Professional services to get the job done'}
                                </p>
                            </div>
                            <span className="hidden sm:inline text-xs font-medium text-slate-400">{items.length} {items.length === 1 ? 'service' : 'services'}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                            {items.map((service) => (
                                <ServiceCategoryCard key={service.id} service={service} />
                            ))}
                        </div>
                    </section>
                ))
            )}
        </div>
    )
}

export default function ServicesPage() {
    return (
        <Suspense fallback={<div className="min-h-[50vh]" />}>
            <ServicesContent />
        </Suspense>
    )
}
