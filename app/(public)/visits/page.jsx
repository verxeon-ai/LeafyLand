'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import RateModal from '@/components/RateModal'

export default function BuyerVisitsPage() {
    const [visits, setVisits] = useState([])
    const [ratedIds, setRatedIds] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [ratingFor, setRatingFor] = useState(null)

    const load = () => {
        Promise.all([fetch('/api/visits'), fetch('/api/property-ratings')])
            .then(async ([visitsRes, ratingsRes]) => {
                const visitsData = await visitsRes.json()
                const ratingsData = await ratingsRes.json()
                if (!visitsRes.ok) throw new Error(visitsData.error || 'Failed to load')
                setVisits(Array.isArray(visitsData) ? visitsData : [])
                if (Array.isArray(ratingsData)) {
                    setRatedIds(new Set(ratingsData.map((r) => r.visitId)))
                }
            })
            .catch((e) => toast.error(e.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const submitRating = async ({ rating, review }) => {
        if (!ratingFor) return
        const res = await fetch('/api/property-ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                propertyId: ratingFor.propertyId,
                visitId: ratingFor.id,
                rating,
                review,
            }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not rate')
        toast.success('Review submitted')
        setRatedIds((prev) => new Set([...prev, ratingFor.id]))
        setRatingFor(null)
    }

    if (loading) return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">My Property Visits</h1>
            <div className="space-y-3 animate-pulse">
                <div className="h-24 bg-slate-100 rounded-2xl" />
                <div className="h-24 bg-slate-100 rounded-2xl" />
            </div>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">My Property Visits</h1>
            {visits.length === 0 ? (
                <p className="text-sm text-slate-500">
                    No visits scheduled.{' '}
                    <Link href="/properties" className="text-emerald-700 font-medium">
                        Browse properties
                    </Link>
                </p>
            ) : (
                visits.map((v) => (
                    <div key={v.id} className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col sm:flex-row sm:justify-between gap-3">
                        <div>
                            <Link
                                href={`/properties/${v.property?.id || v.propertyId}`}
                                className="font-semibold text-slate-800 hover:text-emerald-700"
                            >
                                {v.property?.title || 'Property'}
                            </Link>
                            <p className="text-xs text-slate-500 mt-1">
                                {new Date(v.date).toLocaleDateString('en-IN')} · {v.time}
                            </p>
                            {v.notes && <p className="text-sm text-slate-600 mt-2">{v.notes}</p>}
                        </div>
                        <div className="flex flex-col items-start sm:items-end gap-2">
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                {v.status}
                            </span>
                            {v.status === 'COMPLETED' && !ratedIds.has(v.id) && (
                                <button
                                    onClick={() => setRatingFor(v)}
                                    className="text-sm text-emerald-700 font-semibold"
                                >
                                    Rate property
                                </button>
                            )}
                            {v.status === 'COMPLETED' && ratedIds.has(v.id) && (
                                <p className="text-xs text-emerald-600 font-medium">Review submitted</p>
                            )}
                        </div>
                    </div>
                ))
            )}

            {ratingFor && (
                <RateModal
                    title={`Rate ${ratingFor.property?.title || 'property'}`}
                    onClose={() => setRatingFor(null)}
                    onSubmit={submitRating}
                />
            )}
        </div>
    )
}
