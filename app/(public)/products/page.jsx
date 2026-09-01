'use client'
import { Suspense, useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ProductCard from "@/components/ProductCard"
import { Search, Leaf, Store, Package } from 'lucide-react'
import { cachedJson, peekCachedJson } from '@/lib/cachedJson'
import { isMarketplaceCategory } from '@/lib/categories'
import { ProductGridSkeleton } from '@/components/CatalogSkeleton'

function productListUrl(urlSearch) {
    if (!urlSearch) return '/api/products'
    return `/api/products?search=${encodeURIComponent(urlSearch)}`
}

function productsPageHref(category, search) {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category && category !== 'All') params.set('category', category)
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
}

function ProductsContent() {
    const searchParams = useSearchParams()
    const selectedCategory = searchParams.get('category') || 'All'
    const urlSearch = searchParams.get('search') || ''
    const listUrl = productListUrl(urlSearch)

    const cached = peekCachedJson(listUrl)
    const [search, setSearch] = useState(urlSearch)
    const [sortBy, setSortBy] = useState('featured')
    const [products, setProducts] = useState(() => Array.isArray(cached) ? cached : [])
    const [loading, setLoading] = useState(!Array.isArray(cached))

    useEffect(() => {
        let cancelled = false
        const url = productListUrl(urlSearch)
        const hit = peekCachedJson(url)
        if (Array.isArray(hit)) {
            setProducts(hit)
            setLoading(false)
        } else {
            setLoading(true)
        }
        cachedJson(url)
            .then((data) => { if (!cancelled && Array.isArray(data)) setProducts(data) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [urlSearch])

    useEffect(() => {
        setSearch(urlSearch)
    }, [urlSearch])

    const categories = useMemo(() => {
        const set = new Set(products.map((p) => p.category).filter(Boolean))
        if (selectedCategory && selectedCategory !== 'All') set.add(selectedCategory)
        return ['All', ...Array.from(set)]
    }, [products, selectedCategory])

    const allFiltered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
        const matchCategory = selectedCategory === 'All' || p.category === selectedCategory
        return matchSearch && matchCategory
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        return 0
    })

    const filtered = [
        ...allFiltered.filter(p => !isMarketplaceCategory(p.category)),
        ...allFiltered.filter(p => isMarketplaceCategory(p.category)),
    ]

    const leafyCount = filtered.filter(p => !isMarketplaceCategory(p.category)).length
    const marketplaceCount = filtered.filter(p => isMarketplaceCategory(p.category)).length
    const pageTitle = selectedCategory !== 'All' ? selectedCategory : 'Products'
    const emptyMessage = selectedCategory !== 'All'
        ? `No products found in ${selectedCategory}`
        : search
            ? 'No products found matching your search.'
            : 'No products found.'

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
            <div className="mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800">{pageTitle}</h1>
                <p className="text-sm text-slate-500 mt-1">
                    {loading ? (
                        'Finding products…'
                    ) : filtered.length === 0 ? (
                        emptyMessage
                    ) : (
                        <>
                            {leafyCount > 0 && <span className="text-emerald-600 font-medium">{leafyCount} LeafyLand</span>}
                            {leafyCount > 0 && marketplaceCount > 0 && <span> + </span>}
                            {marketplaceCount > 0 && <span className="text-blue-600 font-medium">{marketplaceCount} Marketplace</span>}
                            {' '}products found
                        </>
                    )}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search plants, tools, accessories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:border-emerald-500"
                >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                </select>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-4">
                {categories.map(cat => (
                    <Link
                        key={cat}
                        href={productsPageHref(cat, search)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-medium transition ${
                            selectedCategory === cat
                                ? 'bg-[#2f7d4a] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {cat}
                    </Link>
                ))}
            </div>

            {loading ? (
                <ProductGridSkeleton count={10} />
            ) : filtered.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
                    <Package size={36} className="mx-auto text-slate-300 mb-3" />
                    <p className="text-sm sm:text-base font-medium text-slate-700">{emptyMessage}</p>
                    <p className="text-xs text-slate-500 mt-1.5">Try another category or clear your filters.</p>
                    <Link
                        href="/products"
                        className="mt-4 inline-block text-emerald-600 text-sm font-semibold hover:underline"
                    >
                        Clear filters
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {leafyCount > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full">
                                    <Leaf size={12} /> LeafyLand
                                </span>
                                <div className="flex-1 h-px bg-emerald-100" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {filtered.filter(p => !isMarketplaceCategory(p.category)).map(product => (
                                    <ProductCard key={product.id} product={product} fluid />
                                ))}
                            </div>
                        </div>
                    )}

                    {marketplaceCount > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                    <Store size={12} /> Marketplace
                                </span>
                                <div className="flex-1 h-px bg-blue-100" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                                {filtered.filter(p => isMarketplaceCategory(p.category)).map(product => (
                                    <ProductCard key={product.id} product={product} fluid />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const ProductsPage = () => (
    <Suspense fallback={<div className="flex-1 min-h-[50vh]" />}>
        <ProductsContent />
    </Suspense>
)

export default ProductsPage
