'use client'
import { memo } from 'react'
import { ShoppingCart, Star } from 'lucide-react'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '@/lib/features/cart/cartSlice'
import toast from 'react-hot-toast'
import WishlistButton from '@/components/WishlistButton'
import CatalogImage from '@/components/CatalogImage'
import { BRAND_GREEN } from '@/lib/brand-ui'

const currency = '₹'

function formatReviewCount(count) {
    if (count >= 1000) {
        const k = count / 1000
        return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`
    }
    return String(count)
}

function getRatingInfo(product) {
    const count = product.reviewCount ?? (product.rating || []).length
    if (!count) return { avg: null, count: 0 }
    if (typeof product.avgRating === 'number') {
        return { avg: Math.round(product.avgRating * 10) / 10, count }
    }
    const ratings = product.rating || []
    const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0)
    const avg = Math.round((sum / ratings.length) * 10) / 10
    return { avg, count }
}

const ProductCard = ({ product, fluid = false }) => {
    const dispatch = useDispatch()
    const cart = useSelector((state) => state.cart?.cartItems) || {}
    const inCart = Boolean(cart[product.id])

    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
    const savings = product.mrp && product.mrp > product.price ? Math.round(product.mrp - product.price) : 0
    const { avg: rating, count: reviewCount } = getRatingInfo(product)

    const handleAdd = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!product.inStock) {
            toast.error('Out of stock')
            return
        }
        dispatch(addToCart({ productId: product.id }))
        toast.success(inCart ? 'Updated cart' : 'Added to cart')
    }

    return (
        <article className={`${fluid ? 'w-full min-w-0' : 'w-[172px] sm:w-[188px] flex-shrink-0'} flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden`}>
            <Link href={`/products/${product.id}`} className="group block">
                <div className="relative aspect-square bg-slate-50 overflow-hidden">
                    {product.images?.[0] ? (
                        <CatalogImage
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                            src={product.images[0]}
                            alt={product.name}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 188px"
                        />
                    ) : (
                        <div className="w-full h-full bg-slate-100" />
                    )}

                    {discount > 0 && (
                        <span
                            className="absolute top-2 left-2 rounded-xl px-2 py-0.5 text-[10px] font-bold text-white"
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            {discount}% OFF
                        </span>
                    )}

                    <div className="absolute top-2 right-2 z-10">
                        <WishlistButton
                            itemId={product.id}
                            itemType="product"
                            className="p-1.5 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-white"
                            activeClassName="text-emerald-600 fill-emerald-600"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleAdd}
                        className="absolute bottom-2 right-2 z-10 rounded-xl border bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm transition-colors hover:bg-emerald-50"
                        style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
                    >
                        ADD
                    </button>
                </div>

                <div className="px-2.5 pt-2.5 pb-2">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-base font-bold text-slate-900 leading-none">
                            {currency}{product.price.toLocaleString('en-IN')}
                        </span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-xs text-slate-400 line-through">
                                {currency}{product.mrp.toLocaleString('en-IN')}
                            </span>
                        )}
                    </div>

                    {savings > 0 && (
                        <p className="mt-1 text-[11px] font-semibold" style={{ color: BRAND_GREEN }}>
                            {currency}{savings.toLocaleString('en-IN')} OFF
                        </p>
                    )}

                    <h3 className="mt-1.5 text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                        {product.name}
                    </h3>

                    <p className="mt-0.5 text-[11px] text-slate-400 truncate">{product.category}</p>

                    {rating != null ? (
                        <div className="mt-1.5 flex items-center gap-1">
                            <Star size={12} fill={BRAND_GREEN} className="shrink-0" style={{ color: BRAND_GREEN }} />
                            <span className="text-xs font-semibold text-slate-700">{rating}</span>
                            {reviewCount > 0 && (
                                <span className="text-[11px] text-slate-400">
                                    ({formatReviewCount(reviewCount)})
                                </span>
                            )}
                        </div>
                    ) : (
                        <div className="mt-1.5 h-[18px]" aria-hidden />
                    )}
                </div>
            </Link>

            <div className="mt-auto px-2.5 pb-2.5 flex items-stretch gap-1.5">
                <button
                    type="button"
                    onClick={handleAdd}
                    className="shrink-0 flex items-center justify-center w-9 rounded-xl border border-slate-200 bg-white transition-colors hover:bg-emerald-50"
                    style={{ color: BRAND_GREEN }}
                    aria-label="Add to cart"
                >
                    <ShoppingCart size={16} strokeWidth={2} />
                </button>
                <button
                    type="button"
                    onClick={handleAdd}
                    disabled={!product.inStock}
                    className="flex-1 min-w-0 flex items-center justify-center rounded-xl py-2 px-2 text-xs font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ backgroundColor: BRAND_GREEN }}
                >
                    {product.inStock ? 'Add to Cart' : 'Out of stock'}
                </button>
            </div>
        </article>
    )
}

export default memo(ProductCard)
