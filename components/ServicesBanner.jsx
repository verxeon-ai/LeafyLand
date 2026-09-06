import Link from 'next/link'
import Image from 'next/image'
import { brandPrimaryCtaClass, brandRadiusClass, BRAND_GREEN, BRAND_MINT, BRAND_TEXT } from '@/lib/brand-ui'

export default function ServicesBanner() {
    return (
        <section
            className={`relative mt-5 flex h-[168px] overflow-hidden shadow-sm sm:h-[196px] md:h-[220px] ${brandRadiusClass}`}
            style={{ backgroundColor: BRAND_MINT }}
            aria-label="Book a service"
        >
            <div className="relative z-10 flex min-w-0 flex-1 items-center px-4 sm:px-8 md:px-10">
                <div className="max-w-[15.5rem] sm:max-w-xs md:max-w-sm">
                    <p
                        className="text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[11px]"
                        style={{ color: BRAND_GREEN }}
                    >
                        Book a service
                    </p>
                    <h2
                        className="mt-1 text-lg font-bold leading-snug sm:text-xl md:text-2xl"
                        style={{ color: BRAND_TEXT }}
                    >
                        Expert care at your doorstep
                    </h2>
                    <p className="mt-1.5 hidden text-sm leading-relaxed text-slate-500 sm:block">
                        Landscaping, garden maintenance, and irrigation — booked with verified pros.
                    </p>
                    <Link
                        href="/services"
                        className={`mt-3 ${brandPrimaryCtaClass}`}
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        Browse services
                    </Link>
                </div>
            </div>

            <div className="relative h-full w-[48%] shrink-0 overflow-hidden sm:w-[50%] md:w-[52%]">
                <Image
                    src="/services-banner-light.jpg"
                    alt="Professional landscaper pruning garden plants"
                    fill
                    className="object-cover object-[55%_center]"
                    sizes="(max-width: 768px) 50vw, 640px"
                    quality={90}
                />
                {/* Narrow soft edge only — keeps the photo sharp */}
                <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-20 md:w-24"
                    style={{
                        background: `linear-gradient(
                            90deg,
                            ${BRAND_MINT} 0%,
                            rgba(244, 248, 245, 0.7) 45%,
                            rgba(244, 248, 245, 0) 100%
                        )`,
                    }}
                />
            </div>
        </section>
    )
}
