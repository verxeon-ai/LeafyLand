'use client'
import { useEffect, useState } from 'react'
import Carousel from '@/components/Carousel'
import ExploreCategories from '@/components/ExploreCategories'
import NearYouProducts from '@/components/NearYouProducts'
import PartnersMarquee from '@/components/PartnersMarquee'
import FeaturedSection from '@/components/FeaturedSection'
import ProductCard from '@/components/ProductCard'
import { HOME_PRODUCT_GROUPS } from '@/lib/categories'
import { ProductGridSkeleton, ServiceGridSkeleton } from '@/components/CatalogSkeleton'
import ServicesBanner from '@/components/ServicesBanner'
import ServiceCategoryCard from '@/components/ServiceCategoryCard'

const GROUP_LIMIT = 12

function normalizeProducts(data) {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.products)) return data.products
    return []
}

export default function Home() {
    const [groups, setGroups] = useState([])
    const [services, setServices] = useState([])
    const [catalogReady, setCatalogReady] = useState(false)
    const [servicesReady, setServicesReady] = useState(false)

    useEffect(() => {
        let cancelled = false

        Promise.all(
            HOME_PRODUCT_GROUPS.map(async (group) => {
                try {
                    const res = await fetch(
                        `/api/products?paginated=1&limit=${GROUP_LIMIT}&group=${encodeURIComponent(group.id)}`,
                        { cache: 'no-store' },
                    )
                    const data = await res.json()
                    const items = normalizeProducts(data).slice(0, GROUP_LIMIT)
                    return { ...group, items }
                } catch {
                    return { ...group, items: [] }
                }
            }),
        )
            .then((rows) => {
                if (cancelled) return
                setGroups(rows.filter((g) => g.items.length > 0))
            })
            .finally(() => {
                if (!cancelled) setCatalogReady(true)
            })

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

            <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-4 lg:px-6 flex-1">
                <NearYouProducts />
                <div className="pb-1 pt-1">
                    <PartnersMarquee />
                </div>
                {!catalogReady && groups.length === 0 && (
                    <div className="py-5">
                        <div className="h-5 w-36 bg-slate-100 rounded mb-3 animate-pulse" />
                        <ProductGridSkeleton count={5} />
                    </div>
                )}
                {groups.map((group) => (
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
                    <div className="py-5 pb-8">
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
            </div>
        </div>
    )
}
