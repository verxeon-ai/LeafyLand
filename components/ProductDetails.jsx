'use client'

import { addToCart } from '@/lib/features/cart/cartSlice'
import { toastAddedToCart } from '@/components/cart/toastAddedToCart'
import {
    Star, Truck, Shield, Package, MapPin, Zap, ShoppingCart,
    ChevronLeft, ChevronRight, Minus, Plus, User,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import WishlistButton from './WishlistButton'
import CatalogImage from './CatalogImage'
import { BRAND_GREEN, brandPrimaryCtaClass, brandSecondaryCtaClass } from '@/lib/brand-ui'
import {
    DEFAULT_CITY, LOCATION_EVENT, getSavedLocation, setSavedLocation,
} from '@/lib/location'

const DELIVERY_CITIES = [
    'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune',
    'Ahmedabad', 'Kolkata', 'Jaipur', 'Lucknow', 'Chandigarh', 'Indore',
]

const THUMB_VISIBLE = 5

const ProductDetails = ({ product }) => {
    const productId = product.id
    const currency = '₹'
    const router = useRouter()
    const cart = useSelector((state) => state.cart.cartItems)
    const dispatch = useDispatch()

    const images = product.images?.length ? product.images : []
    const [activeIndex, setActiveIndex] = useState(0)
    const [qty, setQty] = useState(1)
    const [city, setCity] = useState(DEFAULT_CITY)
    const [cityOpen, setCityOpen] = useState(false)

    const mainImage = images[activeIndex] || images[0]

    useEffect(() => {
        setActiveIndex(0)
        setQty(1)
    }, [productId])

    useEffect(() => {
        setCity(getSavedLocation())
        const onLoc = (e) => setCity(e.detail || getSavedLocation())
        window.addEventListener(LOCATION_EVENT, onLoc)
        return () => window.removeEventListener(LOCATION_EVENT, onLoc)
    }, [])

    const available =
        typeof product.stock === 'number'
            ? product.stock > 0
            : product.inStock !== false

    const maxQty = typeof product.stock === 'number' && product.stock > 0
        ? product.stock
        : 99

    const reviewCount = product.rating?.length || product.reviewCount || 0
    const averageRating = product.rating?.length
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
        : (product.avgRating || 0)
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0

    const visibleThumbs = images.slice(0, THUMB_VISIBLE)
    const extraThumbs = Math.max(0, images.length - THUMB_VISIBLE)

    const goPrev = () => {
        if (!images.length) return
        setActiveIndex((i) => (i - 1 + images.length) % images.length)
    }
    const goNext = () => {
        if (!images.length) return
        setActiveIndex((i) => (i + 1) % images.length)
    }

    const addQtyToCart = () => {
        if (!available) return
        const alreadyInCart = Boolean(cart[productId])
        for (let i = 0; i < qty; i++) {
            dispatch(addToCart({ productId }))
        }
        toastAddedToCart({ name: product.name, alreadyInCart })
    }

    const buyNowHandler = () => {
        if (!available) return
        const inCart = cart[productId] || 0
        const need = Math.max(qty, 1) - inCart
        for (let i = 0; i < need; i++) {
            dispatch(addToCart({ productId }))
        }
        router.push('/checkout')
    }

    const pickCity = (name) => {
        setSavedLocation(name)
        setCity(name)
        setCityOpen(false)
    }

    return (
        <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-10 lg:items-stretch">
            {/* Gallery — image height matches purchase column through Deliver to */}
            <div className="min-w-0 lg:h-full">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 group lg:aspect-auto lg:h-full lg:min-h-[320px]">
                    {mainImage ? (
                        <CatalogImage
                            src={mainImage}
                            alt={product.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-sm text-slate-400">
                            No image
                        </div>
                    )}

                    {discount > 0 && (
                        <span
                            className="absolute left-3 top-3 z-10 rounded-xl px-2.5 py-1 text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            {discount}% OFF
                        </span>
                    )}

                    <div className="absolute right-3 top-3 z-10">
                        <WishlistButton
                            itemId={product.id}
                            itemType="product"
                            className="shadow-sm bg-white hover:bg-white"
                        />
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={goPrev}
                                aria-label="Previous image"
                                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm opacity-0 transition group-hover:opacity-100 hover:bg-white"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <button
                                type="button"
                                onClick={goNext}
                                aria-label="Next image"
                                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm opacity-0 transition group-hover:opacity-100 hover:bg-white"
                            >
                                <ChevronRight size={18} />
                            </button>
                            <div className="absolute inset-x-0 bottom-0 z-10 flex gap-2 overflow-x-auto no-scrollbar p-3 bg-gradient-to-t from-black/25 to-transparent">
                                {visibleThumbs.map((image, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setActiveIndex(index)}
                                        className={`relative size-14 sm:size-16 shrink-0 overflow-hidden rounded-full bg-white/90 transition ${
                                            activeIndex === index
                                                ? 'ring-2 ring-[#2f7d4a] ring-offset-1'
                                                : 'hover:ring-2 hover:ring-white'
                                        }`}
                                    >
                                        <CatalogImage src={image} alt="" fill className="object-cover" sizes="64px" />
                                    </button>
                                ))}
                                {extraThumbs > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setActiveIndex(THUMB_VISIBLE)}
                                        className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-full bg-white/90 text-xs font-semibold text-slate-700"
                                    >
                                        +{extraThumbs} more
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Purchase column — drives gallery height through Deliver to */}
            <div className="min-w-0 lg:h-full">
                <span
                    className="inline-block rounded-xl px-3 py-1 text-xs font-medium"
                    style={{ color: BRAND_GREEN, backgroundColor: '#eef4ef' }}
                >
                    {product.category}
                </span>

                <h1
                    className="mt-3 text-2xl sm:text-3xl font-bold leading-snug tracking-tight"
                    style={{ color: '#1a5c35' }}
                >
                    {product.name}
                </h1>

                <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    {averageRating > 0 ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-800">
                            {averageRating.toFixed(1)}
                            <Star size={14} className="text-transparent" fill={BRAND_GREEN} />
                        </span>
                    ) : null}
                    {reviewCount > 0 && (
                        <button
                            type="button"
                            className="text-slate-500 hover:underline"
                            onClick={() => {
                                document.getElementById('product-description')?.scrollIntoView({ behavior: 'smooth' })
                            }}
                        >
                            ({reviewCount} reviews)
                        </button>
                    )}
                    <span className="inline-flex items-center gap-1 text-slate-500">
                        <User size={13} style={{ color: BRAND_GREEN }} />
                        Sold by{' '}
                        {product.storeUsername ? (
                            <Link
                                href={`/shop/${product.storeUsername}`}
                                className="font-medium hover:underline"
                                style={{ color: BRAND_GREEN }}
                            >
                                {product.storeName || 'LeafyLand'}
                            </Link>
                        ) : (
                            <span className="font-medium text-slate-700">{product.storeName || 'LeafyLand'}</span>
                        )}
                    </span>
                </div>

                <div className="mt-5 flex flex-wrap items-baseline gap-2.5">
                    <span className="text-3xl font-bold text-slate-900">
                        {currency}{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                        <>
                            <span className="text-lg text-slate-400 line-through">
                                {currency}{Number(product.mrp).toLocaleString('en-IN')}
                            </span>
                            <span
                                className="rounded-xl px-2 py-0.5 text-xs font-bold"
                                style={{ color: BRAND_GREEN, backgroundColor: '#eef4ef' }}
                            >
                                {discount}% OFF
                            </span>
                        </>
                    )}
                </div>
                <p className="mt-1 text-xs text-slate-400">Inclusive of all taxes</p>

                <div className="mt-2">
                    {typeof product.stock === 'number' ? (
                        product.stock > 0 ? (
                            <span className="text-sm font-medium" style={{ color: BRAND_GREEN }}>
                                In Stock ({product.stock} available)
                            </span>
                        ) : (
                            <span className="text-sm font-medium text-red-500">Out of Stock</span>
                        )
                    ) : available ? (
                        <span className="text-sm font-medium" style={{ color: BRAND_GREEN }}>In Stock</span>
                    ) : (
                        <span className="text-sm font-medium text-red-500">Out of Stock</span>
                    )}
                </div>

                {/* Qty + Add to Cart */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
                        <button
                            type="button"
                            disabled={!available || qty <= 1}
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                            className="flex h-11 w-10 items-center justify-center text-slate-600 disabled:opacity-40"
                            aria-label="Decrease quantity"
                        >
                            <Minus size={16} />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-semibold text-slate-800">{qty}</span>
                        <button
                            type="button"
                            disabled={!available || qty >= maxQty}
                            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                            className="flex h-11 w-10 items-center justify-center text-slate-600 disabled:opacity-40"
                            aria-label="Increase quantity"
                        >
                            <Plus size={16} />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={addQtyToCart}
                        disabled={!available}
                        className={`${brandPrimaryCtaClass} h-11 flex-1 min-w-[10rem] px-6 text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        <ShoppingCart size={16} />
                        Add to Cart
                    </button>
                </div>

                {/* Buy It Now + wishlist */}
                <div className="mt-3 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={buyNowHandler}
                        disabled={!available}
                        className={`${brandSecondaryCtaClass} h-11 flex-1 px-6 text-sm disabled:cursor-not-allowed disabled:opacity-50`}
                        style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
                    >
                        <Zap size={15} strokeWidth={2.25} />
                        Buy It Now
                    </button>
                    <WishlistButton
                        itemId={product.id}
                        itemType="product"
                        className="!size-11 shrink-0 rounded-xl border border-[#2f7d4a]/35 bg-white hover:bg-[#f4f8f5]"
                        activeClassName="text-[#2f7d4a] fill-[#2f7d4a]"
                    />
                </div>

                {/* Trust strip */}
                <div className="mt-6 grid grid-cols-3 gap-2 rounded-xl bg-[#f4f8f5] p-3 sm:p-4">
                    {[
                        { icon: Truck, title: 'Free Delivery', sub: 'On orders above ₹499' },
                        { icon: Shield, title: 'Quality Guarantee', sub: '100% healthy plants' },
                        { icon: Package, title: 'Secure Packaging', sub: 'Plants are packed safely' },
                    ].map(({ icon: Icon, title, sub }) => (
                        <div key={title} className="flex flex-col items-start gap-1.5 sm:flex-row sm:gap-2.5">
                            <div
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white"
                                style={{ color: BRAND_GREEN }}
                            >
                                <Icon size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight">{title}</p>
                                <p className="text-[10px] sm:text-[11px] text-slate-500 leading-snug mt-0.5">{sub}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Delivery box */}
                <div className="relative mt-4 rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start gap-2.5">
                        <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: BRAND_GREEN }} />
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm text-slate-700">
                                    Deliver to <span className="font-semibold text-slate-900">{city}</span>
                                </p>
                                <button
                                    type="button"
                                    onClick={() => setCityOpen((o) => !o)}
                                    className="text-sm font-semibold hover:underline"
                                    style={{ color: BRAND_GREEN }}
                                >
                                    Change
                                </button>
                            </div>
                        </div>
                    </div>
                    {cityOpen && (
                        <div className="absolute left-4 right-4 top-12 z-20 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                            {DELIVERY_CITIES.map((name) => (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => pickCity(name)}
                                    className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-sm transition ${
                                        city === name
                                            ? 'bg-[#eef4ef] font-semibold text-[#2f7d4a]'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    {name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
