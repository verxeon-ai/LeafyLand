'use client'
import Link from 'next/link'
import {
    ArrowRight,
    Sprout,
    Sofa,
    Headphones,
    Shirt,
    ShoppingBasket,
    PawPrint,
    Car,
    MoreHorizontal,
} from 'lucide-react'
import BeautyCareIcon from '@/components/icons/BeautyCareIcon'
import { BRAND_GREEN, BRAND_MINT } from '@/lib/brand-ui'

const EXPLORE_CATEGORIES = [
    { label: 'Plants & Gardening', href: '/products?group=leafyland', Icon: Sprout, iconSize: 26, strokeWidth: 2 },
    { label: 'Home & Living', href: '/products?category=Home+%26+Kitchen', Icon: Sofa },
    { label: 'Electronics', href: '/products?category=Electronics', Icon: Headphones },
    { label: 'Fashion', href: '/products?category=Fashion', Icon: Shirt },
    { label: 'Grocery', href: '/products?category=Grocery', Icon: ShoppingBasket },
    { label: 'Beauty & Personal Care', href: '/products?category=Beauty+%26+Personal+Care', Icon: BeautyCareIcon, iconSize: 26 },
    { label: 'Pet Supplies', href: '/products?category=Pet+Supplies', Icon: PawPrint },
    { label: 'Automotive', href: '/products?category=Automotive', Icon: Car },
    { label: 'More', href: '/products', Icon: MoreHorizontal },
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
                {EXPLORE_CATEGORIES.map(({ label, href, Icon, iconSize = 22, strokeWidth = 1.75 }) => (
                    <Link
                        key={label}
                        href={href}
                        className="group flex flex-col items-center gap-1.5 shrink-0 w-[68px] lg:w-auto lg:min-w-0"
                    >
                        <span
                            className="relative flex h-[46px] w-[46px] sm:h-[50px] sm:w-[50px] items-center justify-center rounded-full border border-slate-100 shadow-[0_2px_8px_rgba(15,23,42,0.07)] transition-all group-hover:shadow-[0_4px_12px_rgba(15,23,42,0.1)] group-hover:-translate-y-0.5 group-hover:border-[#2f7d4a]/30 text-[#8fb89a] group-hover:text-[#2f7d4a]"
                            style={{ backgroundColor: BRAND_MINT }}
                        >
                            <Icon
                                size={iconSize}
                                strokeWidth={strokeWidth}
                                className="transition-colors duration-200"
                                aria-hidden
                            />
                        </span>
                        <span className="text-[10px] sm:text-[11px] font-medium text-slate-700 text-center leading-tight line-clamp-2 px-0.5">
                            {label}
                        </span>
                    </Link>
                ))}
            </div>
        </section>
    )
}
