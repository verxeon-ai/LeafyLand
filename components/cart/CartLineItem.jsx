'use client'

import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import CatalogImage from '@/components/CatalogImage'
import { formatMoney } from '@/lib/order-ui'
import { BRAND_GREEN, BRAND_GREEN_LIGHT, brandCardClass } from '@/lib/brand-ui'

export default function CartLineItem({
    item,
    onIncrement,
    onDecrement,
    onRemove,
    readOnly = false,
}) {
    const lineTotal = Number(item.price || 0) * Number(item.quantity || 0)
    const stock = typeof item.stock === 'number' ? item.stock : null
    const unavailable = item.inStock === false || (stock != null && stock < 1)
    const atMax = stock != null && item.quantity >= stock
    const shopHref = item.storeUsername ? `/shop/${item.storeUsername}` : null

    return (
        <article className={`${brandCardClass} flex min-w-0 gap-3 p-3 sm:gap-4 sm:p-4`}>
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 sm:h-24 sm:w-24">
                {item.images?.[0] ? (
                    <CatalogImage src={item.images[0]} alt={item.name} fill className="object-cover" sizes="96px" />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-300">
                        <ShoppingBag size={22} />
                    </div>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold text-slate-800">{item.name}</h3>
                        {shopHref ? (
                            <Link href={shopHref} className="mt-0.5 block truncate text-xs hover:underline" style={{ color: BRAND_GREEN }}>
                                {item.storeName || 'LeafyLand'}
                            </Link>
                        ) : (
                            <p className="mt-0.5 truncate text-xs text-slate-500">{item.storeName || 'LeafyLand'}</p>
                        )}
                        {item.category ? <p className="mt-0.5 text-[11px] text-slate-400">{item.category}</p> : null}
                    </div>
                    {!readOnly && onRemove && (
                        <button
                            type="button"
                            onClick={() => onRemove(item.id)}
                            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            aria-label={`Remove ${item.name}`}
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-bold text-slate-800">{formatMoney(item.price)}</p>
                        {unavailable && (
                            <p className="mt-1 text-[11px] font-medium text-red-600">Currently unavailable</p>
                        )}
                        {atMax && !unavailable && (
                            <p className="mt-1 text-[11px] text-slate-400">Max stock reached</p>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {readOnly ? (
                            <span className="rounded-xl px-2.5 py-1 text-xs font-medium text-slate-600" style={{ backgroundColor: BRAND_GREEN_LIGHT }}>
                                Qty {item.quantity}
                            </span>
                        ) : (
                            <div className="flex items-center gap-1 rounded-xl border border-slate-100 bg-[#f4f8f5] px-1.5 py-1">
                                <button
                                    type="button"
                                    onClick={() => onDecrement?.(item.id)}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white"
                                    aria-label="Decrease quantity"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="min-w-[1.5rem] text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                                <button
                                    type="button"
                                    onClick={() => onIncrement?.(item.id)}
                                    disabled={unavailable || atMax}
                                    className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label="Increase quantity"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        )}
                        <p className="min-w-[4.5rem] text-right text-sm font-bold" style={{ color: BRAND_GREEN }}>
                            {formatMoney(lineTotal)}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    )
}
