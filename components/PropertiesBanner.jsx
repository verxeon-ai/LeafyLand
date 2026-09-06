import Link from 'next/link'
import Image from 'next/image'
import { brandPrimaryCtaClass, brandRadiusClass, BRAND_GREEN, BRAND_MINT, BRAND_TEXT } from '@/lib/brand-ui'

const FADE =
    'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.35) 18%, rgba(0,0,0,0.85) 42%, #000 62%)'

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

            <div className="relative h-full w-[52%] shrink-0 overflow-hidden sm:w-[54%] md:w-[56%]">
                <div
                    className="absolute inset-0"
                    style={{
                        WebkitMaskImage: FADE,
                        maskImage: FADE,
                    }}
                >
                    <Image
                        src="/property-farmhouse-light.jpg"
                        alt="Bright white farmhouse with green lawn and garden"
                        fill
                        className="object-cover object-[62%_center]"
                        sizes="(max-width: 768px) 55vw, 700px"
                        quality={90}
                    />
                </div>
                <div
                    className="pointer-events-none absolute inset-y-0 left-0 w-[55%] sm:w-[48%] md:w-[42%]"
                    style={{
                        background: `linear-gradient(
                            90deg,
                            ${BRAND_MINT} 0%,
                            rgba(244, 248, 245, 0.92) 28%,
                            rgba(244, 248, 245, 0.55) 58%,
                            rgba(244, 248, 245, 0.18) 82%,
                            rgba(244, 248, 245, 0) 100%
                        )`,
                    }}
                />
            </div>
        </section>
    )
}
