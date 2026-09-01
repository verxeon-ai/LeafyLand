'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import ProductDetails from '@/components/ProductDetails'
import ProductDescription from '@/components/ProductDescription'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { cachedJson, peekDetail } from '@/lib/cachedJson'
import { DetailSkeleton } from '@/components/CatalogSkeleton'

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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
                <p className="text-slate-500 text-sm">Product not found.</p>
                <Link href="/products" className="mt-3 inline-block text-emerald-600 text-sm font-medium hover:underline">
                    Back to Products
                </Link>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Link href="/products" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 mb-6 transition">
                <ChevronLeft size={16} /> Back to Products
            </Link>
            <ProductDetails key={product.id} product={product} />
            <ProductDescription product={product} />
        </div>
    )
}

export default ProductPage
