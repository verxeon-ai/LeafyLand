import Link from 'next/link'
import Image from 'next/image'
import { artForService } from '@/lib/service-art'
import { BRAND_GREEN } from '@/lib/brand-ui'

export default function ServiceCategoryCard({ service }) {
    const art = artForService(service)
    const price = Number(service.startingPrice)

    return (
        <Link
            href={`/services/${service.id}`}
            className="group flex flex-col items-center text-center rounded-2xl bg-[#f4f8f5] border border-[#e4eee6] px-3 pt-5 pb-4 sm:px-4 sm:pt-6 sm:pb-5 min-w-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(47,125,74,0.12)] hover:border-[#c5d6c9]"
        >
            <span className="relative flex h-[72px] w-[72px] sm:h-[84px] sm:w-[84px] items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(47,125,74,0.08)] ring-1 ring-white overflow-hidden">
                <Image
                    src={art}
                    alt=""
                    width={84}
                    height={84}
                    className="h-[58px] w-[58px] sm:h-[68px] sm:w-[68px] object-contain pointer-events-none select-none transition-transform duration-200 group-hover:scale-105"
                    draggable={false}
                />
            </span>
            <span className="mt-3 text-[12px] sm:text-[13px] font-semibold text-slate-800 leading-snug line-clamp-2 min-h-[2.4em]">
                {service.name}
            </span>
            {Number.isFinite(price) && price > 0 && (
                <span className="mt-1 text-[11px] font-medium" style={{ color: BRAND_GREEN }}>
                    From ₹{price.toLocaleString('en-IN')}
                </span>
            )}
        </Link>
    )
}
