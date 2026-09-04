'use client'
import { Star, Store } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import ReviewsList from './ReviewsList'

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')
    const reviews = product.rating || product.reviews || []

    return (
        <div className="my-10 text-sm text-slate-600">
            <div className="flex border-b border-slate-200 mb-6">
                {['Description', 'Reviews'].map((tab) => (
                    <button
                        key={tab}
                        className={`${tab === selectedTab ? 'border-b-2 border-emerald-600 font-semibold text-emerald-600' : 'text-slate-400 hover:text-slate-600'} px-4 py-2.5 font-medium transition`}
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                        {tab === 'Reviews' && reviews.length ? ` (${reviews.length})` : ''}
                    </button>
                ))}
            </div>

            {selectedTab === 'Description' && (
                <div className="max-w-2xl">
                    <p className="leading-relaxed">{product.description}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs text-slate-400">Category</p>
                            <p className="text-sm font-medium text-slate-700">{product.category}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-xs text-slate-400">Vendor</p>
                            <p className="text-sm font-medium text-slate-700">{product.storeName || 'LeafyLand'}</p>
                        </div>
                    </div>
                </div>
            )}

            {selectedTab === 'Reviews' && (
                <ReviewsList
                    reviews={reviews}
                    emptyMessage="No reviews yet. Rate this product after your order is delivered."
                />
            )}

            <div className="flex items-center gap-3 mt-8 p-4 bg-slate-50 rounded-xl">
                <div className="w-11 h-11 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Store size={18} className="text-emerald-600" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-700">Sold by {product.storeName || 'LeafyLand'}</p>
                    {product.storeUsername ? (
                        <Link href={`/shop/${product.storeUsername}`} className="text-xs text-emerald-600 hover:underline">
                            View store →
                        </Link>
                    ) : (
                        <span className="text-xs text-slate-400">Store page unavailable</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ProductDescription
