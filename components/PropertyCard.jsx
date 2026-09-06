'use client'
import { memo } from 'react'
import { MapPin, Maximize, BedDouble, Star, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import WishlistButton from '@/components/WishlistButton'
import CatalogImage from '@/components/CatalogImage'
import { BRAND_GREEN } from '@/lib/brand-ui'

const currency = '₹'
const FALLBACK_IMAGE =
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&h=600&fit=crop&crop=entropy'

const PropertyCard = ({ property, fluid = false }) => {
    const router = useRouter()
    const href = `/properties/${property.id}`
    const isSale = property.listingType === 'SALE'
    const rating = property.reviewCount
        ? Math.round((property.avgRating || 0) * 10) / 10
        : property.rating?.length
            ? Math.round(
                (property.rating.reduce((acc, r) => acc + r.rating, 0) / property.rating.length) * 10,
            ) / 10
            : property.avgRating
                ? Math.round(property.avgRating * 10) / 10
                : null

    const goEnquire = (e) => {
        e.preventDefault()
        e.stopPropagation()
        router.push(href)
    }

    return (
        <article
            className={`${
                fluid ? 'w-full min-w-0 h-full' : 'w-[172px] sm:w-[188px] flex-shrink-0'
            } flex flex-col rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden`}
        >
            <Link href={href} className="group flex flex-1 flex-col min-h-0">
                <div className="relative aspect-[4/3] bg-slate-50 overflow-hidden shrink-0">
                    <CatalogImage
                        fill
                        className="object-cover group-hover:scale-105 transition duration-300"
                        src={property.images?.[0] || FALLBACK_IMAGE}
                        alt={property.title}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 188px"
                    />

                    <span
                        className={`absolute top-2 left-2 rounded-xl px-2 py-0.5 text-[10px] font-bold text-white ${
                            isSale ? '' : 'bg-blue-500'
                        }`}
                        style={isSale ? { backgroundColor: BRAND_GREEN } : undefined}
                    >
                        {isSale ? 'FOR SALE' : 'FOR RENT'}
                    </span>

                    <div className="absolute top-2 right-2 z-10">
                        <WishlistButton
                            itemId={property.id}
                            itemType="property"
                            className="p-1.5 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-white"
                            activeClassName="text-emerald-600 fill-emerald-600"
                        />
                    </div>

                    <span
                        className="absolute bottom-2 right-2 z-10 rounded-xl border bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-wide shadow-sm"
                        style={{ borderColor: BRAND_GREEN, color: BRAND_GREEN }}
                    >
                        Enquire
                    </span>
                </div>

                <div className="flex flex-1 flex-col px-2.5 pt-2.5 pb-2">
                    <div className="flex items-baseline gap-1 flex-wrap min-h-[1.25rem]">
                        <span className="text-base font-bold text-slate-900 leading-none">
                            {currency}{Number(property.price || 0).toLocaleString('en-IN')}
                        </span>
                        {!isSale && (
                            <span className="text-[10px] font-medium text-slate-400">/mo</span>
                        )}
                    </div>

                    <p className="mt-1 text-[11px] font-semibold min-h-[1rem] leading-none" style={{ color: BRAND_GREEN }}>
                        {property.propertyType || 'Property'}
                    </p>

                    <h3
                        className="mt-1.5 text-sm font-bold text-slate-900 leading-snug line-clamp-2 min-h-[2.5rem]"
                        title={property.title}
                    >
                        {property.title}
                    </h3>

                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400 truncate min-h-[1rem]">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{property.location || 'Location TBA'}</span>
                    </p>

                    <div className="mt-1.5 flex items-center gap-2 min-h-[18px] text-[11px] text-slate-500">
                        {property.landSize ? (
                            <span className="inline-flex items-center gap-0.5 truncate">
                                <Maximize size={10} className="shrink-0" />
                                {property.landSize}
                            </span>
                        ) : null}
                        {property.bedrooms ? (
                            <span className="inline-flex items-center gap-0.5 truncate">
                                <BedDouble size={10} className="shrink-0" />
                                {property.bedrooms} bed
                            </span>
                        ) : null}
                        {rating != null && rating > 0 ? (
                            <span className="inline-flex items-center gap-0.5 ml-auto">
                                <Star size={11} fill={BRAND_GREEN} className="shrink-0" style={{ color: BRAND_GREEN }} />
                                <span className="text-xs font-semibold text-slate-700">{rating}</span>
                            </span>
                        ) : null}
                    </div>
                </div>
            </Link>

            <div className="mt-auto px-2.5 pb-2.5 flex items-stretch gap-1.5 shrink-0">
                <Link
                    href={href}
                    className="shrink-0 flex items-center justify-center w-9 rounded-xl border border-slate-200 bg-white transition-colors hover:bg-[#eef4ef]"
                    style={{ color: BRAND_GREEN }}
                    aria-label="View location details"
                >
                    <MapPin size={16} strokeWidth={2} />
                </Link>
                <button
                    type="button"
                    onClick={goEnquire}
                    className="flex-1 min-w-0 flex items-center justify-center gap-1 rounded-xl py-2 px-2 text-xs font-semibold text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: BRAND_GREEN }}
                >
                    <MessageCircle size={14} strokeWidth={2} />
                    Enquire
                </button>
            </div>
        </article>
    )
}

export default memo(PropertyCard)
