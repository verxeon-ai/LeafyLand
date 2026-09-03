'use client'
import { useEffect, useState } from 'react'
import Carousel from "@/components/Carousel";
import ExploreCategories from "@/components/ExploreCategories";
import NearYouProducts from "@/components/NearYouProducts";
import PartnersMarquee from "@/components/PartnersMarquee";
import FeaturedSection from "@/components/FeaturedSection";
import ProductCard from "@/components/ProductCard";
import { cachedJson } from '@/lib/cachedJson'
import { HOME_PRODUCT_GROUPS } from '@/lib/categories'
import { ProductGridSkeleton, ServiceGridSkeleton } from "@/components/CatalogSkeleton";
import ServicesBanner from "@/components/ServicesBanner";
import ServiceCategoryCard from "@/components/ServiceCategoryCard";

function pickGroupProducts(products, categories, limit = 10) {
    const inGroup = products.filter((p) => categories.includes(p.category))
    const featured = inGroup.filter((p) => p.featured)
    const rest = inGroup.filter((p) => !p.featured)
    return [...featured, ...rest].slice(0, limit)
}

export default function Home() {
    const [products, setProducts] = useState([])
    const [services, setServices] = useState([])
    const [catalogReady, setCatalogReady] = useState(false)
    const [servicesReady, setServicesReady] = useState(false)

    useEffect(() => {
        let cancelled = false
        cachedJson('/api/products').then((p) => {
            if (cancelled) return
            if (Array.isArray(p)) setProducts(p)
            setCatalogReady(true)
        }).catch(() => { if (!cancelled) setCatalogReady(true) })
        cachedJson('/api/services').then((s) => {
            if (cancelled) return
            if (Array.isArray(s)) setServices(s)
            setServicesReady(true)
        }).catch(() => { if (!cancelled) setServicesReady(true) })
        return () => { cancelled = true }
    }, [])

    const groups = HOME_PRODUCT_GROUPS.map((group) => ({
        ...group,
        items: pickGroupProducts(products, group.categories),
    })).filter((group) => group.items.length > 0)

    const vendorServices = services.slice(0, 10)

    return (
        <div className="bg-slate-50/50 flex-1 flex flex-col">
            {/* Carousel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2 w-full">
                <Carousel />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 w-full">
                <ExploreCategories />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1">
                <NearYouProducts />
                <div className="pb-1 pt-1">
                    <PartnersMarquee />
                </div>
                {!catalogReady && products.length === 0 && (
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
    );
}
