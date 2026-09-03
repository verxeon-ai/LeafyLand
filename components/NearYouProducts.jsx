'use client'
import { useEffect, useState } from 'react'
import { Truck } from 'lucide-react'
import FeaturedSection from '@/components/FeaturedSection'
import ProductCard from '@/components/ProductCard'
import { cachedJson } from '@/lib/cachedJson'
import { DEFAULT_CITY, LOCATION_EVENT, LOCATION_KEY, getSavedLocation } from '@/lib/location'
import { BRAND_GREEN } from '@/lib/brand-ui'

export default function NearYouProducts() {
    const [city, setCity] = useState(DEFAULT_CITY)
    const [products, setProducts] = useState([])
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const apply = (next) => setCity(next || getSavedLocation())
        apply(getSavedLocation())
        const onCustom = (e) => apply(e.detail)
        const onStorage = (e) => {
            if (e.key === LOCATION_KEY && e.newValue) apply(e.newValue)
        }
        window.addEventListener(LOCATION_EVENT, onCustom)
        window.addEventListener('storage', onStorage)
        return () => {
            window.removeEventListener(LOCATION_EVENT, onCustom)
            window.removeEventListener('storage', onStorage)
        }
    }, [])

    useEffect(() => {
        if (!city) return
        let cancelled = false
        setReady(false)
        cachedJson(`/api/products?city=${encodeURIComponent(city)}&limit=12`)
            .then((data) => {
                if (cancelled) return
                setProducts(Array.isArray(data) ? data : [])
            })
            .catch(() => {
                if (!cancelled) setProducts([])
            })
            .finally(() => {
                if (!cancelled) setReady(true)
            })
        return () => { cancelled = true }
    }, [city])

    if (!ready || products.length === 0) return null

    return (
        <FeaturedSection
            title={
                <span className="inline-flex items-center gap-2">
                    <span
                        className="hidden sm:inline-flex items-center justify-center w-7 h-7 rounded-full"
                        style={{ backgroundColor: '#eef4ef', color: BRAND_GREEN }}
                    >
                        <Truck size={14} strokeWidth={2.25} />
                    </span>
                    Fast Delivery
                </span>
            }
            subtitle={`Recommended near you in ${city}`}
            items={products}
            viewAllLink={`/products?city=${encodeURIComponent(city)}`}
            renderItem={(product) => <ProductCard product={product} />}
        />
    )
}
