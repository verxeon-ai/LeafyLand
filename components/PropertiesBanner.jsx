import Link from 'next/link'
import Image from 'next/image'
import { brandPrimaryCtaClass, brandRadiusClass, BRAND_GREEN, BRAND_MINT, BRAND_TEXT } from '@/lib/brand-ui'

export default function PropertiesBanner() {
    return (
        <section
            className={`relative mt-5 flex h-[168px] overflow-hidden shadow-sm sm:h-[196px] md:h-[220px] ${brandRadiusClass}`}
            style={{ backgroundColor: BRAND_MINT }}
            aria-label="Explore properties"
        >
            <div className="relative z-10 flex min-w-0 flex-1 items-center px-4 sm:px-8 md:px-10">
                <div className="max-w-[15.5rem] sm:max-w-xs md:max-w-sm">
                    <p
                        className="text-[9px] font-semibold uppercase tracking-[0.14em] sm:text-[11px]"
                        style={{ color: BRAND_GREEN }}
                    >
                        Find land &amp; homes
                    </p>
                    <h2
                        className="mt-1 text-lg font-bold leading-snug sm:text-xl md:text-2xl"
                        style={{ color: BRAND_TEXT }}
                    >
                        Farmhouses, plots &amp; green retreats
                    </h2>
                    <p className="mt-1.5 hidden text-sm leading-relaxed text-slate-500 sm:block">
                        Browse farmland, farmhouses, and green estates from verified sellers.
                    </p>
                    <Link
                        href="/properties"
                        className={`mt-3 ${brandPrimaryCtaClass}`}
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        Browse properties
                    </Link>
                </div>
            </div>

            <div className="relative h-full w-[48%] shrink-0 overflow-hidden sm:w-[50%] md:w-[52%]">
                <Image
                    src="/property-farmhouse-light.jpg"
                    alt="Bright white farmhouse with green lawn and garden"
                    fill
                    className="object-cover object-[60%_center]"
                    sizes="(max-width: 768px) 50vw, 640px"
                    quality={90}
                />
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
