'use client'
import { Suspense, useState, useEffect } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { cachedJson, peekCachedJson } from '@/lib/cachedJson'
import { ProductGridSkeleton } from '@/components/CatalogSkeleton'

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const router = useRouter()

    const [products, setProducts] = useState(() => Array.isArray(peekCachedJson('/api/products')) ? peekCachedJson('/api/products') : [])
    const [loading, setLoading] = useState(() => !Array.isArray(peekCachedJson('/api/products')))

    useEffect(() => {
        let cancelled = false
        cachedJson('/api/products')
            .then((data) => { if (!cancelled && Array.isArray(data)) setProducts(data) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [])

    const filteredProducts = search
        ? products.filter(product =>
            product.name.toLowerCase().includes(search.toLowerCase())
        )
        : products;

    return (
        <div className="min-h-[70vh] px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <h1 onClick={() => router.push('/shop')} className="text-xl sm:text-2xl text-slate-500 my-6 flex items-center gap-2 cursor-pointer"> {search && <MoveLeftIcon size={20} />}  All <span className="text-slate-700 font-medium">Products</span></h1>
                {loading ? (
                    <ProductGridSkeleton count={10} />
                ) : filteredProducts.length === 0 ? (
                    <p className="text-slate-500 text-sm">No products found.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mx-auto mb-32">
                        {filteredProducts.map((product) => <ProductCard key={product.id} product={product} fluid />)}
                    </div>
                )}
            </div>
        </div>
    )
}


export default function Shop() {
  return (
    <Suspense fallback={<div className="min-h-[70vh] px-4 sm:px-6"><div className="max-w-7xl mx-auto py-6"><ProductGridSkeleton count={10} /></div></div>}>
      <ShopContent />
    </Suspense>
  );
}
