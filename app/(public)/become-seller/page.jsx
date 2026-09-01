import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowRight, ShieldCheck, TrendingUp, Store, Leaf,
    CheckCircle2, IndianRupee, HeadphonesIcon, BarChart3,
} from 'lucide-react'
import { BRAND_GREEN } from '@/lib/brand-ui'

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

export default function BecomeSeller() {
    return (
        <div className="bg-slate-50/50">
            {/* Hero — same language as the homepage carousel */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
                <div className="relative overflow-hidden rounded-xl bg-white shadow-sm min-h-[240px] sm:min-h-[300px] lg:min-h-[340px]">
                    <img
                        src="/bgs1.png"
                        alt=""
                        className="absolute inset-0 hidden sm:block h-full w-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-[#f4f8f5] sm:bg-gradient-to-r sm:from-white sm:via-white/85 sm:to-transparent" />
                    <div className="relative z-10 flex h-full min-h-[240px] sm:min-h-[300px] lg:min-h-[340px] items-center px-5 sm:px-10 lg:px-14 py-10">
                        <div className="max-w-lg">
                            <p
                                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                                style={{ color: BRAND.green }}
                            >
                                Sell on LeafyLand
                            </p>
                            <h1 className="mt-2 text-2xl sm:text-3xl lg:text-[2.15rem] font-semibold text-slate-800 leading-snug">
                                Grow your green business with India&apos;s plant marketplace
                            </h1>
                            <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                                List plants, tools, services and properties. Reach buyers who are already looking for what you sell.
                            </p>
                            <div className="mt-5">
                                <Link
                                    href="/create-store"
                                    className={`${heroCtaClass} text-white hover:opacity-90`}
                                    style={{ backgroundColor: BRAND.green }}
                                >
                                    Start selling
                                    <ArrowRight size={15} strokeWidth={2} />
                                </Link>
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
