'use client'
import { memo } from 'react'
import { MapPin, Maximize, Star } from 'lucide-react'
import Link from 'next/link'
import WishlistButton from '@/components/WishlistButton'
import CatalogImage from '@/components/CatalogImage'
import { BRAND_GREEN, brandCardClass } from '@/lib/brand-ui'

const CURATED_BY_TITLE = {
    '2 Acre Farmhouse': '/property-farmhouse-light.jpg',
    'Agricultural Land': '/property-agri-land-light.jpg',
}

const FALLBACK_BY_TYPE = {
    Farmhouse: '/property-farmhouse-light.jpg',
    'Agricultural Land': '/property-agri-land-light.jpg',
    Nursery: '/property-agri-land-light.jpg',
    Farmland: '/property-agri-land-light.jpg',
    Cottage: '/property-farmhouse-light.jpg',
    'Garden Plot': '/property-agri-land-light.jpg',
}

const SHARED_SEED_FIELD = '1500382017468-9049fed747ef'

function propertyImage(property) {
    if (CURATED_BY_TITLE[property.title]) return CURATED_BY_TITLE[property.title]
    const src = property.images?.[0]
    if (src && !src.includes(SHARED_SEED_FIELD)) return src
    return FALLBACK_BY_TYPE[property.propertyType] || '/property-farmhouse.jpg'
}

const PropertyCard = ({ property, fluid = false }) => {
    const currency = '₹'
    const rating = property.reviewCount
        ? Math.round(property.avgRating || 0)
        : property.rating?.length
            ? Math.round(property.rating.reduce((acc, r) => acc + r.rating, 0) / property.rating.length)
            : property.avgRating || 0

    return (
        <Link
            href={`/properties/${property.id}`}
            className={`group block ${fluid ? 'w-full min-w-0' : 'w-[260px] sm:w-[280px] flex-shrink-0'}`}
        >
            <article className={`${brandCardClass} overflow-hidden transition-shadow duration-200 group-hover:shadow-md`}>
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <CatalogImage
                        fill
                        className="object-cover transition duration-300 group-hover:scale-105"
                        src={propertyImage(property)}
                        alt={property.title}
                        sizes="(max-width: 640px) 80vw, 280px"
                    />
                    <span
                        className={`absolute top-2.5 left-2.5 rounded-lg px-2 py-0.5 text-[10px] font-bold tracking-wide text-white ${
                            property.listingType === 'SALE' ? '' : 'bg-blue-500'
                        }`}
                        style={property.listingType === 'SALE' ? { backgroundColor: BRAND_GREEN } : undefined}
                    >
                        {property.listingType === 'SALE' ? 'FOR SALE' : 'FOR RENT'}
                    </span>
                    <div className="absolute top-2.5 right-2.5 z-10">
                        <WishlistButton itemId={property.id} itemType="property" />
                    </div>
                    <span
                        className="absolute bottom-2.5 right-2.5 rounded-lg px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition-opacity group-hover:opacity-95"
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        Enquire
                    </span>
                </div>
                <div className="space-y-1.5 p-3.5">
                    <p className="truncate text-sm font-bold text-slate-800">{property.title}</p>
                    <p className="flex min-w-0 items-center gap-1 text-[11px] text-slate-500">
                        <MapPin size={11} className="shrink-0" style={{ color: BRAND_GREEN }} />
                        <span className="truncate">{property.location}</span>
                        {property.propertyType ? (
                            <>
                                <span className="text-slate-300">·</span>
                                <span className="truncate">{property.propertyType}</span>
                            </>
                        ) : null}
                    </p>
                    <div className="flex items-center gap-2.5 text-[11px] text-slate-500">
                        {property.landSize ? (
                            <span className="flex items-center gap-1">
                                <Maximize size={10} /> {property.landSize}
                            </span>
                        ) : null}
                        {rating > 0 && (
                            <span className="flex items-center gap-0.5 font-medium text-slate-600">
                                <Star size={10} fill={BRAND_GREEN} style={{ color: BRAND_GREEN }} /> {rating}
                            </span>
                        )}
                    </div>
                    <p className="pt-0.5 text-base font-bold text-slate-800">
                        {currency}
                        {(property.price || 0).toLocaleString('en-IN')}
                        {property.listingType === 'RENT' && (
                            <span className="text-[11px] font-normal text-slate-500">/mo</span>
                        )}
                    </p>
                </div>
            </article>
        </Link>
    )
}

export default memo(PropertyCard)
