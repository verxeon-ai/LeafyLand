'use client'

import { useEffect, useState } from 'react'
import FeaturedSection from '@/components/FeaturedSection'
import ProductCard from '@/components/ProductCard'

function normalizeProducts(data) {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.products)) return data.products
    return []
}

export default function RelatedProducts({ product }) {
    const [items, setItems] = useState([])

    useEffect(() => {
        if (!product?.id) return
        let cancelled = false
        const params = new URLSearchParams({
            paginated: '1',
            limit: '12',
        })
        if (product.category) params.set('category', product.category)

        fetch(`/api/products?${params}`, { cache: 'no-store' })
            .then((r) => r.json())
            .then((data) => {
                if (cancelled) return
                const list = normalizeProducts(data)
                    .filter((p) => p.id !== product.id)
                    .slice(0, 10)
                setItems(list)
            })
            .catch(() => {
                if (!cancelled) setItems([])
            })

        return () => { cancelled = true }
    }, [product?.id, product?.category])

    if (!items.length) return null

    const viewAll = product.category
        ? `/products?category=${encodeURIComponent(product.category)}`
        : '/products'

    return (
        <div className="mt-6 pt-2">
            <FeaturedSection
                title="Related products"
                subtitle={product.category ? `More in ${product.category}` : 'You may also like'}
                items={items}
                viewAllLink={viewAll}
                renderItem={(p) => <ProductCard product={p} />}
            />
        </div>
    )
}
