'use client'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { useRef } from 'react'
import Link from 'next/link'

const FeaturedSection = ({ title, items, renderItem, viewAllLink, viewAllText = "See All" }) => {
    const scrollRef = useRef(null)

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            })
        }
    }

    return (
        <section className="py-5">
            {/* Section header — Zepto style */}
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-base sm:text-lg font-bold text-slate-800">{title}</h2>
                <div className="flex items-center gap-2">
                    {viewAllLink && (
                        <Link href={viewAllLink} className="text-emerald-600 text-xs font-semibold hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
                            {viewAllText} <ChevronRight size={14} />
                        </Link>
                    )}
                    <button onClick={() => scroll('left')} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition hidden sm:block">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={() => scroll('right')} className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition hidden sm:block">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Horizontal scrollable row */}
            <div
                ref={scrollRef}
                className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth overscroll-x-contain -mx-4 px-4 sm:mx-0 sm:px-0"
            >
                {items.map((item, i) => (
                    <div key={item.id || i} className="flex-shrink-0">
                        {renderItem(item)}
                    </div>
                ))}
            </div>
        </section>
    )
}

export default FeaturedSection
