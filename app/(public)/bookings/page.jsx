'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import RateModal from '@/components/RateModal'

export default function BuyerBookingsPage() {
    const [bookings, setBookings] = useState([])
    const [ratedIds, setRatedIds] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [ratingFor, setRatingFor] = useState(null)

    const load = () => {
        Promise.all([fetch('/api/bookings'), fetch('/api/service-ratings')])
            .then(async ([bookingsRes, ratingsRes]) => {
                const bookingsData = await bookingsRes.json()
                const ratingsData = await ratingsRes.json()
                if (!bookingsRes.ok) throw new Error(bookingsData.error || 'Failed to load')
                setBookings(Array.isArray(bookingsData) ? bookingsData : [])
                if (Array.isArray(ratingsData)) {
                    setRatedIds(new Set(ratingsData.map((r) => r.bookingId)))
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
        const res = await fetch('/api/service-ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                serviceId: ratingFor.serviceId,
                bookingId: ratingFor.id,
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
            <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
            <div className="space-y-3 animate-pulse">
                <div className="h-24 bg-slate-100 rounded-2xl" />
                <div className="h-24 bg-slate-100 rounded-2xl" />
            </div>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">My Bookings</h1>
            {bookings.length === 0 ? (
                <p className="text-sm text-slate-500">
                    No bookings yet.{' '}
                    <Link href="/services" className="text-emerald-700 font-medium">
                        Browse services
                    </Link>
                </p>
            ) : (
                bookings.map((b) => (
                    <div key={b.id} className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                        <div className="flex justify-between gap-2">
                            <div>
                                <p className="font-semibold text-slate-800">{b.service?.name || 'Service'}</p>
                                <p className="text-xs text-slate-500">
                                    {new Date(b.date).toLocaleDateString('en-IN')} · {b.time} · {b.location}
                                </p>
                            </div>
                            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600 h-fit">
                                {b.status}
                            </span>
                        </div>
                        {b.status === 'COMPLETED' && !ratedIds.has(b.id) && (
                            <button
                                onClick={() => setRatingFor(b)}
                                className="text-sm text-emerald-700 font-semibold"
                            >
                                Rate service
                            </button>
                        )}
                        {b.status === 'COMPLETED' && ratedIds.has(b.id) && (
                            <p className="text-xs text-emerald-600 font-medium">Review submitted</p>
                        )}
                    </div>
                ))
            )}

            {ratingFor && (
                <RateModal
                    title={`Rate ${ratingFor.service?.name || 'service'}`}
                    onClose={() => setRatingFor(null)}
                    onSubmit={submitRating}
                />
            )}
        </div>
    )
}
