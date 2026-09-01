'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, MapPin, Maximize, BedDouble, CheckCircle, Star, CalendarIcon } from 'lucide-react'
import CatalogImage from '@/components/CatalogImage'
import dynamic from 'next/dynamic'
import ReviewsList from '@/components/ReviewsList'
import WishlistButton from '@/components/WishlistButton'
import { BRAND_GREEN } from '@/lib/brand-ui'
import { DetailSkeleton } from '@/components/CatalogSkeleton'
import { cachedJson, peekDetail } from '@/lib/cachedJson'

const ScheduleVisitModal = dynamic(() => import('@/components/ScheduleVisitModal'), { ssr: false })

const PropertyPage = () => {
    const { propertyId } = useParams()
    const detailUrl = `/api/properties/${propertyId}`
    const initial = peekDetail(detailUrl, '/api/properties', propertyId)
    const [property, setProperty] = useState(() => (initial?.id ? initial : null))
    const [loading, setLoading] = useState(!initial?.id)
    const [notFound, setNotFound] = useState(false)
    const [showVisitModal, setShowVisitModal] = useState(false)
    const [tab, setTab] = useState('Overview')

    useEffect(() => {
        let cancelled = false
        setNotFound(false)
        const hit = peekDetail(detailUrl, '/api/properties', propertyId)
        if (hit?.id) {
            setProperty(hit)
            setLoading(false)
        } else {
            setLoading(true)
            setProperty(null)
        }
        cachedJson(detailUrl)
            .then((data) => {
                if (cancelled) return
                if (data?.error || !data?.id) {
                    setNotFound(true)
                    setProperty(null)
                    return
                }
                setProperty(data)
            })
            .catch(() => { if (!cancelled) setNotFound(true) })
            .finally(() => { if (!cancelled) setLoading(false) })
        return () => { cancelled = true }
    }, [propertyId, detailUrl])

    if (loading) return <DetailSkeleton />

    if (notFound || !property) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
                <p className="text-slate-500 text-sm">Property not found.</p>
                <Link href="/properties" className="mt-3 inline-block text-amber-600 text-sm font-medium hover:underline">
                    Back to Properties
                </Link>
            </div>
        )
    }

    const reviews = property.reviews || property.rating || []
    const rating = property.avgRating || (reviews.length
        ? Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length)
        : 0)

    const providerName = property.store?.name || 'Lister'

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <Link href="/properties" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-amber-600 mb-6 transition">
                <ChevronLeft size={16} /> Back to Properties
            </Link>

            <div className="flex max-lg:flex-col gap-8 lg:gap-12">
                <div className="lg:w-1/2">
                    <div className="aspect-[4/3] bg-slate-100 rounded-2xl overflow-hidden relative">
                        <CatalogImage
                            src={property.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&h=450&fit=crop'}
                            alt={property.title}
                            width={600}
                            height={450}
                            className="w-full h-full object-cover"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                        <span
                            className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-lg ${property.listingType === 'SALE' ? '' : 'bg-blue-500'}`}
                            style={property.listingType === 'SALE' ? { backgroundColor: BRAND_GREEN } : undefined}
                        >
                            {property.listingType === 'SALE' ? 'FOR SALE' : 'FOR RENT'}
                        </span>
                        <div className="absolute top-4 right-4">
                            <WishlistButton itemId={property.id} itemType="property" className="shadow-md" />
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    <span
                        className="text-xs font-medium px-2 py-1 rounded-md"
                        style={{ color: BRAND_GREEN, backgroundColor: '#eef4ef' }}
                    >
                        {property.listingType === 'SALE' ? 'For Sale' : 'For Rent'}
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mt-3">{property.title}</h1>

                    <div className="flex flex-wrap items-center gap-3 mt-3">
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                            <MapPin size={14} /> {property.location}
                        </span>
                        <span className="flex items-center gap-1 text-sm text-slate-500">
                            <Maximize size={14} /> {property.landSize}
                        </span>
                        {property.bedrooms != null && (
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <BedDouble size={14} /> {property.bedrooms} BHK
                            </span>
                        )}
                        {rating > 0 && (
                            <span className="flex items-center gap-1 text-sm text-slate-500">
                                <Star size={14} fill="#059669" className="text-emerald-600" /> {rating} ({reviews.length})
                            </span>
                        )}
                    </div>

                    <div className="mt-6">
                        <p className="text-xs text-slate-400 uppercase font-medium">
                            {property.listingType === 'RENT' ? 'Monthly Rent' : 'Asking Price'}
                        </p>
                        <p className="text-3xl font-bold text-slate-800 mt-1">
                            ₹{property.price.toLocaleString()}
                            {property.listingType === 'RENT' && <span className="text-base font-normal text-slate-500">/month</span>}
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-8">
                        <button
                            onClick={() => setShowVisitModal(true)}
                            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 text-sm font-semibold rounded-xl active:scale-95 transition"
                        >
                            <CalendarIcon size={16} /> Schedule Visit
                        </button>
                        <Link
                            href="/visits"
                            className="border border-slate-200 hover:border-slate-300 text-slate-700 px-6 py-3 text-sm font-medium rounded-xl transition inline-flex items-center"
                        >
                            My visits
                        </Link>
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
                        <p className="text-sm text-slate-600 leading-relaxed">{property.description}</p>
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 mb-3">Amenities & Features</h3>
                            <div className="flex flex-wrap gap-2">
                                {(property.features || []).map((amenity, i) => (
                                    <span key={i} className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
                                        <CheckCircle size={12} className="text-emerald-500" />
                                        {amenity}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                            <p className="text-xs text-amber-700 leading-relaxed">
                                <strong>Note:</strong> Property transactions happen offline. LeafyLand facilitates discovery and connection only.
                            </p>
                        </div>
                    </div>
                )}

                {tab === 'Reviews' && (
                    <ReviewsList
                        reviews={reviews}
                        emptyMessage="No reviews yet. Rate this property after your site visit is completed."
                    />
                )}
            </div>

            {showVisitModal && (
                <ScheduleVisitModal property={property} setShowVisitModal={setShowVisitModal} />
            )}
        </div>
    )
}

export default PropertyPage
