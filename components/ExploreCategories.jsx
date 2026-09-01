'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { BRAND_GREEN } from '@/lib/brand-ui'

const EXPLORE_CATEGORIES = [
    { label: 'Plants & Gardening', href: '/products?category=Gardening', icon: '/icons/explore/plants.png' },
    { label: 'Home & Living', href: '/products?category=Home+%26+Kitchen', icon: '/icons/explore/home.png' },
    { label: 'Electronics', href: '/products?category=Electronics', icon: '/icons/explore/electronics.png' },
    { label: 'Fashion', href: '/products?category=Fashion', icon: '/icons/explore/fashion.png' },
    { label: 'Grocery', href: '/products?category=Home+%26+Kitchen', icon: '/icons/explore/grocery.png' },
    { label: 'Beauty & Personal Care', href: '/products?category=Beauty+%26+Personal+Care', icon: '/icons/explore/beauty.png' },
    { label: 'Pet Supplies', href: '/shop', icon: '/icons/explore/pet.png' },
    { label: 'Automotive', href: '/products?category=Automotive', icon: '/icons/explore/automotive.png' },
    { label: 'More', href: '/products', icon: '/icons/explore/more.png' },
]

export default function ExploreCategories() {
    return (
        <section className="rounded-xl border border-slate-100 bg-white shadow-sm px-4 sm:px-6 py-3 sm:py-3.5">
            <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3">
                <h2 className="text-sm sm:text-base font-bold text-slate-800 min-w-0 truncate">Explore Categories</h2>
                <Link
                    href="/products"
                    className="text-xs sm:text-sm font-semibold flex items-center gap-1 shrink-0 hover:opacity-80 transition-opacity"
                    style={{ color: BRAND_GREEN }}
                >
                    View all
                    <ArrowRight size={15} strokeWidth={2} absoluteStrokeWidth />
                </Link>
            </div>

            <div className="flex lg:grid lg:grid-cols-9 gap-3 lg:gap-1.5 overflow-x-auto lg:overflow-visible no-scrollbar">
                {EXPLORE_CATEGORIES.map((cat) => (
                    <Link
                        key={cat.label}
                        href={cat.href}
                        className="group flex flex-col items-center gap-1.5 shrink-0 w-[68px] lg:w-auto lg:min-w-0"
                    >
                        <span className="relative flex h-[46px] w-[46px] sm:h-[50px] sm:w-[50px] items-center justify-center rounded-full bg-white border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.07)] transition-all group-hover:shadow-[0_4px_12px_rgba(15,23,42,0.1)] group-hover:-translate-y-0.5 overflow-hidden">
                            <Image
                                src={cat.icon}
                                alt=""
                                width={40}
                                height={40}
                                className="h-8 w-8 sm:h-9 sm:w-9 object-contain pointer-events-none select-none"
                                draggable={false}
                                sizes="40px"
                                quality={70}
                            />
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 text-center leading-tight line-clamp-2 px-0.5">
                            {cat.label}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    )
}
