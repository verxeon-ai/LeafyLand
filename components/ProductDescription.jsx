'use client'

import { Store } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import ReviewsList from './ReviewsList'
import { BRAND_GREEN } from '@/lib/brand-ui'

const ProductDescription = ({ product }) => {
    const [selectedTab, setSelectedTab] = useState('Description')
    const reviews = product.rating || product.reviews || []

    return (
        <div className="mt-10 text-sm text-slate-600 border-t border-slate-100 pt-8">
            <div className="flex border-b border-slate-200 mb-6">
                {['Description', 'Reviews'].map((tab) => (
                    <button
                        key={tab}
                        type="button"
                        className={`px-4 py-2.5 font-medium transition ${
                            tab === selectedTab
                                ? 'border-b-2 font-semibold'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                        style={
                            tab === selectedTab
                                ? { borderColor: BRAND_GREEN, color: BRAND_GREEN }
                                : undefined
                        }
                        onClick={() => setSelectedTab(tab)}
                    >
                        {tab}
                        {tab === 'Reviews' && reviews.length ? ` (${reviews.length})` : ''}
                    </button>
                ))}
            </div>

            {selectedTab === 'Description' && (
                <div className="max-w-3xl">
                    <h2 className="text-base font-semibold text-slate-800 mb-3">Product description</h2>
                    <p className="leading-relaxed text-slate-600 whitespace-pre-wrap">
                        {product.description || 'No description provided for this product.'}
                    </p>
                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs text-slate-400">Category</p>
                            <p className="text-sm font-medium text-slate-700 mt-0.5">{product.category}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4">
                            <p className="text-xs text-slate-400">Vendor</p>
                            <p className="text-sm font-medium text-slate-700 mt-0.5">{product.storeName || 'LeafyLand'}</p>
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
                        <Link
                            href={`/shop/${product.storeUsername}`}
                            className="text-xs hover:underline"
                            style={{ color: BRAND_GREEN }}
                        >
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
