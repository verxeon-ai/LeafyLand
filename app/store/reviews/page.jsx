'use client'
import { useState } from 'react'
import { Star } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import EmptyState from '@/components/admin/EmptyState'
import FilterChips from '@/components/admin/FilterChips'
import { AdminError, AdminStatSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { brandCardClass } from '@/lib/brand-ui'

export default function VendorReviews() {
    const [filterRating, setFilterRating] = useState('All')
    const { data: vendorReviews, loading, error, reload } = useCachedJson('/api/vendor/reviews', 'list')

    const filtered = vendorReviews.filter(r => filterRating === 'All' || r.rating === Number(filterRating))
    const avgRating = vendorReviews.length ? (vendorReviews.reduce((s, r) => s + r.rating, 0) / vendorReviews.length).toFixed(1) : 0
    const ratingDist = [5, 4, 3, 2, 1].map(star => ({ star, count: vendorReviews.filter(r => r.rating === star).length }))
    const maxCount = Math.max(...ratingDist.map(r => r.count), 1)

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Vendor" title="Reviews" description="Customer ratings for your listings" />

            {loading && vendorReviews.length === 0 ? (
                <AdminStatSkeleton count={2} />
            ) : error && vendorReviews.length === 0 ? (
                <AdminError message={error} onRetry={reload} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className={`${brandCardClass} p-6`}>
                    <div className="text-center mb-6">
                        <p className="text-5xl font-extrabold text-slate-800">{avgRating}</p>
                        <div className="flex items-center justify-center gap-0.5 mt-2">
                            {Array(5).fill('').map((_, i) => (
                                <Star key={i} size={18} fill={i < Math.round(avgRating) ? '#f59e0b' : '#e2e8f0'} className={i < Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200'} />
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{vendorReviews.length} reviews</p>
                    </div>
                    <div className="space-y-2">
                        {ratingDist.map(({ star, count }) => (
                            <div key={star} className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-600 w-6">{star}★</span>
                                <div className="flex-1 h-2.5 bg-[#eef4ef] rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${(count / maxCount) * 100}%`, backgroundColor: '#2f7d4a' }} />
                                </div>
                                <span className="text-xs text-slate-500 w-6 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <FilterChips
                        options={['All', '5', '4', '3', '2', '1']}
                        value={filterRating}
                        onChange={setFilterRating}
                        getLabel={(r) => r === 'All' ? 'All' : `${r}★`}
                    />

                    {filtered.length === 0 ? (
                        <EmptyState icon={Star} title="No reviews yet" description="Ratings from customers will show here" />
                    ) : filtered.map(review => (
                        <div key={review.id} className={`${brandCardClass} p-5`}>
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 bg-[#eef4ef] rounded-full flex items-center justify-center shrink-0">
                                    <span className="text-xs font-bold text-[#2f7d4a]">{(review.customer || '?').charAt(0)}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-slate-700">{review.customer || 'Customer'}</p>
                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">{review.type}</span>
                                        <div className="flex items-center gap-0.5">
                                            {Array(5).fill('').map((_, i) => (
                                                <Star key={i} size={10} fill={i < review.rating ? '#f59e0b' : '#e2e8f0'} className={i < review.rating ? 'text-amber-400' : 'text-slate-200'} />
                                            ))}
                                        </div>
                                        <span className="text-xs text-slate-400">{review.date ? new Date(review.date).toLocaleDateString() : ''}</span>
                                    </div>
                                    <p className="text-xs text-[#2f7d4a] font-medium mt-0.5">{review.item}</p>
                                    <p className="text-sm text-slate-600 mt-2">{review.review}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            )}
        </div>
    )
}
