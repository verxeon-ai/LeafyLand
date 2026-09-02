'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Package,
    Plus,
    ShoppingCart,
    BarChart3,
    Star,
    Users,
    Wallet,
    Settings,
    MessageSquare,
    Tag,
    Boxes,
    Home,
    Wrench,
    Calendar,
    MapPin,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react'
import { BRAND_GREEN, BRAND_GREEN_LIGHT, BRAND_MUTED, BRAND_TEXT, brandLabelClass } from '@/lib/brand-ui'
import { VENDOR_ROUTE_API, prefetchVendorApi } from '@/lib/cachedJson'

const navGroups = [
    {
        label: 'Overview',
        items: [{ name: 'Dashboard', href: '/store', icon: LayoutDashboard }],
    },
    {
        label: 'Products',
        items: [
            { name: 'All Products', href: '/store/products', icon: Package },
            { name: 'Add Product', href: '/store/add-product', icon: Plus },
            { name: 'Inventory', href: '/store/inventory', icon: Boxes },
        ],
    },
    {
        label: 'Listings',
        items: [
            { name: 'Properties', href: '/store/properties', icon: Home },
            { name: 'Add Property', href: '/store/add-property', icon: Plus },
            { name: 'Services', href: '/store/services', icon: Wrench },
            { name: 'Add Service', href: '/store/add-service', icon: Plus },
            { name: 'Bookings', href: '/store/bookings', icon: Calendar },
            { name: 'Visits', href: '/store/visits', icon: MapPin },
        ],
    },
    {
        label: 'Sales',
        items: [
            { name: 'Orders', href: '/store/orders', icon: ShoppingCart },
            { name: 'Customers', href: '/store/customers', icon: Users },
            { name: 'Coupons', href: '/store/coupons', icon: Tag },
        ],
    },
    {
        label: 'Insights',
        items: [
            { name: 'Analytics', href: '/store/analytics', icon: BarChart3 },
            { name: 'Reviews', href: '/store/reviews', icon: Star },
            { name: 'Payouts', href: '/store/payouts', icon: Wallet },
        ],
    },
    {
        label: 'Account',
        items: [
            { name: 'Messages', href: '/store/messages', icon: MessageSquare },
            { name: 'Settings', href: '/store/settings', icon: Settings },
        ],
    },
]

function isActive(pathname, href) {
    if (href === '/store') return pathname === '/store'
    return pathname === href || pathname.startsWith(`${href}/`)
}

function isDesktop() {
    return typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches
}

const StoreSidebar = ({ mobileOpen, onMobileClose, collapsed, onToggleCollapsed }) => {
    const pathname = usePathname()
    const router = useRouter()
    const [tip, setTip] = useState(null)
    const [unreadCount, setUnreadCount] = useState(0)
    const iconOnly = collapsed

    const warmRoute = (href) => {
        router.prefetch(href)
        prefetchVendorApi(VENDOR_ROUTE_API[href])
    }

    const hideTip = () => setTip(null)

    const showTip = (event, label) => {
        if (!iconOnly || !isDesktop()) return
        const rect = event.currentTarget.getBoundingClientRect()
        setTip({
            label,
            top: rect.top + rect.height / 2,
            left: rect.right + 12,
        })
    }

    useEffect(() => {
        hideTip()
    }, [collapsed, pathname, mobileOpen])

    useEffect(() => {
        window.addEventListener('resize', hideTip)
        return () => window.removeEventListener('resize', hideTip)
    }, [])

    useEffect(() => {
        let cancelled = false
        fetch('/api/vendor/messages')
            .then((r) => r.json())
            .then((data) => {
                if (cancelled || !Array.isArray(data)) return
                setUnreadCount(data.filter((m) => !m.read).length)
            })
            .catch(() => {})
        return () => { cancelled = true }
    }, [pathname])

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-slate-900/30 lg:hidden"
                    onClick={onMobileClose}
                />
            )}

            {tip && iconOnly && (
                <div
                    role="tooltip"
                    className="pointer-events-none fixed z-[60] -translate-y-1/2 rounded-xl border border-[#e4eee6] bg-white px-2.5 py-1.5 text-xs font-semibold shadow-sm"
                    style={{ top: tip.top, left: tip.left, color: BRAND_TEXT }}
                >
                    {tip.label}
                </div>
            )}

            <aside
                className={`
                    fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] flex-col
                    border-r border-[#e4eee6] bg-[#f4f8f5]
                    transition-[width,transform] duration-300 ease-in-out
                    sm:top-[4.25rem] sm:h-[calc(100vh-4.25rem)]
                    lg:static lg:z-auto lg:h-full lg:translate-x-0
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    ${iconOnly ? 'lg:w-[4.75rem]' : 'lg:w-64'}
                    w-64
                `}
            >
                <div className="hidden shrink-0 px-2.5 pt-3 pb-1 lg:block">
                    <button
                        type="button"
                        onClick={onToggleCollapsed}
                        onMouseEnter={(event) => showTip(event, iconOnly ? 'Expand menu' : 'Collapse menu')}
                        onMouseLeave={hideTip}
                        className={`
                            flex w-full items-center rounded-xl py-2 text-[13px] font-medium
                            transition-colors duration-200 hover:bg-[#eef4ef]
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7d4a]/25
                            ${iconOnly ? 'justify-center px-1.5' : 'justify-between gap-3 px-2.5'}
                        `}
                        style={{ color: BRAND_MUTED }}
                        aria-label={iconOnly ? 'Expand sidebar' : 'Collapse sidebar'}
                        aria-expanded={!iconOnly}
                    >
                        <span
                            className={`${brandLabelClass} transition-all duration-200 ${
                                iconOnly ? 'w-0 overflow-hidden opacity-0' : 'opacity-100'
                            }`}
                            style={{ color: BRAND_GREEN }}
                        >
                            Menu
                        </span>
                        {iconOnly ? (
                            <PanelLeftOpen size={18} strokeWidth={1.75} style={{ color: BRAND_GREEN }} />
                        ) : (
                            <PanelLeftClose size={18} strokeWidth={1.75} style={{ color: BRAND_GREEN }} />
                        )}
                    </button>
                </div>

                <nav className="flex-1 overflow-x-hidden overflow-y-auto px-2.5 pb-4 pt-3 lg:pt-0" onScroll={hideTip}>
                    {navGroups.map((group, groupIndex) => (
                        <div key={group.label} className="mb-3">
                            <p
                                className={`${brandLabelClass} mb-1.5 px-2.5 transition-all duration-200 ${
                                    iconOnly ? 'lg:mb-0 lg:h-0 lg:overflow-hidden lg:opacity-0' : 'opacity-100'
                                }`}
                                style={{ color: BRAND_GREEN }}
                            >
                                {group.label}
                            </p>
                            {iconOnly && groupIndex > 0 && (
                                <div
                                    className="mx-auto mb-2 hidden h-1 w-1 rounded-full lg:block"
                                    style={{ backgroundColor: BRAND_GREEN, opacity: 0.35 }}
                                    aria-hidden
                                />
                            )}
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    const active = isActive(pathname, item.href)
                                    const showUnread = item.name === 'Messages' && unreadCount > 0
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            prefetch
                                            title=""
                                            aria-label={item.name}
                                            aria-current={active ? 'page' : undefined}
                                            onMouseEnter={(event) => {
                                                warmRoute(item.href)
                                                showTip(event, showUnread ? `${item.name} (${unreadCount})` : item.name)
                                            }}
                                            onMouseLeave={hideTip}
                                            onFocus={() => warmRoute(item.href)}
                                            onClick={onMobileClose}
                                            className={`
                                                group relative flex items-center rounded-xl py-2 text-[13px] font-medium
                                                transition-colors duration-200
                                                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f7d4a]/25
                                                ${iconOnly ? 'gap-3 px-2.5 lg:justify-center lg:gap-0 lg:px-1.5' : 'gap-3 px-2.5'}
                                                ${active ? 'font-semibold' : 'text-slate-600 hover:bg-[#eef4ef]'}
                                            `}
                                            style={active ? { backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN } : undefined}
                                        >
                                            <item.icon
                                                size={18}
                                                strokeWidth={active ? 2 : 1.75}
                                                className="shrink-0"
                                                style={{ color: active ? BRAND_GREEN : BRAND_MUTED }}
                                            />
                                            <span
                                                className={`min-w-0 truncate transition-all duration-200 ${
                                                    iconOnly
                                                        ? 'lg:w-0 lg:overflow-hidden lg:opacity-0'
                                                        : 'opacity-100'
                                                }`}
                                                style={{ color: active ? BRAND_GREEN : BRAND_TEXT }}
                                            >
                                                {item.name}
                                            </span>
                                            {showUnread && !iconOnly && (
                                                <span
                                                    className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                                                    style={{ backgroundColor: BRAND_GREEN }}
                                                >
                                                    {unreadCount > 99 ? '99+' : unreadCount}
                                                </span>
                                            )}
                                            {showUnread && iconOnly && (
                                                <span
                                                    className="absolute right-1.5 top-1 h-2 w-2 rounded-full lg:block"
                                                    style={{ backgroundColor: BRAND_GREEN }}
                                                />
                                            )}
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    )
}

export default StoreSidebar
