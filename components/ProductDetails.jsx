'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { Star, Truck, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Counter from "./Counter";
import { useDispatch, useSelector } from "react-redux";
import WishlistButton from "./WishlistButton";
import CatalogImage from "./CatalogImage";

const ProductDetails = ({ product }) => {
    const productId = product.id;
    const currency = '₹';

    const cart = useSelector(state => state.cart.cartItems);
    const dispatch = useDispatch();
    const router = useRouter()

    const images = product.images?.length ? product.images : []
    const [mainImage, setMainImage] = useState(images[0]);

    useEffect(() => {
        if (images[0] && (!mainImage || !images.includes(mainImage))) {
            setMainImage(images[0])
        }
    }, [images, mainImage])

    const addToCartHandler = () => {
        dispatch(addToCart({ productId }))
    }

    const reviewCount = product.rating?.length || product.reviewCount || 0
    const averageRating = product.rating?.length
        ? product.rating.reduce((acc, item) => acc + item.rating, 0) / product.rating.length
        : (product.avgRating || 0);
    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

    return (
        <div className="flex max-lg:flex-col gap-8 lg:gap-12 min-w-0">
            {/* Image Gallery */}
            <div className="flex max-sm:flex-col-reverse gap-3 min-w-0 w-full lg:w-auto">
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-visible no-scrollbar">
                    {images.map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setMainImage(images[index])}
                            className={`bg-slate-100 flex items-center justify-center size-16 sm:size-20 rounded-xl cursor-pointer transition shrink-0 ${mainImage === image ? 'ring-2 ring-emerald-500' : 'hover:ring-2 hover:ring-slate-300'}`}
                        >
                            <CatalogImage src={image} className="object-cover rounded-lg" alt="" width={50} height={50} />
                        </div>
                    ))}
                </div>
                <div className="relative flex justify-center items-center w-full aspect-square max-h-72 sm:max-h-96 sm:max-w-md bg-slate-100 rounded-2xl overflow-hidden">
                    {mainImage ? (
                        <CatalogImage src={mainImage} alt={product.name} fill className="object-cover" priority />
                    ) : null}
                </div>
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{product.category}</span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">{product.name}</h1>

                {/* Rating */}
                {averageRating > 0 && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex">
                            {Array(5).fill('').map((_, index) => (
                                <Star key={index} size={14} className='text-transparent' fill={averageRating >= index + 1 ? "#059669" : "#D1D5DB"} />
                            ))}
                        </div>
                        <span className="text-sm text-slate-500">({reviewCount} reviews)</span>
                    </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 mt-4">
                    <span className="text-2xl sm:text-3xl font-bold text-slate-800">{currency}{product.price.toLocaleString()}</span>
                    {product.mrp && product.mrp > product.price && (
                        <>
                            <span className="text-lg text-slate-400 line-through">{currency}{product.mrp.toLocaleString()}</span>
                            <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{discount}% OFF</span>
                        </>
                    )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-600 mt-4 leading-relaxed">{product.description}</p>

                {/* Stock */}
                <div className="mt-4">
                    {typeof product.stock === 'number' ? (
                        product.stock > 0 ? (
                            <span className="text-xs text-emerald-600 font-medium">In Stock ({product.stock} available)</span>
                        ) : (
                            <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                        )
                    ) : product.inStock !== false ? (
                        <span className="text-xs text-emerald-600 font-medium">In Stock</span>
                    ) : (
                        <span className="text-xs text-red-500 font-medium">Out of Stock</span>
                    )}
                </div>

                {/* Add to Cart */}
                <div className="flex flex-wrap items-end gap-3 mt-6">
                    {cart[productId] && <Counter productId={productId} />}
                    <button
                        onClick={() => !cart[productId] ? addToCartHandler() : router.push('/cart')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 py-3 text-sm font-semibold rounded-xl active:scale-95 transition"
                    >
                        {!cart[productId] ? 'Add to Cart' : 'View Cart'}
                    </button>
                    <WishlistButton itemId={product.id} itemType="product" />
                </div>

                {/* Trust Signals */}
                <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Truck size={14} className="text-emerald-600" /> Free delivery
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Shield size={14} className="text-emerald-600" /> Quality guarantee
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <User size={14} className="text-emerald-600" /> Sold by {product.storeName || 'LeafyLand'}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductDetails
