'use client'
import {
    Search, ShoppingCart, User, Menu, X, MapPin, ChevronDown,
    Store, Heart, Package, Percent, CalendarDays, Leaf, Sprout,
    Smartphone, Sofa, Tag, TreePine, Apple, Flower2, Truck,
    Droplets, Home, Scissors, Shirt, Map, Building2, Info,
    Compass, Mail, FlaskConical, Shovel, Fence, Trophy,
    ShoppingBag, Wrench, Ellipsis, Handshake,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { assets } from '@/assets/assets'
import { useRouter } from 'next/navigation'
import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { useSelector } from 'react-redux'
import { useSession } from 'next-auth/react'
import { cachedJson } from '@/lib/cachedJson'
import { splitProductNiches } from '@/lib/product-niches'
import { brandPrimaryCtaClass } from '@/lib/brand-ui'
import {
    MAIN_NAV_MENUS,
    SEARCH_SCOPES,
    SECONDARY_NAV_MENUS,
    MORE_NAV_LINKS,
    buildPopularItems,
    buildProductsMenuItems,
    SERVICES_SUBCATEGORIES,
    PROPERTIES_SUBCATEGORIES,
    BOOK_SERVICE_ITEM,
} from '@/lib/nav-menus'

/** Reference design tokens */
const BRAND = {
    green: '#2f7d4a',
    greenHover: '#256b3f',
    greenLight: '#eef4ef',
    bottomBg: '#f4f8f5',
    categoryBg: '#eef3ef',
    text: '#1f2937',
    muted: '#6b7280',
}

const BOTTOM_NAV_ICONS = {
    shop: ShoppingBag,
    services: Wrench,
    classifieds: Tag,
    property: Building2,
}

const NAV_ICONS = {
    leaf: Leaf,
    sprout: Sprout,
    pot: Fence,
    flask: FlaskConical,
    shovel: Shovel,
    tag: Tag,
    tree: TreePine,
    apple: Apple,
    seedling: Sprout,
    flower: Flower2,
    truck: Truck,
    droplets: Droplets,
    home: Home,
    scissors: Scissors,
    calendar: CalendarDays,
    smartphone: Smartphone,
    sofa: Sofa,
    shirt: Shirt,
    map: Map,
    building: Building2,
    info: Info,
    compass: Compass,
    mail: Mail,
    store: Store,
    trophy: Trophy,
    handshake: Handshake,
}

function NavIcon({ name, size = 18 }) {
    const Icon = NAV_ICONS[name] || Tag
    return <Icon size={size} strokeWidth={1.75} className="shrink-0" style={{ color: BRAND.green }} />
}

function PopularDropdown({ open, items, onNavigate, anchorEl, className = 'w-72' }) {
    const router = useRouter()
    const [pos, setPos] = useState({ top: 0, left: 0 })

    useEffect(() => {
        if (!open || !anchorEl) return
        const update = () => {
            const r = anchorEl.getBoundingClientRect()
            setPos({ top: r.bottom + 2, left: r.left })
        }
        update()
        window.addEventListener('scroll', update, true)
        window.addEventListener('resize', update)
        return () => {
            window.removeEventListener('scroll', update, true)
            window.removeEventListener('resize', update)
        }
    }, [open, anchorEl])

    if (!open || typeof document === 'undefined') return null

    return createPortal(
        <div
            data-nav-dropdown
            style={{ position: 'fixed', top: pos.top, left: pos.left }}
            className={`min-w-[240px] bg-white rounded-xl shadow-xl border border-slate-100 z-[200] py-3 ${className}`}
        >
            <p className="px-5 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em]" style={{ color: BRAND.green }}>
                Popular
            </p>
            <div className="mx-5 border-t border-gray-200 mb-1" />
            <div className="py-1">
                {items.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        onClick={(e) => {
                            e.preventDefault()
                            const href = item.href
                            onNavigate()
                            router.push(href)
                        }}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm hover:bg-[#eef4ef] transition-colors"
                        style={{ color: BRAND.text }}
                    >
                        <NavIcon name={item.icon} />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>,
        document.body,
    )
}

const cities = [
    { name: 'Mumbai', lat: 19.076, lng: 72.877 },
    { name: 'Delhi', lat: 28.6139, lng: 77.209 },
    { name: 'Bengaluru', lat: 12.9716, lng: 77.5946 },
    { name: 'Hyderabad', lat: 17.385, lng: 78.4867 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707 },
    { name: 'Pune', lat: 18.5204, lng: 73.8567 },
    { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639 },
    { name: 'Jaipur', lat: 26.9124, lng: 75.7873 },
    { name: 'Lucknow', lat: 26.8467, lng: 80.9462 },
    { name: 'Chandigarh', lat: 30.7333, lng: 76.7794 },
    { name: 'Bhopal', lat: 23.2599, lng: 77.4126 },
    { name: 'Indore', lat: 22.7196, lng: 75.8577 },
    { name: 'Nagpur', lat: 21.1458, lng: 79.0882 },
    { name: 'Surat', lat: 21.1702, lng: 72.8311 },
]

const LOCATION_KEY = 'leafyland_location'

/* Collapsing the bottom row shortens the page by its own height, which can move
   the scroll position back across a single threshold and leave the navbar
   flipping between states. globals.css stops the browser from compensating for
   the resize; these two thresholds are the second guard, for cases where the
   scroll position still shifts because the page can no longer scroll as far.
   Keep them more than one row height (h-11 plus its border, 45px) apart. */
const SCROLL_COMPACT_AT = 64
const SCROLL_EXPAND_AT = 16

function nearestCity(lat, lng) {
    let best = cities[0]
    let bestDist = Infinity
    for (const c of cities) {
        const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
        if (d < bestDist) { bestDist = d; best = c }
    }
    return best.name
}

const Navbar = () => {
    const router = useRouter()
    const [search, setSearch] = useState('')
    const [searchScope, setSearchScope] = useState(SEARCH_SCOPES[0])
    const [scopeOpen, setScopeOpen] = useState(false)
    const [expandedCategory, setExpandedCategory] = useState(null)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const [location, setLocation] = useState('Mumbai')
    const [locationOpen, setLocationOpen] = useState(false)
    const [locationSearch, setLocationSearch] = useState('')
    const [openMenu, setOpenMenu] = useState(null)
    const [menuAnchor, setMenuAnchor] = useState(null)
    const [mobileAccordion, setMobileAccordion] = useState(null)
    const [niches, setNiches] = useState({
        productsAll: [],
        productsLeafy: [],
        productsMarketplace: [],
        services: [],
        properties: [],
    })

    const locationRef = useRef(null)
    const scopeRef = useRef(null)
    const menuRef = useRef(null)
    const mobileSearchInputRef = useRef(null)
    const cartCount = useSelector((state) => state.cart.total)
    const { data: session } = useSession()
    const panelHref = session?.user?.role === 'ADMIN'
        ? '/admin'
        : session?.user?.storeId && session?.user?.storeStatus === 'approved'
            ? '/store'
            : session?.user
                ? '/profile'
                : '/login'

    useEffect(() => { setMounted(true) }, [])

    useEffect(() => {
        let cancelled = false
        const load = () => {
            if (cancelled) return
            Promise.all([
                cachedJson('/api/products/niches'),
                cachedJson('/api/services/niches'),
                cachedJson('/api/properties/niches'),
            ]).then(([products, services, properties]) => {
                if (cancelled) return
                const { all, leafy, marketplace } = splitProductNiches(Array.isArray(products) ? products : [])
                setNiches({
                    productsAll: all,
                    productsLeafy: leafy,
                    productsMarketplace: marketplace,
                    services: Array.isArray(services) ? services : [],
                    properties: Array.isArray(properties) ? properties : [],
                })
            }).catch(() => {})
        }
        const idle = typeof requestIdleCallback === 'function'
            ? requestIdleCallback(load, { timeout: 1800 })
            : setTimeout(load, 200)
        return () => {
            cancelled = true
            if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idle)
            else clearTimeout(idle)
        }
    }, [])

    const navMenus = useMemo(() => {
        const productItems = buildProductsMenuItems()
        const serviceItems = [
            ...(niches.services.length > 0
                ? niches.services.map((n) => ({
                    name: n.name,
                    href: `/services?category=${encodeURIComponent(n.name)}`,
                }))
                : SERVICES_SUBCATEGORIES),
            BOOK_SERVICE_ITEM,
        ]
        const propertyItems = niches.properties.length > 0
            ? niches.properties.map((n) => ({
                name: n.name,
                href: `/properties?type=${encodeURIComponent(n.name)}`,
            }))
            : PROPERTIES_SUBCATEGORIES

        return MAIN_NAV_MENUS.map((menu) => {
            if (menu.id === 'products') return { ...menu, items: productItems }
            if (menu.id === 'services') return { ...menu, items: serviceItems }
            if (menu.id === 'properties') return { ...menu, items: propertyItems }
            return menu
        })
    }, [niches])

    useEffect(() => {
        const onScroll = () =>
            setScrolled((isCompact) =>
                window.scrollY > (isCompact ? SCROLL_EXPAND_AT : SCROLL_COMPACT_AT),
            )
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    useEffect(() => {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(LOCATION_KEY) : null
        if (saved && cities.some((c) => c.name === saved)) {
            setLocation(saved)
            return
        }
        if (typeof window === 'undefined' || !navigator.geolocation) {
            localStorage.setItem(LOCATION_KEY, 'Mumbai')
            return
        }
        const locate = () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const city = nearestCity(pos.coords.latitude, pos.coords.longitude)
                    setLocation(city)
                    localStorage.setItem(LOCATION_KEY, city)
                },
                () => { localStorage.setItem(LOCATION_KEY, 'Mumbai') },
                { timeout: 4000, maximumAge: 600_000 },
            )
        }
        const idle = typeof requestIdleCallback === 'function'
            ? requestIdleCallback(locate, { timeout: 4000 })
            : setTimeout(locate, 800)
        return () => {
            if (typeof cancelIdleCallback === 'function') cancelIdleCallback(idle)
            else clearTimeout(idle)
        }
    }, [])

    const selectCity = (city) => {
        setLocation(city)
        setLocationOpen(false)
        setLocationSearch('')
        try { localStorage.setItem(LOCATION_KEY, city) } catch {}
    }

    useEffect(() => {
        const handleClick = (e) => {
            if (locationRef.current && !locationRef.current.contains(e.target)) setLocationOpen(false)
            if (scopeRef.current && !scopeRef.current.contains(e.target)) {
                setScopeOpen(false)
                setExpandedCategory(null)
            }
            const inMenuBar = menuRef.current && menuRef.current.contains(e.target)
            const inDropdown = e.target.closest?.('[data-nav-dropdown]')
            if (!inMenuBar && !inDropdown) {
                setOpenMenu(null)
                setMenuAnchor(null)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    useEffect(() => {
        if (!mobileMenuOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => { document.body.style.overflow = prev }
    }, [mobileMenuOpen])

    useEffect(() => {
        if (!mobileSearchOpen) return
        const prev = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        const t = setTimeout(() => mobileSearchInputRef.current?.focus(), 50)
        const onKey = (e) => { if (e.key === 'Escape') setMobileSearchOpen(false) }
        document.addEventListener('keydown', onKey)
        return () => {
            document.body.style.overflow = prev
            clearTimeout(t)
            document.removeEventListener('keydown', onKey)
        }
    }, [mobileSearchOpen])

    useEffect(() => {
        if (scrolled) {
            setOpenMenu(null)
            setMenuAnchor(null)
        }
    }, [scrolled])

    const toggleMenu = (id, el) => {
        if (openMenu === id) {
            setOpenMenu(null)
            setMenuAnchor(null)
        } else {
            setOpenMenu(id)
            setMenuAnchor(el)
        }
    }
    const filteredCities = cities.filter((c) =>
        c.name.toLowerCase().includes(locationSearch.toLowerCase()),
    )

    const handleSearch = (e) => {
        e.preventDefault()
        if (!search.trim()) {
            router.push(searchScope.path)
            return
        }
        const q = encodeURIComponent(search.trim())
        if (searchScope.id === 'services') router.push(`/services?search=${q}`)
        else if (searchScope.id === 'properties') router.push(`/properties?search=${q}`)
        else router.push(`/products?search=${q}`)
        setMobileMenuOpen(false)
        setMobileSearchOpen(false)
    }

    const accountLabel = session?.user ? (session.user.name || 'Account') : 'Login'
    const accountHref = session?.user ? panelHref : '/login'

    const categoriesDropdown = (
        <div className="absolute top-full left-0 mt-1.5 w-64 max-h-[70vh] overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200 z-[80] py-1">
            <button
                type="button"
                onClick={() => {
                    setSearchScope(SEARCH_SCOPES[0])
                    setExpandedCategory(null)
                    setScopeOpen(false)
                }}
                className={`w-full text-left px-3.5 py-2.5 text-sm transition-colors ${
                    searchScope.id === 'all' && !expandedCategory
                        ? 'font-semibold'
                        : 'hover:bg-[#eef4ef]'
                }`}
                style={{
                    color: searchScope.id === 'all' && !expandedCategory ? BRAND.green : BRAND.text,
                    backgroundColor: searchScope.id === 'all' && !expandedCategory ? BRAND.greenLight : undefined,
                }}
            >
                All Categories
            </button>
            <div className="my-1 border-t border-gray-200" />
            {navMenus.map((menu) => {
                const open = expandedCategory === menu.id
                return (
                    <div key={menu.id}>
                        <button
                            type="button"
                            onClick={() => {
                                setExpandedCategory(open ? null : menu.id)
                                setSearchScope(
                                    SEARCH_SCOPES.find((s) => s.id === menu.id) || SEARCH_SCOPES[0],
                                )
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                                open || searchScope.id === menu.id
                                    ? ''
                                    : 'hover:bg-[#eef4ef]'
                            }`}
                            style={{
                                color: open || searchScope.id === menu.id ? BRAND.green : BRAND.text,
                                backgroundColor: open || searchScope.id === menu.id ? BRAND.greenLight : undefined,
                            }}
                        >
                            {menu.label}
                            <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
                        </button>
                        {open && (
                            <div className="border-y border-gray-200 py-1" style={{ backgroundColor: BRAND.bottomBg }}>
                                <Link
                                    href={menu.href}
                                    onClick={() => {
                                        setScopeOpen(false)
                                        setExpandedCategory(null)
                                    }}
                                    className="block px-5 py-2 text-xs font-bold uppercase tracking-wide hover:bg-[#eef4ef]"
                                    style={{ color: BRAND.green }}
                                >
                                    All {menu.label}
                                </Link>
                                {menu.items.map((item) => (
                                    <Link
                                        key={`${menu.id}-${item.name}`}
                                        href={item.href}
                                        onClick={() => {
                                            setScopeOpen(false)
                                            setExpandedCategory(null)
                                        }}
                                        className="block px-5 py-2 text-sm hover:bg-[#eef4ef]"
                                        style={{ color: BRAND.text }}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )

    return (
        <>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
                {/* ── Top row (always visible) ── */}
                <div className="relative z-20 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    <div className="flex items-center gap-2 sm:gap-3 lg:gap-3 h-14 sm:h-[4.25rem] min-w-0">
                        {/* Mobile menu left */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(true)}
                            className="p-1.5 -ml-1 text-slate-700 hover:text-emerald-700 lg:hidden rounded-lg hover:bg-emerald-50 transition-colors shrink-0"
                            aria-label="Open menu"
                        >
                            <Menu size={22} />
                        </button>

                        <Link href="/" className="shrink-0 hover:opacity-90 transition-opacity">
                            <Image
                                src={assets.logo}
                                alt="LeafyLand"
                                width={150}
                                height={38}
                                className="h-6 sm:h-7 md:h-9 w-auto object-contain"
                                priority
                            />
                        </Link>

                        <span className="hidden md:block h-9 w-px bg-gray-200 shrink-0" aria-hidden />

                        {/* Deliver to — desktop */}
                        <div ref={locationRef} className="relative hidden md:block shrink-0">
                            <button
                                type="button"
                                onClick={() => setLocationOpen(!locationOpen)}
                                className="flex items-start gap-1.5 px-2 py-1 rounded-lg hover:bg-[#eef4ef] transition-colors text-left"
                            >
                                <MapPin size={18} className="mt-0.5 shrink-0" style={{ color: BRAND.green }} />
                                <span>
                                    <span className="block text-[10px] font-medium leading-tight" style={{ color: BRAND.muted }}>
                                        Deliver to
                                    </span>
                                    <span className="flex items-center gap-0.5 text-sm font-bold leading-tight" style={{ color: BRAND.text }}>
                                        {location}
                                        <ChevronDown size={14} className={`text-gray-400 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
                                    </span>
                                </span>
                            </button>

                            {locationOpen && (
                                <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                                    <div className="p-3 border-b border-slate-100">
                                        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Location</p>
                                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2.5">
                                            <Search size={15} className="text-slate-400 shrink-0" />
                                            <input
                                                type="text"
                                                placeholder="Search city..."
                                                value={locationSearch}
                                                onChange={(e) => setLocationSearch(e.target.value)}
                                                className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder-slate-400"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto">
                                        {filteredCities.map((city) => (
                                            <button
                                                key={city.name}
                                                type="button"
                                                onClick={() => selectCity(city.name)}
                                                className={`w-full flex items-center gap-2.5 px-4 py-3 text-sm text-left transition-colors ${
                                                    location === city.name
                                                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                                        : 'text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                <MapPin size={14} className={location === city.name ? 'text-emerald-600' : 'text-slate-300'} />
                                                {city.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Categories dropdown — iPad + desktop; search input desktop only */}
                        <div className="hidden md:flex flex-1 min-w-0 max-w-2xl items-stretch">
                            <div ref={scopeRef} className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setScopeOpen((open) => {
                                            if (open) setExpandedCategory(null)
                                            return !open
                                        })
                                    }}
                                    className="h-10 sm:h-11 flex items-center gap-1.5 px-3.5 text-xs font-semibold border border-gray-200 rounded-xl lg:rounded-l-xl lg:rounded-r-none hover:opacity-90 transition-opacity whitespace-nowrap"
                                    style={{ backgroundColor: BRAND.categoryBg, color: BRAND.text }}
                                >
                                    {searchScope.label}
                                    <ChevronDown size={13} className="text-gray-500" style={{ transform: scopeOpen ? 'rotate(180deg)' : undefined }} />
                                </button>
                                {scopeOpen && categoriesDropdown}
                            </div>

                            <form
                                onSubmit={handleSearch}
                                className="hidden lg:flex flex-1 min-w-0 items-stretch h-11 border border-gray-200 border-l-0 rounded-r-xl bg-white focus-within:border-[#2f7d4a] focus-within:ring-1 focus-within:ring-[#2f7d4a]/20"
                            >
                                <input
                                    className="flex-1 min-w-0 px-3 text-sm outline-none placeholder:text-gray-400"
                                    style={{ color: BRAND.text }}
                                    type="text"
                                    placeholder={scrolled ? 'Search products, services...' : 'Search products, services, properties...'}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="shrink-0 w-12 rounded-r-xl text-white flex items-center justify-center transition-colors hover:opacity-90"
                                    style={{ backgroundColor: BRAND.green }}
                                    aria-label="Search"
                                >
                                    <Search size={18} />
                                </button>
                            </form>
                        </div>

                        <div className="flex-1 md:hidden" />

                        {/* Actions */}
                        <div className="flex items-center gap-0 ml-auto shrink-0">
                            <button
                                type="button"
                                onClick={() => setMobileSearchOpen(true)}
                                className="p-1.5 sm:p-2 lg:hidden rounded-lg hover:bg-[#eef4ef] transition-colors"
                                style={{ color: BRAND.text }}
                                aria-label="Open search"
                            >
                                <Search size={20} strokeWidth={1.75} />
                            </button>

                            <Link
                                href={accountHref}
                                className="flex flex-col items-center gap-0.5 px-1 sm:px-1.5 md:px-2 py-1 rounded-lg hover:bg-[#eef4ef] transition-colors"
                                style={{ color: BRAND.text }}
                            >
                                <User size={20} strokeWidth={1.75} />
                                <span className="hidden lg:block text-[10px] font-medium max-w-[64px] truncate" style={{ color: BRAND.muted }}>
                                    {accountLabel}
                                </span>
                            </Link>

                            <Link
                                href="/orders"
                                className="hidden sm:flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-[#eef4ef] transition-colors"
                                style={{ color: BRAND.text }}
                            >
                                <Package size={20} strokeWidth={1.75} />
                                <span className="hidden lg:block text-[10px] font-medium" style={{ color: BRAND.muted }}>Orders</span>
                            </Link>

                            <Link
                                href="/profile"
                                className="hidden sm:flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg hover:bg-[#eef4ef] transition-colors"
                                style={{ color: BRAND.text }}
                                aria-label="Wishlist"
                            >
                                <Heart size={20} strokeWidth={1.75} />
                                <span className="hidden lg:block text-[10px] font-medium" style={{ color: BRAND.muted }}>Wishlist</span>
                            </Link>

                            <Link
                                href="/cart"
                                className="relative flex flex-col items-center gap-0.5 px-1 sm:px-1.5 md:px-2 py-1 rounded-lg hover:bg-[#eef4ef] transition-colors"
                                style={{ color: BRAND.text }}
                            >
                                <ShoppingCart size={20} strokeWidth={1.75} />
                                <span className="hidden lg:block text-[10px] font-medium" style={{ color: BRAND.muted }}>Cart</span>
                                {cartCount > 0 && (
                                    <span
                                        className="absolute top-0 right-0.5 text-[10px] font-bold text-white min-w-[16px] h-4 rounded-full flex items-center justify-center px-1"
                                        style={{ backgroundColor: BRAND.green }}
                                    >
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Bottom row — desktop full view only (hides when scrolled) ── */}
                <div
                    className={`hidden lg:block border-t border-gray-200 transition-[max-height,opacity] duration-300 ease-out ${
                        scrolled
                            ? 'relative z-10 max-h-0 opacity-0 pointer-events-none border-t-0 overflow-hidden'
                            : `relative ${openMenu ? 'z-30' : 'z-10'} h-11 opacity-100 overflow-visible`
                    }`}
                    style={{ backgroundColor: BRAND.bottomBg }}
                >
                    <div className="max-w-7xl mx-auto px-4 lg:px-6">
                        <div ref={menuRef} className="flex items-center h-11 min-w-0">
                            {SECONDARY_NAV_MENUS.map((menu) => {
                                const open = openMenu === menu.id
                                const MenuIcon = BOTTOM_NAV_ICONS[menu.id]
                                return (
                                    <div key={menu.id} className="relative">
                                        <button
                                            type="button"
                                            onClick={(e) => toggleMenu(menu.id, e.currentTarget)}
                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap ${
                                                open ? 'bg-white/80' : 'hover:bg-white/60'
                                            }`}
                                            style={{ color: BRAND.text }}
                                        >
                                            {MenuIcon && <MenuIcon size={15} strokeWidth={1.75} className="text-gray-600" />}
                                            {menu.label}
                                            <ChevronDown size={13} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
                                        </button>
                                    </div>
                                )
                            })}

                            <div className="relative">
                                <button
                                    type="button"
                                    onClick={(e) => toggleMenu('more', e.currentTarget)}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors ${
                                        openMenu === 'more' ? 'bg-white/80' : 'hover:bg-white/60'
                                    }`}
                                    style={{ color: BRAND.text }}
                                >
                                    <Ellipsis size={15} strokeWidth={1.75} className="text-gray-600" />
                                    More
                                    <ChevronDown size={13} className={`text-gray-500 transition-transform ${openMenu === 'more' ? 'rotate-180' : ''}`} />
                                </button>
                            </div>

                            {openMenu && (
                                <PopularDropdown
                                    open
                                    anchorEl={menuAnchor}
                                    items={
                                        openMenu === 'more'
                                            ? MORE_NAV_LINKS
                                            : buildPopularItems(openMenu, niches)
                                    }
                                    onNavigate={() => {
                                        setOpenMenu(null)
                                        setMenuAnchor(null)
                                    }}
                                    className={openMenu === 'more' ? 'w-56' : 'w-72'}
                                />
                            )}

                            <div className="flex-1 min-w-2" />

                            <span className="mx-2 h-5 w-px bg-gray-300 shrink-0" aria-hidden />

                            <Link
                                href="/products"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
                                style={{ color: BRAND.green }}
                            >
                                <Percent size={15} strokeWidth={2} />
                                Today&apos;s Deals
                            </Link>
                            <Link
                                href="/become-seller"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[13px] font-semibold hover:opacity-80 transition-opacity whitespace-nowrap"
                                style={{ color: BRAND.green }}
                            >
                                <Store size={15} strokeWidth={1.75} />
                                Sell on LeafyLand
                            </Link>
                            <Link
                                href="/services"
                                className={`ml-2 ${brandPrimaryCtaClass}`}
                                style={{ backgroundColor: BRAND.green }}
                            >
                                <CalendarDays size={14} strokeWidth={1.75} />
                                Book a Service
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {mounted && mobileSearchOpen && createPortal(
                <div className="fixed inset-0 z-[110] lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={() => setMobileSearchOpen(false)}
                        aria-hidden
                    />
                    <div
                        className="relative bg-white border-b border-slate-200 shadow-lg px-3 py-3"
                        style={{ paddingTop: 'max(0.75rem, env(safe-area-inset-top))' }}
                    >
                        <form onSubmit={handleSearch} className="flex items-center gap-2">
                            <div className="flex-1 flex items-stretch h-11 rounded-xl border border-gray-200 bg-white overflow-hidden focus-within:border-[#2f7d4a] focus-within:ring-1 focus-within:ring-[#2f7d4a]/20">
                                <input
                                    ref={mobileSearchInputRef}
                                    className="flex-1 min-w-0 px-3 text-sm outline-none placeholder:text-gray-400"
                                    style={{ color: BRAND.text }}
                                    type="text"
                                    placeholder="Search products, services..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="shrink-0 w-11 text-white flex items-center justify-center hover:opacity-90"
                                    style={{ backgroundColor: BRAND.green }}
                                    aria-label="Search"
                                >
                                    <Search size={18} />
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={() => setMobileSearchOpen(false)}
                                className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg shrink-0"
                                aria-label="Close search"
                            >
                                <X size={20} />
                            </button>
                        </form>
                    </div>
                </div>,
                document.body,
            )}

            {mounted && createPortal(
                <div className={`lg:hidden ${mobileMenuOpen ? '' : 'pointer-events-none'}`} aria-hidden={!mobileMenuOpen}>
                    <div
                        className={`fixed inset-0 z-[90] bg-black/40 transition-opacity duration-300 ${
                            mobileMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                    />
                    <div
                        className={`fixed inset-y-0 left-0 z-[100] w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
                            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                        style={{
                            paddingTop: 'env(safe-area-inset-top)',
                            paddingBottom: 'env(safe-area-inset-bottom)',
                        }}
                    >
                        <div className="flex flex-col h-full p-5 overflow-y-auto overscroll-contain">
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <Image src={assets.logo} alt="LeafyLand" width={120} height={30} className="h-7 w-auto object-contain" />
                                <button type="button" onClick={() => setMobileMenuOpen(false)} className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="mt-4">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">Deliver to</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {cities.slice(0, 8).map((city) => (
                                        <button
                                            key={city.name}
                                            type="button"
                                            onClick={() => selectCity(city.name)}
                                            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                                location === city.name
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-slate-50 text-slate-600 hover:bg-emerald-50'
                                            }`}
                                        >
                                            {city.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 space-y-1">
                                <p className="px-1 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                    Browse
                                </p>
                                {SECONDARY_NAV_MENUS.map((menu) => {
                                    const open = mobileAccordion === menu.id
                                    return (
                                        <div key={menu.id} className="border border-slate-100 rounded-xl overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setMobileAccordion(open ? null : menu.id)}
                                                className="w-full flex items-center justify-between px-3.5 py-3 text-sm font-semibold text-slate-800 bg-emerald-50/50"
                                            >
                                                {menu.label}
                                                <ChevronDown size={16} className={`text-emerald-600 transition-transform ${open ? 'rotate-180' : ''}`} />
                                            </button>
                                            {open && (
                                                <div className="py-2 bg-white">
                                                    <p className="px-3.5 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-500">
                                                        Popular
                                                    </p>
                                                    <div className="mx-3.5 border-t border-slate-100 mb-1" />
                                                    {(buildPopularItems(menu.id, niches)).map((item) => (
                                                        <Link
                                                            key={item.name}
                                                            href={item.href}
                                                            onClick={() => setTimeout(() => setMobileMenuOpen(false), 0)}
                                                            className="flex items-center gap-3 px-3.5 py-2.5 text-sm text-slate-700 hover:bg-emerald-50"
                                                        >
                                                            {item.icon && <NavIcon name={item.icon} size={17} />}
                                                            <span>{item.name}</span>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2">
                                <Link href="/products" onClick={() => setTimeout(() => setMobileMenuOpen(false), 0)}
                                    className="flex items-center justify-center gap-2 py-2.5 text-emerald-700 border border-emerald-200 rounded-xl text-sm font-semibold">
                                    <Percent size={16} /> Today&apos;s Deals
                                </Link>
                                <Link href="/become-seller" onClick={() => setTimeout(() => setMobileMenuOpen(false), 0)}
                                    className="flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold">
                                    <Store size={16} /> Sell on LeafyLand
                                </Link>
                                <Link href="/services" onClick={() => setTimeout(() => setMobileMenuOpen(false), 0)}
                                    className="flex items-center justify-center gap-2 py-2.5 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold">
                                    <CalendarDays size={16} /> Book a Service
                                </Link>
                                <Link href={accountHref} onClick={() => setTimeout(() => setMobileMenuOpen(false), 0)}
                                    className="w-full py-2.5 text-white font-medium rounded-xl text-sm text-center hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: BRAND.green }}>
                                    {session?.user ? 'Account' : 'Login / Sign Up'}
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body,
            )}
        </>
    )
}

export default Navbar
