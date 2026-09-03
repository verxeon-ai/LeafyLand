import Link from 'next/link'
import Image from 'next/image'
import { brandPrimaryCtaClass, brandRadiusClass, BRAND_GREEN, BRAND_MINT } from '@/lib/brand-ui'

export default function ServicesBanner() {
    return (
        <section
            className={`relative overflow-hidden shadow-sm flex h-[168px] sm:h-[196px] md:h-[220px] ${brandRadiusClass} mt-5`}
            style={{ backgroundColor: BRAND_MINT }}
            aria-label="Book a service"
        >
            <div className="relative z-10 flex-1 min-w-0 flex items-center px-4 sm:px-8 md:px-10">
                <div className="max-w-[15.5rem] sm:max-w-xs">
                    <p
                        className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: BRAND_GREEN }}
                    >
                        Book a service
                    </p>
                    <h2 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                        Expert care at your doorstep
                    </h2>
                    <Link
                        href="/services"
                        className={`mt-3 ${brandPrimaryCtaClass}`}
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        Browse services
                    </Link>
                </div>
            </div>
            <div className="relative w-[42%] sm:w-[46%] md:w-[48%] h-full shrink-0 overflow-hidden">
                <Image
                    src="/bgs2.png"
                    alt="Gardeners planting and pruning at a home garden"
                    width={1400}
                    height={380}
                    className="absolute right-0 top-1/2 -translate-y-1/2 h-[175%] w-auto max-w-none"
                    sizes="(max-width: 768px) 50vw, 640px"
                    quality={80}
                />
                <div
                    className="absolute inset-y-0 left-0 w-8 sm:w-12 pointer-events-none"
                    style={{ background: `linear-gradient(to right, ${BRAND_MINT}, transparent)` }}
                />
            </div>
        </section>
    )
}
