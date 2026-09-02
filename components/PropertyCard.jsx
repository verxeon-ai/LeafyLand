'use client'
import { memo } from 'react'
import { MapPin, Maximize, BedDouble, Star } from 'lucide-react'
import Link from 'next/link'
import WishlistButton from '@/components/WishlistButton'
import CatalogImage from '@/components/CatalogImage'
import { BRAND_GREEN } from '@/lib/brand-ui'

const PropertyCard = ({ property, fluid = false }) => {
    const currency = '₹'
    const rating = property.reviewCount
        ? Math.round(property.avgRating || 0)
        : property.rating?.length
            ? Math.round(property.rating.reduce((acc, r) => acc + r.rating, 0) / property.rating.length)
            : property.avgRating || 0

    return (
        <Link href={`/properties/${property.id}`} className={`group block ${fluid ? 'w-full min-w-0' : 'w-52 sm:w-56 flex-shrink-0'}`}>
            <div className="relative bg-slate-50 rounded-2xl overflow-hidden aspect-[4/3]">
                <CatalogImage
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&crop=entropy'}
                    alt={property.title}
                    sizes="(max-width: 640px) 100vw, 224px"
                />
                <span
                    className={`absolute top-2 left-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md ${property.listingType === 'SALE' ? '' : 'bg-blue-500'}`}
                    style={property.listingType === 'SALE' ? { backgroundColor: BRAND_GREEN } : undefined}
                >
                    {property.listingType === 'SALE' ? 'FOR SALE' : 'FOR RENT'}
                </span>
                <div className="absolute top-2 right-2 z-10">
                    <WishlistButton itemId={property.id} itemType="property" />
                </div>
                <button className="absolute bottom-2 right-2 bg-white/90 hover:bg-amber-500 hover:text-white text-amber-700 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-md transition-all active:scale-95 border border-amber-200 hover:border-amber-500">
                    ENQUIRE
                </button>
            </div>
            <div className="pt-2 px-0.5">
                <p className="text-sm font-bold text-slate-800 truncate">{property.title}</p>
                <p className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                    <MapPin size={10} /> {property.location}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-0.5 text-[10px] text-slate-500">
                        <Maximize size={9} /> {property.landSize}
                    </span>
                    {rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] text-slate-600">
                            <Star size={9} fill="#059669" className="text-emerald-600" /> {rating}
                        </span>
                    )}
                </div>
                <p className="text-sm font-bold text-slate-800 mt-1">
                    {currency}{property.price.toLocaleString()}
                    {property.listingType === 'RENT' && <span className="text-[10px] font-normal text-slate-500">/mo</span>}
                </p>
            </div>
        </Link>
    )
}

export default memo(PropertyCard)
