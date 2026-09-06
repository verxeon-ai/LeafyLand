'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { toggleWishlist } from '@/lib/features/wishlist/wishlistSlice'
import CatalogImage from '@/components/CatalogImage'

const FILTERS = [
    { id: 'all', label: 'All' },
    { id: 'product', label: 'Products' },
    { id: 'service', label: 'Services' },
    { id: 'property', label: 'Properties' },
]

export default function WishlistSection() {
    const dispatch = useDispatch()
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [removing, setRemoving] = useState(null)

    const load = () => {
        setLoading(true)
        fetch('/api/wishlist')
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not load wishlist')
                setItems(Array.isArray(data.items) ? data.items : [])
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const removeItem = async (item) => {
        setRemoving(item.itemId)
        try {
            const res = await fetch('/api/wishlist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId: item.itemId, itemType: item.itemType }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error || 'Could not remove')
            setItems((prev) => prev.filter((i) => i.itemId !== item.itemId || i.itemType !== item.itemType))
            dispatch(toggleWishlist({ id: item.itemId, type: item.type }))
            toast.success('Removed from wishlist')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setRemoving(null)
        }
    }

    const visible =
        filter === 'all' ? items : items.filter((item) => item.type === filter)

    return (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mt-4">
            <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                    <Heart size={18} className="text-red-500 fill-red-500" />
                    <h2 className="text-sm font-semibold text-slate-800">My Wishlist</h2>
                    <span className="text-xs text-slate-400">({items.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                filter === tab.id
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-4 sm:p-6">
                {loading ? (
                    <p className="text-sm text-slate-500">Loading wishlist…</p>
                ) : visible.length === 0 ? (
                    <div className="text-center py-8">
                        <Heart size={32} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-sm text-slate-500">
                            {filter === 'all'
                                ? 'No saved items yet. Tap the heart on products, services, or properties.'
                                : `No saved ${filter === 'product' ? 'products' : filter === 'service' ? 'services' : 'properties'}.`}
                        </p>
                        <div className="flex flex-wrap justify-center gap-3 mt-4 text-xs font-semibold">
                            <Link href="/products" className="text-emerald-700 hover:underline">
                                Browse products
                            </Link>
                            <Link href="/services" className="text-blue-700 hover:underline">
                                Browse services
                            </Link>
                            <Link href="/properties" className="text-amber-700 hover:underline">
                                Browse properties
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {visible.map((item) => (
                            <div
                                key={`${item.itemType}-${item.itemId}`}
                                className="flex gap-3 p-3 rounded-xl border border-slate-100 hover:border-emerald-100 hover:bg-emerald-50/30 transition"
                            >
                                <Link href={item.href} className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                    {item.image ? (
                                        <CatalogImage
                                            fill
                                            src={item.image}
                                            alt={item.title}
                                            className="object-cover"
                                            sizes="80px"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-slate-200" />
                                    )}
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                        {item.type}
                                    </p>
                                    <Link href={item.href} className="block text-sm font-semibold text-slate-800 truncate hover:text-emerald-700">
                                        {item.title}
                                    </Link>
                                    {item.subtitle && (
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                                    )}
                                    <p className="text-sm font-bold text-slate-800 mt-1">{item.priceLabel}</p>
                                </div>
                                <button
                                    type="button"
                                    disabled={removing === item.itemId}
                                    onClick={() => removeItem(item)}
                                    className="self-start p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                                    aria-label="Remove from wishlist"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
