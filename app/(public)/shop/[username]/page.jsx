'use client'
import ProductCard from '@/components/ProductCard'
import { useParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { MailIcon, MapPinIcon } from 'lucide-react'
import CatalogImage from '@/components/CatalogImage'
import { ProductGridSkeleton } from '@/components/CatalogSkeleton'
import { BRAND_GREEN, brandPrimaryCtaClass } from '@/lib/brand-ui'

const PAGE_SIZE = 60

export default function StoreShop() {
    const { username } = useParams()
    const [products, setProducts] = useState([])
    const [storeInfo, setStoreInfo] = useState(null)
    const [total, setTotal] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [notFound, setNotFound] = useState(false)

    const fetchPage = useCallback(async (offset) => {
        const params = new URLSearchParams({
            paginated: '1',
            limit: String(PAGE_SIZE),
            offset: String(offset || 0),
        })
        const res = await fetch(`/api/shops/${username}?${params}`, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Store not found')
        return data
    }, [username])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setProducts([])
        setNotFound(false)
        fetchPage(0)
            .then((data) => {
                if (cancelled) return
                if (data?.error || (!data?.id && !data?.name)) {
                    setNotFound(true)
                    setStoreInfo(null)
                    return
                }
                setStoreInfo(data)
                setProducts(Array.isArray(data.products) ? data.products : [])
                setTotal(Number(data.total) || 0)
                setHasMore(Boolean(data.hasMore))
            })
            .catch(() => {
                if (!cancelled) setNotFound(true)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => { cancelled = true }
    }, [username, fetchPage])

    const loadMore = async () => {
        if (loadingMore || !hasMore) return
        setLoadingMore(true)
        try {
            const data = await fetchPage(products.length)
            const next = Array.isArray(data.products) ? data.products : []
            setProducts((prev) => {
                const seen = new Set(prev.map((p) => p.id))
                return [...prev, ...next.filter((p) => !seen.has(p.id))]
            })
            setTotal(Number(data.total) || 0)
            setHasMore(Boolean(data.hasMore))
        } catch {
            /* keep list */
        } finally {
            setLoadingMore(false)
        }
    }

    if (notFound && !loading) {
        return (
            <div className="min-h-[70vh] px-4 sm:px-6 flex flex-col items-center justify-center text-center">
                <p className="text-slate-500 text-sm">Store not found.</p>
            </div>
        )
    }

    return (
        <div className="min-h-[70vh] px-4 sm:px-6">
            {storeInfo ? (
                <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 shadow-xs">
                    {storeInfo.logo ? (
                        <CatalogImage
                            src={storeInfo.logo}
                            alt={storeInfo.name}
                            className="size-32 sm:size-38 object-cover border-2 border-slate-100 rounded-md"
                            width={200}
                            height={200}
                        />
                    ) : (
                        <div className="size-32 sm:size-38 bg-slate-200 rounded-md" />
                    )}
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-semibold text-slate-800">{storeInfo.name}</h1>
                        <p className="text-sm text-slate-600 mt-2 max-w-lg">{storeInfo.description}</p>
                        <div className="space-y-2 text-sm text-slate-500 mt-4">
                            {storeInfo.address && (
                                <div className="flex items-center">
                                    <MapPinIcon className="w-4 h-4 text-gray-500 mr-2" />
                                    <span>{storeInfo.address}</span>
                                </div>
                            )}
                            {storeInfo.email && (
                                <div className="flex items-center">
                                    <MailIcon className="w-4 h-4 text-gray-500 mr-2" />
                                    <span>{storeInfo.email}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto bg-slate-50 rounded-xl p-6 md:p-10 mt-6 flex flex-col md:flex-row items-center gap-6 animate-pulse">
                    <div className="size-32 sm:size-38 bg-slate-200 rounded-md" />
                    <div className="flex-1 space-y-3 w-full max-w-lg">
                        <div className="h-8 w-48 bg-slate-200 rounded" />
                        <div className="h-4 w-full bg-slate-200 rounded" />
                        <div className="h-4 w-2/3 bg-slate-200 rounded" />
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto mb-40">
                <h1 className="text-2xl mt-12">
                    Shop <span className="text-slate-800 font-medium">Products</span>
                </h1>
                {!loading && products.length > 0 && (
                    <p className="text-sm text-slate-500 mt-2">
                        Showing {products.length}{total > products.length ? ` of ${total}` : ''} products
                    </p>
                )}
                {loading && products.length === 0 ? (
                    <div className="mt-5">
                        <ProductGridSkeleton count={10} />
                    </div>
                ) : (
                    <>
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mx-auto">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} fluid />
                            ))}
                        </div>
                        {hasMore && (
                            <div className="flex justify-center mt-8">
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
