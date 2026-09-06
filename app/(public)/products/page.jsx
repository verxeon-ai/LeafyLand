'use client'
import { Suspense, useState, useEffect, useMemo, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import ProductCard from "@/components/ProductCard"
import { Search, Leaf, Store, Package } from 'lucide-react'
import { isMarketplaceCategory, getHomeProductGroup } from '@/lib/categories'
import { ProductGridSkeleton } from '@/components/CatalogSkeleton'
import { BRAND_GREEN, brandPrimaryCtaClass } from '@/lib/brand-ui'

const PAGE_SIZE = 60

function productListUrl({ search, city, category, group, deals, marketplace, offset }) {
    const params = new URLSearchParams()
    params.set('paginated', '1')
    params.set('limit', String(PAGE_SIZE))
    params.set('offset', String(offset || 0))
    if (search) params.set('search', search)
    if (city) params.set('city', city)
    if (category && category !== 'All') params.set('category', category)
    if (group) params.set('group', group)
    if (deals) params.set('deals', '1')
    if (marketplace) params.set('marketplace', '1')
    return `/api/products?${params.toString()}`
}

function productsPageHref(category, search, city, group, deals, marketplace) {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (category && category !== 'All') params.set('category', category)
    if (city) params.set('city', city)
    if (group) params.set('group', group)
    if (deals) params.set('deals', '1')
    if (marketplace) params.set('marketplace', '1')
    const qs = params.toString()
    return qs ? `/products?${qs}` : '/products'
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

function ProductsContent() {
    const searchParams = useSearchParams()
    const selectedCategory = searchParams.get('category') || 'All'
    const urlSearch = searchParams.get('search') || ''
    const city = searchParams.get('city') || ''
    const groupId = searchParams.get('group') || ''
    const dealsOnly = searchParams.get('deals') === '1'
    const marketplaceOnly = searchParams.get('marketplace') === '1'
    const homeGroup = getHomeProductGroup(groupId)

    const [search, setSearch] = useState(urlSearch)
    const [sortBy, setSortBy] = useState('featured')
    const [products, setProducts] = useState([])
    const [total, setTotal] = useState(0)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(true)
    const [loadingMore, setLoadingMore] = useState(false)
    const [nicheCategories, setNicheCategories] = useState([])

    const queryKey = `${urlSearch}|${city}|${selectedCategory}|${groupId}|${dealsOnly}|${marketplaceOnly}`

    const fetchPage = useCallback(async (offset, { append }) => {
        const url = productListUrl({
            search: urlSearch,
            city,
            category: selectedCategory,
            group: groupId,
            deals: dealsOnly,
            marketplace: marketplaceOnly,
            offset,
        })
        const res = await fetch(url, { cache: 'no-store' })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Could not load products')
        return normalizePage(data)
    }, [urlSearch, city, selectedCategory, groupId, dealsOnly, marketplaceOnly])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        setProducts([])
        setHasMore(false)
        setTotal(0)
        fetchPage(0, { append: false })
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
    }, [queryKey, fetchPage])

    useEffect(() => {
        setSearch(urlSearch)
    }, [urlSearch])

    useEffect(() => {
        let cancelled = false
        fetch('/api/products/niches')
            .then((r) => r.json())
            .then((data) => {
                if (cancelled || !Array.isArray(data)) return
                setNicheCategories(data.map((n) => n.name).filter(Boolean))
            })
            .catch(() => {})
        return () => { cancelled = true }
    }, [])

    const loadMore = async () => {
        if (loadingMore || !hasMore) return
        setLoadingMore(true)
        try {
            const page = await fetchPage(products.length, { append: true })
            setProducts((prev) => {
                const seen = new Set(prev.map((p) => p.id))
                const next = page.products.filter((p) => !seen.has(p.id))
                return [...prev, ...next]
            })
            setTotal(page.total)
            setHasMore(page.hasMore)
        } catch {
            /* keep existing list */
        } finally {
            setLoadingMore(false)
        }
    }

    const categories = useMemo(() => {
        const set = new Set(nicheCategories)
        products.forEach((p) => {
            if (p.category) set.add(p.category)
        })
        if (homeGroup) {
            homeGroup.categories.forEach((c) => set.add(c))
        }
        if (selectedCategory && selectedCategory !== 'All') set.add(selectedCategory)
        const list = ['All', ...Array.from(set).sort((a, b) => a.localeCompare(b))]
        return list
    }, [nicheCategories, products, selectedCategory, homeGroup])

    const allFiltered = products.filter((p) => {
        const matchSearch = !search
            || p.name.toLowerCase().includes(search.toLowerCase())
            || (p.category || '').toLowerCase().includes(search.toLowerCase())
        return matchSearch
    }).sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price
        if (sortBy === 'price-high') return b.price - a.price
        return 0
    })

    const filtered = [
        ...allFiltered.filter((p) => !isMarketplaceCategory(p.category)),
        ...allFiltered.filter((p) => isMarketplaceCategory(p.category)),
    ]

    const leafyCount = filtered.filter((p) => !isMarketplaceCategory(p.category)).length
    const marketplaceCount = filtered.filter((p) => isMarketplaceCategory(p.category)).length
    const pageTitle = city
        ? `Fast delivery in ${city}`
        : dealsOnly
            ? "Today's Deals"
            : marketplaceOnly
                ? 'Classifieds'
                : selectedCategory !== 'All'
                    ? selectedCategory
                    : homeGroup
                        ? homeGroup.title
                        : 'Products'
    const emptyMessage = city
        ? `No vendors in ${city} yet. Try another city from the navbar.`
        : dealsOnly
            ? 'No discounted products right now.'
            : marketplaceOnly
                ? 'No classifieds listed yet.'
                : selectedCategory !== 'All'
                    ? `No products found in ${selectedCategory}`
                    : search || urlSearch
                        ? 'No products found matching your search.'
                        : 'No products found.'

    const submitSearch = (e) => {
        e.preventDefault()
        const next = search.trim()
        window.location.href = productsPageHref(
            selectedCategory,
            next,
            city,
            groupId,
            dealsOnly,
            marketplaceOnly,
        )
    }

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
                            Showing {filtered.length}
                            {total > filtered.length ? ` of ${total}` : ''}
                            {' '}
                            {leafyCount > 0 && <span className="text-emerald-600 font-medium">{leafyCount} LeafyLand</span>}
                            {leafyCount > 0 && marketplaceCount > 0 && <span> + </span>}
                            {marketplaceCount > 0 && <span className="text-blue-600 font-medium">{marketplaceCount} Marketplace</span>}
                            {' '}products
                        </>
                    )}
                </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <form onSubmit={submitSearch} className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search plants, tools, accessories..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    />
                </form>
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
                {categories.map((cat) => (
                    <Link
                        key={cat}
                        href={productsPageHref(cat, urlSearch, city, groupId, dealsOnly, marketplaceOnly)}
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
                                {filtered.filter((p) => !isMarketplaceCategory(p.category)).map((product) => (
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
                                {filtered.filter((p) => isMarketplaceCategory(p.category)).map((product) => (
                                    <ProductCard key={product.id} product={product} fluid />
                                ))}
                            </div>
                        </div>
                    )}

                    {hasMore && (
                        <div className="flex justify-center pt-2 pb-6">
                            <button
                                type="button"
                                onClick={loadMore}
                                disabled={loadingMore}
                                className={`${brandPrimaryCtaClass} min-w-[10rem] px-6 py-2.5 disabled:opacity-60`}
                                style={{ backgroundColor: BRAND_GREEN }}
                            >
                                {loadingMore ? 'Loading…' : `Load more (${Math.min(PAGE_SIZE, Math.max(0, total - products.length))} more)`}
                            </button>
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
