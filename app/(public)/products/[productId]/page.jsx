'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProductDetails from '@/components/ProductDetails'
import ProductDescription from '@/components/ProductDescription'
import ProductTrustMarquee from '@/components/ProductTrustMarquee'
import RelatedProducts from '@/components/RelatedProducts'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cachedJson, peekDetail } from '@/lib/cachedJson'
import { DetailSkeleton } from '@/components/CatalogSkeleton'
import { isLeafyCategory, isMarketplaceCategory } from '@/lib/categories'

const ProductPage = () => {
    const { productId } = useParams()
    const detailUrl = `/api/products/${productId}`
    const initial = peekDetail(detailUrl, '/api/products', productId)
    const [product, setProduct] = useState(() => (initial?.id ? initial : null))
    const [loading, setLoading] = useState(!initial?.id)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        let cancelled = false
        setNotFound(false)
        const hit = peekDetail(detailUrl, '/api/products', productId)
        if (hit?.id) {
            setProduct(hit)
            setLoading(false)
        } else {
            setLoading(true)
            setProduct(null)
        }
        cachedJson(detailUrl)
            .then((data) => {
                if (cancelled) return
                if (data?.error || !data?.id) {
                    setNotFound(true)
                    setProduct(null)
                    return
                }
                setProduct(data)
            })
            .catch(() => { if (!cancelled) setNotFound(true) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [productId, detailUrl])

    if (loading) return <DetailSkeleton />

    if (notFound || !product) {
        return (
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-20 text-center">
                <p className="text-slate-500 text-sm">Product not found.</p>
                <Link href="/products" className="mt-3 inline-block text-emerald-600 text-sm font-medium hover:underline">
                    Back to Products
                </Link>
            </div>
        )
    }

    const crumbs = [
        { label: 'Home', href: '/' },
        { label: 'Shop', href: '/shop' },
    ]
    if (isLeafyCategory(product.category)) {
        crumbs.push({ label: 'Plants & Gardening', href: '/products?group=leafyland' })
    } else if (isMarketplaceCategory(product.category)) {
        crumbs.push({ label: 'Marketplace', href: '/products?group=marketplace' })
    }
    if (product.category) {
        crumbs.push({
            label: product.category,
            href: `/products?category=${encodeURIComponent(product.category)}`,
        })
    }
    crumbs.push({ label: product.name })

    return (
        <div className="mx-auto w-full max-w-[90rem] px-3 sm:px-4 lg:px-6 py-5 pb-12">
            <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1 text-xs sm:text-sm text-slate-400">
                {crumbs.map((crumb, i) => {
                    const last = i === crumbs.length - 1
                    return (
                        <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-1 min-w-0">
                            {i > 0 && <ChevronRight size={14} className="shrink-0 text-slate-300" />}
                            {last || !crumb.href ? (
                                <span className="truncate font-medium text-slate-600 max-w-[12rem] sm:max-w-none">
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link href={crumb.href} className="hover:text-emerald-700 transition truncate">
                                    {crumb.label}
                                </Link>
                            )}
                        </span>
                    )
                })}
            </nav>

            <ProductDetails key={product.id} product={product} />
            <div id="product-description">
                <ProductDescription product={product} />
            </div>
            <ProductTrustMarquee />
            <RelatedProducts product={product} />
        </div>
    )
}

export default ProductPage
