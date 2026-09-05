'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, Star, Clock, CheckCircle, Store } from 'lucide-react'
import CatalogImage from '@/components/CatalogImage'
import dynamic from 'next/dynamic'
import ReviewsList from '@/components/ReviewsList'
import WishlistButton from '@/components/WishlistButton'
import { DetailSkeleton } from '@/components/CatalogSkeleton'
import { cachedJson, peekDetail } from '@/lib/cachedJson'
import { BRAND_GREEN } from '@/lib/brand-ui'

const BookServiceModal = dynamic(() => import('@/components/BookServiceModal'), { ssr: false })

const ServicePage = () => {
    const { serviceId } = useParams()
    const detailUrl = `/api/services/${serviceId}`
    const initial = peekDetail(detailUrl, '/api/services', serviceId)
    const [service, setService] = useState(() => (initial?.id ? initial : null))
    const [loading, setLoading] = useState(!initial?.id)
    const [notFound, setNotFound] = useState(false)
    const [showBookModal, setShowBookModal] = useState(false)
    const [tab, setTab] = useState('Overview')

    useEffect(() => {
        let cancelled = false
        setNotFound(false)
        const hit = peekDetail(detailUrl, '/api/services', serviceId)
        if (hit?.id) {
            setService(hit)
            setLoading(false)
        } else {
            setLoading(true)
            setService(null)
        }
        cachedJson(detailUrl)
            .then((data) => {
                if (cancelled) return
                if (data?.error || !data?.id) {
                    setNotFound(true)
                    setService(null)
                    return
                }
                setService(data)
            })
            .catch(() => { if (!cancelled) setNotFound(true) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [serviceId, detailUrl])

    if (loading) return <DetailSkeleton />

    if (notFound || !service) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
                <p className="text-slate-500 text-sm">Service not found.</p>
                <Link href="/services" className="mt-3 inline-block text-blue-600 text-sm font-medium hover:underline">
                    Back to Services
                </Link>
            </div>
        )
    }

    const reviews = service.reviews || service.rating || []
    const rating = service.avgRating || (reviews.length
        ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
        : 0)

    const providerName = service.store?.name || 'Provider'
    const storeUsername = service.store?.username

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Link href="/services" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-6 transition">
                <ChevronLeft size={16} /> Back to Services
            </Link>

            <div className="flex max-lg:flex-col gap-8 lg:gap-12">
                <div className="lg:w-1/2">
                    <div className="relative aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden">
                        <CatalogImage
                            src={service.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=450&fit=crop'}
                            alt={service.name}
                            width={600}
                            height={450}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                        <div className="absolute top-4 right-4">
                            <WishlistButton itemId={service.id} itemType="service" className="shadow-md" />
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{service.category}</span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">{service.name}</h1>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                            <MapPin size={14} /> {service.location}
                        </span>
                        {rating > 0 && (
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <Star size={14} fill="#059669" className="text-emerald-600" /> {rating} ({reviews.length})
                            </span>
                        )}
                        {service.duration && (
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <Clock size={14} /> {service.duration}
                            </span>
                        )}
                    </div>

                    <div className="mt-6">
                        <p className="text-xs text-slate-400 uppercase font-medium">Starting from</p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">₹{service.startingPrice.toLocaleString()}</p>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-6">
                        <button
                            onClick={() => setShowBookModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-sm font-semibold rounded-xl active:scale-95 transition"
                        >
                            Book Service
                        </button>
                        <Link
                            href="/bookings"
                            className="border border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-3 text-sm font-medium rounded-xl transition inline-flex items-center"
                        >
                            My bookings
                        </Link>
                    </div>

                    <div className="flex items-center gap-3 mt-6 p-4 bg-slate-50 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-blue-700">{providerName?.[0] || 'P'}</span>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-700">{providerName}</p>
                            <p className="text-xs text-slate-400">Service Provider</p>
                        </div>
                        {storeUsername && (
                            <Link
                                href={`/shop/${storeUsername}`}
                                className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold hover:underline"
                                style={{ color: BRAND_GREEN }}
                            >
                                <Store size={14} /> View store
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-10">
                <div className="flex border-b border-slate-200 mb-6">
                    {['Overview', 'Reviews'].map((label) => (
                        <button
                            key={label}
                            onClick={() => setTab(label)}
                            className={`px-4 py-2.5 text-sm font-medium transition ${tab === label ? 'border-b-2 border-emerald-600 text-emerald-600' : 'text-slate-400'}`}
                        >
                            {label}
                            {label === 'Reviews' && reviews.length ? ` (${reviews.length})` : ''}
                        </button>
                    ))}
                </div>

                {tab === 'Overview' && (
                    <div className="max-w-2xl space-y-6">
                        <p className="text-sm text-slate-600 leading-relaxed">{service.description}</p>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">What&apos;s included</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {['Site consultation', 'Custom design', 'Material sourcing', 'Professional installation'].map((item) => (
                                    <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                                        <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {tab === 'Reviews' && (
                    <ReviewsList
                        reviews={reviews}
                        emptyMessage="No reviews yet. Rate this service after your booking is completed."
                    />
                )}
            </div>

            {showBookModal && <BookServiceModal service={service} setShowBookModal={setShowBookModal} />}
        </div>
    )
}

export default ServicePage
