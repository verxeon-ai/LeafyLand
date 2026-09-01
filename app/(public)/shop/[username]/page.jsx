'use client'
import ProductCard from "@/components/ProductCard"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MailIcon, MapPinIcon } from "lucide-react"
import CatalogImage from '@/components/CatalogImage'
import { cachedJson, peekCachedJson } from '@/lib/cachedJson'
import { ProductGridSkeleton } from '@/components/CatalogSkeleton'

export default function StoreShop() {
    const { username } = useParams()
    const shopUrl = `/api/shops/${username}`
    const cached = peekCachedJson(shopUrl)
    const [products, setProducts] = useState(() => Array.isArray(cached?.products) ? cached.products : [])
    const [storeInfo, setStoreInfo] = useState(() => (cached?.id || cached?.name ? cached : null))
    const [loading, setLoading] = useState(!cached?.name)
    const [notFound, setNotFound] = useState(false)

    useEffect(() => {
        let cancelled = false
        const hit = peekCachedJson(shopUrl)
        if (hit?.name) {
            setStoreInfo(hit)
            setProducts(hit.products || [])
            setLoading(false)
        }
        cachedJson(shopUrl)
            .then((data) => {
                if (cancelled) return
                if (data?.error || (!data?.id && !data?.name)) {
                    setNotFound(true)
                    setStoreInfo(null)
                    return
                }
                setStoreInfo(data)
                setProducts(data.products || [])
            })
            .catch(() => { if (!cancelled) setNotFound(true) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [username, shopUrl])

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
                        <div className="text-xs text-slate-500 mt-4 space-y-1"></div>
                        <div className="space-y-2 text-sm text-slate-500">
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

            <div className=" max-w-7xl mx-auto mb-40">
                <h1 className="text-2xl mt-12">Shop <span className="text-slate-800 font-medium">Products</span></h1>
                {loading && products.length === 0 ? (
                    <div className="mt-5">
                        <ProductGridSkeleton count={10} />
                    </div>
                ) : (
                    <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mx-auto">
                        {products.map((product) => <ProductCard key={product.id} product={product} fluid />)}
                    </div>
                )}
            </div>
        </div>
    )
}
