'use client'
import { MapPin, Star, ArrowRight } from 'lucide-react'
import CatalogImage from '@/components/CatalogImage'
import Link from 'next/link'
import WishlistButton from '@/components/WishlistButton'

const ServiceCard = ({ service }) => {
    const currency = '₹'
    const rating = service.rating?.length
        ? Math.round(service.rating.reduce((acc, r) => acc + r.rating, 0) / service.rating.length)
        : 0

    return (
        <Link href={`/services/${service.id}`} className="group block w-48 sm:w-52 flex-shrink-0">
            <div className="relative bg-slate-50 rounded-2xl overflow-hidden aspect-[4/3]">
                <CatalogImage
                    fill
                    className="object-cover group-hover:scale-105 transition duration-300"
                    src={service.images?.[0] || 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=800&h=600&fit=crop&crop=entropy'}
                    alt={service.name}
                    sizes="208px"
                />
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    {service.category}
                </span>
                <div className="absolute top-2 right-2 z-10">
                    <WishlistButton itemId={service.id} itemType="service" />
                </div>
                <button className="absolute bottom-2 right-2 bg-white/90 hover:bg-blue-600 hover:text-white text-blue-700 text-[11px] font-bold px-4 py-1.5 rounded-lg shadow-md transition-all active:scale-95 border border-blue-200 hover:border-blue-600">
                    GET QUOTE
                </button>
            </div>
            <div className="pt-2 px-0.5">
                <p className="text-sm font-bold text-slate-800 truncate">{service.name}</p>
                <p className="flex items-center gap-1 text-slate-500 text-[11px] mt-0.5">
                    <MapPin size={10} /> {service.location}
                </p>
                <div className="flex items-center justify-between mt-1">
                    <p className="text-xs font-bold text-slate-800">From {currency}{service.startingPrice.toLocaleString()}</p>
                    {rating > 0 && (
                        <div className="flex items-center gap-0.5">
                            <Star size={10} fill="#059669" className="text-emerald-600" />
                            <span className="text-[10px] text-slate-600 font-medium">{rating}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ServiceCard
