'use client'
import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import PropertyCard from "@/components/PropertyCard"
import { Search } from 'lucide-react'
import { cachedJson, restoreCachedJson } from '@/lib/cachedJson'
import { PropertyGridSkeleton } from '@/components/CatalogSkeleton'

const PropertiesContent = () => {
    const searchParams = useSearchParams()
    const urlType = searchParams.get('type') || ''
    const urlSearch = searchParams.get('search') || ''
    const selectedType = urlType || 'All'
    const [search, setSearch] = useState(urlSearch)
    const [listingFilter, setListingFilter] = useState('All')
    // Always start empty so SSR HTML matches the client's first paint (cache is client-only).
    const [properties, setProperties] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setSearch(urlSearch)
    }, [urlSearch])

    useEffect(() => {
        let cancelled = false
        const hit = restoreCachedJson('/api/properties')
        if (Array.isArray(hit)) {
            setProperties(hit)
            setLoading(false)
        }
        cachedJson('/api/properties')
            .then((data) => { if (!cancelled && Array.isArray(data)) setProperties(data) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const propertyTypes = useMemo(() => {
        const set = new Set(properties.map((p) => p.propertyType).filter(Boolean))
        return ['All', ...Array.from(set)]
    }, [properties])

    const filtered = properties.filter(p => {
        const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.location.toLowerCase().includes(search.toLowerCase())
        const matchType = selectedType === 'All' || p.propertyType === selectedType
        const matchListing = listingFilter === 'All' || p.listingType === listingFilter
        return matchSearch && matchType && matchListing
    })

    const leafyCount = filtered.length
    const marketplaceCount = 0

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 min-h-[60vh]">
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Properties</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {loading
                        ? 'Loading listings…'
                        : leafyCount > 0
                            ? <><span className="text-emerald-600 font-medium">{leafyCount} LeafyLand</span> listings found</>
                            : '0 listings found'}
                </p>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search farmland, farmhouses, land..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition"
                />
            </div>

            {/* Listing filter (SALE / RENT) */}
            <div className="flex flex-wrap gap-2 mb-4">
                {['All', 'SALE', 'RENT'].map((type) => (
                    <button
                        key={type}
                        onClick={() => setListingFilter(type)}
                        className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
                            listingFilter === type
                                ? 'bg-[#2f7d4a] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {type === 'All' ? 'All' : type === 'SALE' ? 'For Sale' : 'For Rent'}
                    </button>
                ))}
            </div>

            {/* Property type filter (derived from data) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-4">
                {propertyTypes.map((type) => (
                    <Link
                        key={type}
                        href={type === 'All' ? '/properties' : `/properties?type=${encodeURIComponent(type)}`}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition ${
                            selectedType === type
                                ? 'bg-[#2f7d4a] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {type}
                    </Link>
                ))}
            </div>

            {loading ? (
                <PropertyGridSkeleton count={4} />
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-slate-500 text-sm">No properties found matching your criteria.</p>
                    <Link href="/properties" className="mt-3 inline-block text-amber-600 text-sm font-medium hover:underline">
                        Clear filters
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {leafyCount > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                                    🌿 LeafyLand Properties
                                </span>
                                <div className="flex-1 h-px bg-emerald-100" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                {filtered.map((property) => (
                                    <PropertyCard key={property.id} property={property} fluid />
                                ))}
                            </div>
                        </div>
                    )}

                    {marketplaceCount > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                    🏠 Marketplace Properties
                                </span>
                                <div className="flex-1 h-px bg-blue-100" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                                {filtered.filter(p => p.marketplace).map((property) => (
                                    <PropertyCard key={property.id} property={property} fluid />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function PropertiesPage() {
    return (
        <Suspense fallback={<div className="min-h-[50vh]" />}>
            <PropertiesContent />
        </Suspense>
    )
}
