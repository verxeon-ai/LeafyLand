import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowRight, ShieldCheck, TrendingUp, Store, Leaf,
    CheckCircle2, IndianRupee, HeadphonesIcon, BarChart3,
} from 'lucide-react'
import { brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

export const metadata = {
    title: 'Sell on LeafyLand',
    description: "Join India's green marketplace. Sell plants, tools, seeds, garden products and more to thousands of buyers across India.",
}

const BRAND = {
    green: BRAND_GREEN,
    mint: '#f4f8f5',
    mintBorder: '#e4eee6',
    greenLight: '#eef4ef',
    text: '#1f2937',
    muted: '#6b7280',
}

const benefits = [
    {
        icon: TrendingUp,
        title: 'Grow your sales',
        desc: 'Reach plant lovers and garden enthusiasts across India who are already shopping on LeafyLand.',
    },
    {
        icon: Store,
        title: 'Your own storefront',
        desc: 'A dedicated store page with your logo, products, reviews, and a URL you can share anywhere.',
    },
    {
        icon: IndianRupee,
        title: 'Transparent pricing',
        desc: 'List for free to start. Clear fees, no surprises — you only pay as you grow.',
    },
    {
        icon: ShieldCheck,
        title: 'Verified seller badge',
        desc: 'Get reviewed by our team and earn a trust badge that helps buyers choose you with confidence.',
    },
    {
        icon: BarChart3,
        title: 'Seller dashboard',
        desc: 'Manage orders, inventory, analytics, and customer messages from one place.',
    },
    {
        icon: HeadphonesIcon,
        title: 'Dedicated support',
        desc: 'Our seller team helps you set up, resolve issues, and scale your green business.',
    },
]

const steps = [
    { number: '1', title: 'Create your account', desc: 'Sign up or log in to LeafyLand to get started.' },
    { number: '2', title: 'Submit store details', desc: 'Add your store name, description, contact info, and logo.' },
    { number: '3', title: 'Get verified', desc: 'We review your application within 24–48 hours.' },
    { number: '4', title: 'Start selling', desc: 'List products, set prices, and receive orders across India.' },
]

const pillars = [
    {
        title: 'Products',
        desc: 'Plants, tools, soil, planters and garden essentials.',
        href: '/create-store',
        art: '/icons/services/plant.png',
    },
    {
        title: 'Services',
        desc: 'Landscaping, irrigation, maintenance and home care.',
        href: '/create-store',
        art: '/icons/services/garden-design.png',
    },
    {
        title: 'Properties',
        desc: 'Farmhouses, farmland and green stays.',
        href: '/create-store',
        art: '/icons/services/maintenance.png',
    },
]

const categories = [
    'Indoor Plants', 'Outdoor Plants', 'Seeds & Bulbs', 'Garden Tools',
    'Fertilizers & Soil', 'Planters & Pots', 'Fruit Plants', 'Succulents',
    'Landscaping Materials', 'Irrigation Equipment', 'Organic Compost', 'Big Plants',
]

const heroCtaClass =
    'inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold rounded-xl transition-colors whitespace-nowrap'

const heroShowcase = [
    {
        label: 'Products',
        hint: 'Plants & tools',
        art: '/icons/services/plant.png',
        className: 'left-0 top-2 md:top-4',
    },
    {
        label: 'Services',
        hint: 'Care at the door',
        art: '/icons/services/garden-design.png',
        className: 'right-0 top-[46%]',
    },
    {
        label: 'Properties',
        hint: 'Land & farmhouses',
        art: '/icons/services/maintenance.png',
        className: 'bottom-1 left-1 md:left-4',
    },
]

export default function BecomeSeller() {
    return (
        <div className="bg-slate-50/50">
            {/* Hero — same language as the homepage carousel */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
                <div className="relative overflow-hidden rounded-xl shadow-sm h-[200px] sm:h-[260px] md:h-[300px] lg:h-[340px]">
                    <div
                        className="absolute inset-0"
                        style={{
                            background:
                                'linear-gradient(118deg, #edf7f0 0%, #f7fbf8 42%, #d7eadc 72%, #c5dfcc 100%)',
                        }}
                    />
                    <div
                        className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full blur-3xl"
                        style={{ backgroundColor: 'rgba(47,125,74,0.22)' }}
                    />
                    <div
                        className="pointer-events-none absolute right-24 -bottom-20 h-56 w-56 rounded-full blur-3xl"
                        style={{ backgroundColor: 'rgba(16,185,129,0.18)' }}
                    />
                    <svg
                        className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 opacity-[0.12]"
                        viewBox="0 0 120 120"
                        fill="none"
                        aria-hidden
                    >
                        <path
                            d="M18 102c28-8 46-32 52-62 18 8 32 28 36 52-22 4-58 8-88 10Z"
                            fill={BRAND.green}
                        />
                        <path
                            d="M58 18c8 22 6 44-8 64 22 2 40-8 52-24-12-18-28-32-44-40Z"
                            fill={BRAND.green}
                        />
                    </svg>

                    <div className="relative z-10 h-full flex items-center px-4 sm:px-8 md:px-12 lg:px-14">
                        <div className="relative z-10 max-w-[min(100%,12.5rem)] sm:max-w-[50%] md:max-w-[55%] lg:max-w-lg pr-2 sm:pr-0">
                            <h1 className="text-base sm:text-2xl md:text-3xl lg:text-[2rem] font-bold text-slate-800 leading-snug">
                                Grow your green business with{' '}
                                <span style={{ color: BRAND.green }}>India&apos;s plant marketplace</span>
                            </h1>
                            <p className="mt-1 sm:mt-1.5 text-[11px] sm:text-sm md:text-base text-slate-600 leading-relaxed line-clamp-2 sm:line-clamp-none">
                                List plants, tools, services and properties. Reach buyers who are already looking for what you sell.
                            </p>
                            <Link
                                href="/create-store"
                                className={`mt-2.5 sm:mt-4 ${brandPrimaryCtaClass}`}
                                style={{ backgroundColor: BRAND.green }}
                            >
                                Start selling
                                <ArrowRight size={15} strokeWidth={2} />
                            </Link>
                        </div>

                        <div className="absolute right-1 sm:right-3 md:right-8 lg:right-12 top-1/2 -translate-y-1/2 w-[46%] sm:w-[46%] max-w-[400px] h-[90%] sm:h-[88%] pointer-events-none">
                            <div
                                className="absolute left-1/2 top-1/2 h-28 w-28 sm:h-36 sm:w-36 md:h-44 md:w-44 lg:h-52 lg:w-52 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
                                style={{ backgroundColor: 'rgba(47,125,74,0.18)' }}
                            />
                            <div
                                className="absolute left-1/2 top-1/2 h-[5.5rem] w-[5.5rem] sm:h-28 sm:w-28 md:h-36 md:w-36 lg:h-40 lg:w-40 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-white/55"
                                style={{ borderColor: 'rgba(47,125,74,0.16)' }}
                            />
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                <div className="h-[5.25rem] w-[5.25rem] sm:h-24 sm:w-24 md:h-32 md:w-32 lg:h-36 lg:w-36 overflow-hidden rounded-full shadow-[0_12px_28px_rgba(47,125,74,0.18)] ring-2 sm:ring-4 ring-white/80">
                                    <Image
                                        src="/icons/services/plant.png"
                                        alt=""
                                        width={176}
                                        height={176}
                                        priority
                                        className="h-full w-full scale-[1.18] object-cover object-center"
                                    />
                                </div>
                            </div>
                            {heroShowcase.map((card) => (
                                <div
                                    key={card.label}
                                    className={`absolute z-10 hidden md:flex pointer-events-auto w-[138px] items-center gap-2 rounded-xl bg-white/95 px-2 py-1.5 shadow-[0_10px_22px_rgba(15,23,42,0.12)] ring-1 ring-white ${card.className}`}
                                >
                                    <span
                                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                                        style={{ backgroundColor: BRAND.greenLight }}
                                    >
                                        <Image src={card.art} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-semibold text-slate-800 leading-tight truncate">{card.label}</p>
                                        <p className="text-[10px] text-slate-500 truncate">{card.hint}</p>
                                    </div>
                                </div>
                            ))}
                            <div
                                className="hidden sm:block absolute top-1 right-0 z-20 rounded-xl bg-white px-2.5 py-1.5 shadow-md border pointer-events-auto"
                                style={{ borderColor: BRAND.mintBorder }}
                            >
                                <p className="text-[9px] uppercase tracking-wider font-semibold" style={{ color: BRAND.green }}>
                                    New sellers
                                </p>
                                <p className="text-xs font-bold text-slate-800">Go live this week</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* What you can list */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                <div className="mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: BRAND.green }}>
                        Three ways to sell
                    </p>
                    <h2 className="mt-1.5 text-lg sm:text-xl font-semibold text-slate-800">What can you list?</h2>
                    <p className="mt-1 text-sm text-slate-500">One store. Products, services, and properties — all in the LeafyLand catalog.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {pillars.map((p) => (
                        <Link
                            key={p.title}
                            href={p.href}
                            className="group flex items-start gap-4 rounded-xl border bg-[#f4f8f5] px-4 py-5 transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(47,125,74,0.12)] hover:border-[#c5d6c9]"
                            style={{ borderColor: BRAND.mintBorder }}
                        >
                            <span className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_6px_18px_rgba(47,125,74,0.08)] ring-1 ring-white overflow-hidden">
                                <Image
                                    src={p.art}
                                    alt=""
                                    width={56}
                                    height={56}
                                    className="h-11 w-11 object-contain"
                                />
                            </span>
                            <div className="min-w-0 pt-1">
                                <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                                    {p.title}
                                    <ArrowRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" style={{ color: BRAND.green }} />
                                </h3>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{p.desc}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Benefits */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                <div className="mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: BRAND.green }}>
                        Why LeafyLand
                    </p>
                    <h2 className="mt-1.5 text-lg sm:text-xl font-semibold text-slate-800">Why sell with us?</h2>
                    <p className="mt-1 text-sm text-slate-500">Tools and trust to run your green business online.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {benefits.map((b) => (
                        <div
                            key={b.title}
                            className="rounded-xl bg-white border p-5"
                            style={{ borderColor: BRAND.mintBorder }}
                        >
                            <div
                                className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl"
                                style={{ backgroundColor: BRAND.greenLight, color: BRAND.green }}
                            >
                                <b.icon size={18} strokeWidth={1.75} />
                            </div>
                            <h3 className="text-sm font-semibold text-slate-800">{b.title}</h3>
                            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Steps */}
            <section className="py-10 sm:py-14" style={{ backgroundColor: BRAND.mint }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="mb-8">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: BRAND.green }}>
                            Getting started
                        </p>
                        <h2 className="mt-1.5 text-lg sm:text-xl font-semibold text-slate-800">Four steps to your first sale</h2>
                        <p className="mt-1 text-sm text-slate-500">From sign-up to going live — usually within a couple of days.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {steps.map((step) => (
                            <div
                                key={step.number}
                                className="relative rounded-xl bg-white border p-5"
                                style={{ borderColor: BRAND.mintBorder }}
                            >
                                <span
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold text-white"
                                    style={{ backgroundColor: BRAND.green }}
                                >
                                    {step.number}
                                </span>
                                <h3 className="mt-3 text-sm font-semibold text-slate-800">{step.title}</h3>
                                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                <div className="mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: BRAND.green }}>
                        Categories
                    </p>
                    <h2 className="mt-1.5 text-lg sm:text-xl font-semibold text-slate-800">Popular things sellers list</h2>
                    <p className="mt-1 text-sm text-slate-500">Start with one category, then expand as you grow.</p>
                </div>
                <div className="flex flex-wrap gap-2.5">
                    {categories.map((cat) => (
                        <span
                            key={cat}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border text-sm font-medium text-slate-700 rounded-xl"
                            style={{ borderColor: BRAND.mintBorder }}
                        >
                            <CheckCircle2 size={14} strokeWidth={2} className="shrink-0" style={{ color: BRAND.green }} />
                            {cat}
                        </span>
                    ))}
                </div>
            </section>

            {/* Final CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-14 sm:pb-20">
                <div
                    className="rounded-xl px-6 sm:px-10 py-10 sm:py-12 text-center"
                    style={{ backgroundColor: BRAND.green }}
                >
                    <Leaf size={22} className="mx-auto mb-3 text-white/80" />
                    <h2 className="text-xl sm:text-2xl font-semibold text-white leading-snug max-w-lg mx-auto">
                        Ready to sell on LeafyLand?
                    </h2>
                    <p className="mt-2 text-sm text-white/80 max-w-md mx-auto leading-relaxed">
                        Set up your store in minutes. No technical setup — we&apos;ll walk you through the rest.
                    </p>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link
                            href="/create-store"
                            className={`${heroCtaClass} bg-white hover:opacity-95`}
                            style={{ color: BRAND.green }}
                        >
                            Create your store
                            <ArrowRight size={15} strokeWidth={2} />
                        </Link>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white rounded-xl border border-white/30 hover:bg-white/10 transition-colors"
                        >
                            Talk to our team
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
