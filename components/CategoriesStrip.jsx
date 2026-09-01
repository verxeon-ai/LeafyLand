'use client'
import { useState, useRef, useEffect } from 'react'
import { Leaf, Wrench, Droplets, Home as HomeIcon, Scissors, FlaskConical, Fence, ChevronDown, Smartphone, Laptop, Shirt, Sofa, Dumbbell, BookOpen, Gamepad2, Sparkles, Car, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { cachedJson } from '@/lib/cachedJson'

// Cosmetic metadata keyed by category name. The actual list of categories and
// their marketplace flag / ordering now live in the database (the Category table,
// served by /api/categories). This map only supplies icons, colours and the
// quick sub-links shown in each dropdown.
const META = {
    'Plants': {
        sub: 'Indoor & outdoor', icon: Leaf, color: 'bg-[#e8f5e9]', iconColor: 'text-emerald-600',
        subcategories: [
            { name: 'Indoor Greenary', href: '/products?category=Indoor+Greenary' },
            { name: 'Outdoor Plants', href: '/products?category=Plants' },
            { name: 'Big Plant', href: '/products?category=Big+Plant' },
            { name: 'Bulbs', href: '/products?category=Bulbs' },
            { name: 'Fruit Plant', href: '/products?category=Fruit+Plant' },
            { name: 'Seeds', href: '/products?category=Seeds' },
        ],
    },
    'Garden Tools': {
        sub: 'Equipment', icon: Wrench, color: 'bg-[#f1f8e9]', iconColor: 'text-lime-600',
        subcategories: [
            { name: 'Pruning Shears', href: '/products?category=Gardening' },
            { name: 'Tool Sets', href: '/products?category=Gardening' },
            { name: 'Irrigation Kits', href: '/products?category=Gardening' },
        ],
    },
    'Irrigation': {
        sub: 'Water systems', icon: Droplets, color: 'bg-[#e0f2f1]', iconColor: 'text-teal-600',
        subcategories: [
            { name: 'Drip Systems', href: '/products?category=Gardening' },
            { name: 'Sprinklers', href: '/products?category=Gardening' },
            { name: 'Hoses & Connectors', href: '/products?category=Gardening' },
        ],
    },
    'Farmhouses': {
        sub: 'Buy or rent', icon: HomeIcon, color: 'bg-[#fff3e0]', iconColor: 'text-orange-600',
        subcategories: [
            { name: 'Farmhouses', href: '/properties?type=Farmhouse' },
            { name: 'Land', href: '/properties?type=Agricultural+Land' },
            { name: 'Farm Stays', href: '/properties?type=Farm+Stay' },
        ],
    },
    'Landscaping': {
        sub: 'Book a pro', icon: Scissors, color: 'bg-[#e8f5e9]', iconColor: 'text-emerald-600',
        subcategories: [
            { name: 'Daily Needs', href: '/services?category=Daily+Needs+Services' },
            { name: 'Home Services', href: '/services?category=Home+Services' },
            { name: 'Garden Maintenance', href: '/services?category=Garden+Maintenance' },
            { name: 'Landscaping', href: '/services?category=Landscaping' },
            { name: 'Irrigation', href: '/services?category=Irrigation' },
            { name: 'Book a service', href: '/services', icon: CalendarDays },
        ],
    },
    'Fertilizers': {
        sub: 'Soil & growth', icon: FlaskConical, color: 'bg-[#f1f8e9]', iconColor: 'text-lime-600',
        subcategories: [
            { name: 'Organic Mix', href: '/products?category=Soil+%26+Fertilizers' },
            { name: 'Vermicompost', href: '/products?category=Soil+%26+Fertilizers' },
            { name: 'Liquid Fertilizer', href: '/products?category=Soil+%26+Fertilizers' },
        ],
    },
    'Pots': {
        sub: 'Planters & pots', icon: Fence, color: 'bg-[#fce4ec]', iconColor: 'text-pink-600',
        subcategories: [
            { name: 'Ceramic Pots', href: '/products?category=Planters' },
            { name: 'Hanging Baskets', href: '/products?category=Planters' },
            { name: 'Self-Watering', href: '/products?category=Planters' },
        ],
    },
    'Electronics': {
        sub: 'Gadgets & devices', icon: Laptop, color: 'bg-[#e3f2fd]', iconColor: 'text-blue-600',
        subcategories: [
            { name: 'Headphones', href: '/products?category=Electronics' },
            { name: 'Speakers', href: '/products?category=Electronics' },
            { name: 'TVs & Monitors', href: '/products?category=Electronics' },
        ],
    },
    'Mobile Phones': {
        sub: 'Phones & tablets', icon: Smartphone, color: 'bg-[#f3e5f5]', iconColor: 'text-purple-600',
        subcategories: [
            { name: 'iPhones', href: '/products?category=Mobile+Phones' },
            { name: 'Samsung', href: '/products?category=Mobile+Phones' },
            { name: 'OnePlus', href: '/products?category=Mobile+Phones' },
        ],
    },
    'Laptops': {
        sub: 'Computers', icon: Laptop, color: 'bg-[#e8eaf6]', iconColor: 'text-indigo-600',
        subcategories: [
            { name: 'MacBooks', href: '/products?category=Laptops' },
            { name: 'Windows Laptops', href: '/products?category=Laptops' },
            { name: 'Accessories', href: '/products?category=Laptops' },
        ],
    },
    'Fashion': {
        sub: 'Clothing & accessories', icon: Shirt, color: 'bg-[#fff3e0]', iconColor: 'text-orange-600',
        subcategories: [
            { name: 'Sneakers', href: '/products?category=Fashion' },
            { name: 'Jeans', href: '/products?category=Fashion' },
            { name: 'Watches', href: '/products?category=Fashion' },
        ],
    },
    'Home & Kitchen': {
        sub: 'Kitchen & decor', icon: Sofa, color: 'bg-[#e0f2f1]', iconColor: 'text-teal-600',
        subcategories: [
            { name: 'Kitchen Appliances', href: '/products?category=Home+%26+Kitchen' },
            { name: 'Bottles & Flasks', href: '/products?category=Home+%26+Kitchen' },
            { name: 'Induction & Cooktops', href: '/products?category=Home+%26+Kitchen' },
        ],
    },
    'Sports & Outdoors': {
        sub: 'Fitness & outdoor', icon: Dumbbell, color: 'bg-[#fce4ec]', iconColor: 'text-pink-600',
        subcategories: [
            { name: 'Yoga & Fitness', href: '/products?category=Sports+%26+Outdoors' },
            { name: 'Cricket', href: '/products?category=Sports+%26+Outdoors' },
            { name: 'Gym Equipment', href: '/products?category=Sports+%26+Outdoors' },
        ],
    },
    'Books & Stationery': {
        sub: 'Stationery & reading', icon: BookOpen, color: 'bg-[#fff8e1]', iconColor: 'text-amber-600',
        subcategories: [
            { name: 'Bestsellers', href: '/products?category=Books+%26+Stationery' },
            { name: 'Notebooks', href: '/products?category=Books+%26+Stationery' },
            { name: 'Pens & Pens', href: '/products?category=Books+%26+Stationery' },
        ],
    },
    'Toys & Games': {
        sub: 'Games & play', icon: Gamepad2, color: 'bg-[#e8f5e9]', iconColor: 'text-green-600',
        subcategories: [
            { name: 'LEGO', href: '/products?category=Toys+%26+Games' },
            { name: 'Board Games', href: '/products?category=Toys+%26+Games' },
            { name: 'Action Figures', href: '/products?category=Toys+%26+Games' },
        ],
    },
    'Beauty & Personal Care': {
        sub: 'Care & grooming', icon: Sparkles, color: 'bg-[#fce4ec]', iconColor: 'text-rose-600',
        subcategories: [
            { name: 'Skincare', href: '/products?category=Beauty+%26+Personal+Care' },
            { name: 'Haircare', href: '/products?category=Beauty+%26+Personal+Care' },
            { name: 'Grooming', href: '/products?category=Beauty+%26+Personal+Care' },
        ],
    },
    'Automotive': {
        sub: 'Car & bike', icon: Car, color: 'bg-[#e3f2fd]', iconColor: 'text-blue-600',
        subcategories: [
            { name: 'Car Accessories', href: '/products?category=Automotive' },
            { name: 'Bike Accessories', href: '/products?category=Automotive' },
            { name: 'Car Care', href: '/products?category=Automotive' },
        ],
    },
}

const FALLBACK_ORDER = Object.keys(META)
const DEFAULT_META = { sub: '', icon: Leaf, color: 'bg-[#e8f5e9]', iconColor: 'text-emerald-600', subcategories: [] }

function useCategories() {
    // Start with the fallback so the strip renders immediately, then replace
    // with the database-backed list once /api/categories resolves.
    const [cats, setCats] = useState(() => FALLBACK_ORDER.map((name) => ({ name })))

    useEffect(() => {
        let alive = true
        cachedJson('/api/categories')
            .then((data) => {
                if (alive && Array.isArray(data) && data.length) setCats(data)
            })
            .catch(() => {})
        return () => {
            alive = false
        }
    }, [])

    return cats
}

const CategoriesStrip = ({ activeCategory, onSelect }) => {
    const [openDropdown, setOpenDropdown] = useState(null)
    const dropdownRef = useRef(null)
    const categories = useCategories()

    useEffect(() => {
        const handleClick = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpenDropdown(null)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleCardClick = (cat, e) => {
        e.stopPropagation()
        if (openDropdown === cat.name) {
            setOpenDropdown(null)
        } else {
            setOpenDropdown(cat.name)
            onSelect(cat.name)
        }
    }

    return (
        <div className="sticky top-14 sm:top-16 lg:top-[6.75rem] z-40 glass-categories" ref={dropdownRef}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-1 sm:py-2 relative">
                    {categories.map((cat, i) => {
                        const meta = META[cat.name] || DEFAULT_META
                        const Icon = meta.icon
                        const active = activeCategory === cat.name || openDropdown === cat.name
                        const isOpen = openDropdown === cat.name
                        return (
                            <div key={cat.id || i} className="relative flex-shrink-0">
                                <button
                                    onClick={(e) => handleCardClick(cat, e)}
                                    className={`flex items-center gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-left transition-all cursor-pointer ${
                                        active
                                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                                            : `${meta.color} hover:shadow-md`
                                    }`}
                                >
                                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center shrink-0 ${active ? 'bg-white/20' : 'bg-white/70'}`}>
                                        <Icon size={14} className={active ? 'text-white' : meta.iconColor} />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <p className={`text-xs font-bold leading-tight ${active ? 'text-white' : 'text-slate-800'}`}>{cat.name}</p>
                                        </div>
                                        {meta.sub && (
                                            <p className={`text-[10px] leading-tight ${active ? 'text-white/70' : 'text-slate-500'}`}>{meta.sub}</p>
                                        )}
                                    </div>
                                    <ChevronDown size={12} className={`transition-transform ${active ? 'text-white/70' : 'text-slate-400'} ${isOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {/* Dropdown */}
                                {isOpen && (
                                    <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                        <div className="p-2 border-b border-slate-100">
                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-2 py-1">{cat.name}</p>
                                        </div>
                                        <div className="p-1.5">
                                            {(meta.subcategories || []).map((sub, j) => {
                                                const SubIcon = sub.icon || Icon
                                                return (
                                                <Link
                                                    key={j}
                                                    href={sub.href}
                                                    onClick={() => setOpenDropdown(null)}
                                                    className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                                                >
                                                    <SubIcon size={13} className="text-slate-400" />
                                                    {sub.name}
                                                </Link>
                                                )
                                            })}
                                        </div>
                                        <div className="p-1.5 border-t border-slate-100">
                                            <Link
                                                href={cat.name === 'Farmhouses' ? '/properties' : cat.name === 'Landscaping' ? '/services' : (meta.subcategories?.[0]?.href || '/products')}
                                                onClick={() => setOpenDropdown(null)}
                                                className="flex items-center justify-center gap-1 px-3 py-2 text-[11px] font-semibold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                            >
                                                View All {cat.name} <ChevronDown size={11} className="-rotate-90" />
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default CategoriesStrip
