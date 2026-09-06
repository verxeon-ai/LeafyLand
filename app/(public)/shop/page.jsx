'use client'
import { Suspense, useState, useEffect, useCallback } from 'react'
import ProductCard from '@/components/ProductCard'
import { MoveLeftIcon } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ProductGridSkeleton } from '@/components/CatalogSkeleton'
import { BRAND_GREEN, brandPrimaryCtaClass } from '@/lib/brand-ui'

const PAGE_SIZE = 60

function shopListUrl(search, offset) {
    const params = new URLSearchParams()
    params.set('paginated', '1')
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String(offset || 0))
    if (search) params.set('search', search)
    return `/api/products?${params.toString()}`
}

function normalizePage(data) {
    if (Array.isArray(data)) {
        return { products: data, total: data.length, hasMore: false }
    }
    if (data && Array.isArray(data.products)) {
        return {
            products: data.products,
            total: Number(data.total) || data.products.length,
            hasMore: Boolean(data.hasMore),
        }
    }
    return { products: [], total: 0, hasMore: false }
}

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search') || ''
    const router = useRouter()

    const [products, setProducts] = useState([])
    const [total, setTotal] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)

    const fetchPage = useCallback(async (offset) => {
        const res = await fetch(shopListUrl(search, offset), { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Could not load products')
        return normalizePage(data)
    }, [search])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setProducts([])
        fetchPage(0)
            .then((page) => {
                if (cancelled) return
                setProducts(page.products)
                setTotal(page.total)
                setHasMore(page.hasMore)
            })
            .catch(() => {
                if (!cancelled) {
                    setProducts([])
                    setTotal(0)
                    setHasMore(false)
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [fetchPage])

    const loadMore = async () => {
        if (loadingMore || !hasMore) return
        setLoadingMore(true)
        try {
            const page = await fetchPage(products.length)
            setProducts((prev) => {
                const seen = new Set(prev.map((p) => p.id))
                return [...prev, ...page.products.filter((p) => !seen.has(p.id))]
            })
            setTotal(page.total)
            setHasMore(page.hasMore)
        } catch {
            /* keep list */
        } finally {
            setLoadingMore(false)
        }
    }

    return (
        <div className="min-h-[70vh] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <h1
                    onClick={() => router.push('/shop')}
                    className="text-xl sm:text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"
                >
                    {search && <MoveLeftIcon size={20} />} All{' '}
                    <span className="text-slate-700 font-medium">Products</span>
                </h1>
                {!loading && products.length > 0 && (
                    <p className="text-sm text-slate-500 -mt-3 mb-4">
                        Showing {products.length}{total > products.length ? ` of ${total}` : ''} products
                    </p>
                )}
                {loading ? (
                    <ProductGridSkeleton count={10} />
                ) : products.length === 0 ? (
                    <p className="text-slate-500 text-sm">No products found.</p>
                ) : (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mx-auto mb-8">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} fluid />
                            ))}
                        </div>
                        {hasMore && (
                            <div className="flex justify-center pb-32">
                                <button
                                    type="button"
                                    onClick={loadMore}
                                    disabled={loadingMore}
                                    className={`${brandPrimaryCtaClass} min-w-[10rem] px-6 py-2.5 disabled:opacity-60`}
                                    style={{ backgroundColor: BRAND_GREEN }}
                                >
                                    {loadingMore ? 'Loading…' : 'Load more'}
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[70vh] px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto py-6">
                        <ProductGridSkeleton count={10} />
                    </div>
                </div>
            }
        >
            <ShopContent />
        </Suspense>
    )
}
