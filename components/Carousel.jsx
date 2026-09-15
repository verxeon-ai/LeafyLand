'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

const BRAND = {
    green: BRAND_GREEN,
}

const slides = [
    {
        id: 1,
        badge: 'Garden essentials',
        title: 'Everything for your green space',
        subtitle: 'Plants, seeds, planters, tools & soil — curated for home gardeners.',
        mobileSubtitle: 'Plants, tools & soil for home gardens.',
        cta: 'Shop gardening',
        href: '/products',
        image: '/hero-slide-gardening.jpg',
        alt: 'Potted plants and gardening tools on a wooden table',
    },
    {
        id: 2,
        badge: 'Book a service',
        title: 'Expert care at your doorstep',
        subtitle: 'Landscaping, plant care, irrigation & trusted home services.',
        mobileSubtitle: 'Landscaping & plant care by pros.',
        cta: 'Browse services',
        href: '/services',
        image: '/hero-slide-services.jpg',
        alt: 'Gardener pruning a lush green hedge',
    },
    {
        id: 3,
        badge: 'Find land & homes',
        title: 'Farmhouses, plots & green retreats',
        subtitle: 'Discover farmhouses, agricultural land & property listings across India.',
        mobileSubtitle: 'Farmhouses, plots & green retreats.',
        cta: 'Explore properties',
        href: '/properties',
        image: '/hero-slide-properties.jpg',
        alt: 'White farmhouse with green roof and lawn',
    },
    {
        id: 4,
        badge: 'Marketplace',
        title: 'Sports, electronics & everyday deals',
        subtitle: 'Classifieds and marketplace finds — from gadgets to sports gear.',
        mobileSubtitle: 'Gadgets, sports gear & more deals.',
        cta: 'Shop marketplace',
        href: '/products?marketplace=1',
        image: '/hero-slide-marketplace.jpg',
        alt: 'Lifestyle marketplace products with a small plant',
    },
]

function HeroSlide({
    badge,
    title,
    subtitle,
    mobileSubtitle,
    cta,
    href,
    image,
    alt,
    priority = false,
}) {
    return (
        <div className="relative w-full h-full overflow-hidden">
            <Image
                src={image}
                alt={alt || ''}
                fill
                className="object-cover object-[88%_center] sm:object-[75%_center] lg:object-[70%_center]"
                sizes="(max-width: 768px) 100vw, 1280px"
                quality={85}
                priority={priority}
            />

            {/* Mobile: opaque left wash + soft fade — no card chrome */}
            <div
                className="absolute inset-y-0 left-0 w-full sm:hidden"
                style={{
                    background:
                        'linear-gradient(90deg, #f4f8f5 0%, #f4f8f5 42%, rgba(244,248,245,0.92) 58%, rgba(244,248,245,0.35) 78%, rgba(244,248,245,0) 100%)',
                }}
            />
            {/* Tablet/desktop: lighter left fade */}
            <div
                className="absolute inset-y-0 left-0 hidden sm:block w-[70%] md:w-[62%] lg:w-[58%]"
                style={{
                    background:
                        'linear-gradient(90deg, #f4f8f5 0%, rgba(244,248,245,0.92) 45%, rgba(244,248,245,0.45) 72%, rgba(244,248,245,0) 100%)',
                }}
            />

            <div className="relative z-10 flex h-full items-center px-4 sm:px-10 md:px-12 lg:px-14">
                <div className="w-full max-w-[16.5rem] sm:max-w-[18rem] md:max-w-md lg:max-w-lg">
                    <p
                        className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-[0.14em]"
                        style={{ color: BRAND.green }}
                    >
                        {badge}
                    </p>
                    <h2 className="mt-1 sm:mt-2 text-[15px] leading-snug font-bold text-slate-800 sm:text-2xl md:text-3xl lg:text-[2rem]">
                        {title}
                    </h2>
                    <p className="mt-1 text-[11px] leading-snug text-slate-600 sm:hidden">
                        {mobileSubtitle || subtitle}
                    </p>
                    <p className="mt-1.5 hidden text-sm leading-relaxed text-slate-600 sm:block md:text-base">
                        {subtitle}
                    </p>
                    <Link
                        href={href}
                        className={`mt-2.5 sm:mt-4 ${brandPrimaryCtaClass} !px-3.5 !py-1.5 !text-xs sm:!px-4 sm:!text-[13px]`}
                        style={{ backgroundColor: BRAND.green }}
                    >
                        {cta}
                    </Link>
                </div>
            </div>
        </div>
    )
}

const Carousel = () => {
    const [current, setCurrent] = useState(0)
    const [paused, setPaused] = useState(false)
    const [touchX, setTouchX] = useState(null)

    const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [])
    const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [])

    useEffect(() => {
        if (paused) return
        const timer = setInterval(next, 6000)
        return () => clearInterval(timer)
    }, [paused, next])

    return (
        <div
            className="relative h-[200px] w-full overflow-hidden rounded-xl shadow-sm sm:h-[260px] md:h-[320px] lg:h-[380px]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
            onTouchEnd={(e) => {
                if (touchX == null) return
                const dx = e.changedTouches[0].clientX - touchX
                if (dx > 40) prev()
                if (dx < -40) next()
                setTouchX(null)
            }}
        >
            {slides.map((slide, i) => {
                const nearby =
                    i === current ||
                    i === (current + 1) % slides.length ||
                    i === (current - 1 + slides.length) % slides.length
                return (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-500 ${
                            i === current ? 'z-10 opacity-100' : 'pointer-events-none z-0 opacity-0'
                        }`}
                    >
                        {nearby && <HeroSlide {...slide} priority={i === current} />}
                    </div>
                )
            })}

            <div className="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-3">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        aria-label={`Go to slide ${i + 1}`}
                        onClick={() => setCurrent(i)}
                        className={`rounded-full transition-all ${
                            i === current ? 'h-2 w-2' : 'h-2 w-2 bg-slate-400/70'
                        }`}
                        style={i === current ? { backgroundColor: BRAND.green } : undefined}
                    />
                ))}
            </div>
        </div>
    )
}

export default Carousel
