'use client'
import { ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

const PropertyDescription = ({ property }) => {
    return (
        <div className="my-18 text-sm text-slate-600">
            <h3 className="font-semibold text-slate-800 mb-4">Property Details</h3>
            <p className="max-w-xl">{property.description}</p>

           
            {property.features?.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-medium text-slate-800 mb-2">Features</h4>
                    <div className="flex flex-wrap gap-2">
                        {property.features.map((feature, i) => (
                            <span key={i} className="px-3 py-1 bg-slate-100 rounded-full text-xs">{feature}</span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex gap-3 mt-14">
                {property.store?.logo ? (
                    <Image
                        src={property.store.logo}
                        alt=""
                        className="size-11 rounded-full ring ring-slate-400 object-cover"
                        width={100}
                        height={100}
                    />
                ) : (
                    <div className="size-11 rounded-full bg-emerald-100 ring ring-slate-200" />
                )}
                <div>
                    <p className="font-medium text-slate-600">Listed by {property.store?.name || 'Seller'}</p>
                    {property.store?.username ? (
                        <Link href={`/shop/${property.store.username}`} className="flex items-center gap-1.5 text-emerald-600 hover:underline">
                            View store <ArrowRight size={14} />
                        </Link>
                    ) : (
                        <span className="text-xs text-slate-400">Store page unavailable</span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PropertyDescription