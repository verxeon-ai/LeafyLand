'use client'
import { useEffect, useState } from 'react'
import Carousel from '@/components/Carousel'
import ExploreCategories from '@/components/ExploreCategories'
import NearYouProducts from '@/components/NearYouProducts'
import PartnersMarquee from '@/components/PartnersMarquee'
import FeaturedSection from '@/components/FeaturedSection'
import ProductCard from '@/components/ProductCard'
import PropertyCard from '@/components/PropertyCard'
import { HOME_CATEGORY_SECTIONS, HOME_PRODUCT_GROUPS } from '@/lib/categories'
import { HOME_PROPERTY_SECTIONS } from '@/lib/nav-menus'
import { ProductGridSkeleton, ServiceGridSkeleton } from '@/components/CatalogSkeleton'
import ServicesBanner from '@/components/ServicesBanner'
import PropertiesBanner from '@/components/PropertiesBanner'
import ServiceCategoryCard from '@/components/ServiceCategoryCard'

const SECTION_LIMIT = 12

function normalizeProducts(data) {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.products)) return data.products
    return []
}

function normalizeList(data) {
    return Array.isArray(data) ? data : []
}

async function fetchCategoryProducts(category) {
    const res = await fetch(
        `/api/products?paginated=1&limit=${SECTION_LIMIT}&category=${encodeURIComponent(category)}`,
        { cache: 'no-store' },
    )
    const data = await res.json()
    return normalizeProducts(data)
}

async function fetchPropertiesByType(type) {
    const res = await fetch(
        `/api/properties?limit=${SECTION_LIMIT}&type=${encodeURIComponent(type)}`,
        { cache: 'no-store' },
    )
    const data = await res.json()
    return normalizeList(data).slice(0, SECTION_LIMIT)
}

export default function Home() {
    const [categorySections, setCategorySections] = useState([])
    const [marketplaceGroups, setMarketplaceGroups] = useState([])
    const [propertySections, setPropertySections] = useState([])
    const [services, setServices] = useState([])
    const [catalogReady, setCatalogReady] = useState(false)
    const [servicesReady, setServicesReady] = useState(false)
    const [propertiesReady, setPropertiesReady] = useState(false)

    useEffect(() => {
        let cancelled = false

        Promise.all(
            HOME_CATEGORY_SECTIONS.map(async (section) => {
                try {
                    const names = [section.category, ...(section.aliases || [])]
                    const batches = await Promise.all(names.map((name) => fetchCategoryProducts(name)))
                    const seen = new Set()
                    const items = []
                    for (const batch of batches) {
                        for (const p of batch) {
                            if (!p?.id || seen.has(p.id)) continue
                            seen.add(p.id)
                            items.push(p)
                            if (items.length >= SECTION_LIMIT) break
                        }
                        if (items.length >= SECTION_LIMIT) break
                    }
                    return { ...section, items }
                } catch {
                    return { ...section, items: [] }
                }
            }),
        )
            .then((rows) => {
                if (cancelled) return
                setCategorySections(rows.filter((s) => s.items.length > 0))
            })
            .finally(() => {
                if (!cancelled) setCatalogReady(true)
            })

        Promise.all(
            HOME_PRODUCT_GROUPS.filter((g) => g.id !== 'leafyland').map(async (group) => {
                try {
                    const res = await fetch(
                        `/api/products?paginated=1&limit=${SECTION_LIMIT}&group=${encodeURIComponent(group.id)}`,
                        { cache: 'no-store' },
                    )
                    const data = await res.json()
                    const items = normalizeProducts(data).slice(0, SECTION_LIMIT)
                    return { ...group, items }
                } catch {
                    return { ...group, items: [] }
                }
            }),
        )
            .then((rows) => {
                if (cancelled) return
                setMarketplaceGroups(rows.filter((g) => g.items.length > 0))
            })
            .catch(() => {})

        fetch('/api/services', { cache: 'no-store' })
            .then((r) => r.json())
            .then((s) => {
                if (cancelled) return
                if (Array.isArray(s)) setServices(s)
            })
            .catch(() => {})
            .finally(() => {
                if (!cancelled) setServicesReady(true)
            })

        ;(async () => {
            try {
                const nichesRes = await fetch('/api/properties/niches', { cache: 'no-store' })
                const niches = await nichesRes.json().catch(() => [])
                const nicheNames = (Array.isArray(niches) ? niches : [])
                    .filter((n) => n?.name && Number(n.count) > 0)
                    .map((n) => n.name)

                const types = nicheNames.length
                    ? nicheNames
                    : HOME_PROPERTY_SECTIONS.map((s) => s.type)

                const rows = await Promise.all(
                    types.map(async (type) => {
                        const items = await fetchPropertiesByType(type)
                        return { title: type, type, items }
                    }),
                )

                if (!cancelled) {
                    setPropertySections(rows.filter((r) => r.items.length > 0))
                }
            } catch {
                if (!cancelled) setPropertySections([])
            } finally {
                if (!cancelled) setPropertiesReady(true)
            }
        })()

        return () => { cancelled = true }
    }, [])

    const vendorServices = services.slice(0, 10)

    return (
        <div className="bg-slate-50/50 flex-1 flex flex-col">
            <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-4 lg:px-6 pt-5 pb-2">
                <Carousel />
            </div>

            <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-4 lg:px-6 pb-4">
                <ExploreCategories />
            </div>

            <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-4 lg:px-6 flex-1 pb-8">
                <NearYouProducts />
               

                {!catalogReady && categorySections.length === 0 && (
                    <div className="py-5 space-y-6">
                        {[0, 1, 2].map((i) => (
                            <div key={i}>
                                <div className="h-5 w-36 bg-slate-100 rounded mb-3 animate-pulse" />
                                <ProductGridSkeleton count={5} />
                            </div>
                        ))}
                    </div>
                )}

                {categorySections.map((section) => (
                    <FeaturedSection
                        key={section.category}
                        title={section.title}
                        subtitle={`Shop ${section.title.toLowerCase()}`}
                        items={section.items}
                        viewAllLink={`/products?category=${encodeURIComponent(section.category)}`}
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                ))}

                {marketplaceGroups.map((group) => (
                    <FeaturedSection
                        key={group.id}
                        title={group.title}
                        subtitle={group.subtitle}
                        items={group.items}
                        viewAllLink={`/products?group=${group.id}`}
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                ))}

                <ServicesBanner />
                {!servicesReady && vendorServices.length === 0 && (
                    <div className="py-5">
                        <div className="h-5 w-40 bg-slate-100 rounded mb-3 animate-pulse" />
                        <ServiceGridSkeleton count={5} />
                    </div>
                )}
                {vendorServices.length > 0 && (
                    <FeaturedSection
                        title="Available Services"
                        subtitle="From our vendors"
                        items={vendorServices}
                        viewAllLink="/services"
                        renderItem={(service) => (
                            <div className="w-[148px] sm:w-[160px]">
                                <ServiceCategoryCard service={service} />
                            </div>
                        )}
                    />
                )}

                <PropertiesBanner />
                {!propertiesReady && propertySections.length === 0 && (
                    <div className="py-5">
                        <div className="h-5 w-40 bg-slate-100 rounded mb-3 animate-pulse" />
                        <ProductGridSkeleton count={5} />
                    </div>
                )}
                {propertySections.map((section) => (
                    <FeaturedSection
                        key={section.type}
                        title={section.title}
                        subtitle={`Explore ${section.title.toLowerCase()}`}
                        items={section.items}
                        viewAllLink={`/properties?type=${encodeURIComponent(section.type)}`}
                        renderItem={(property) => <PropertyCard property={property} />}
                    />
                ))}
            </div>
            <div className="pb-1 pt-1">
                    <PartnersMarquee />
                </div>
        </div>
    )
}
