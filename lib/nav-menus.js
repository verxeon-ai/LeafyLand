// Main navbar menus: Products, Services, Properties + existing subcategories.

import { LEAFY_CATEGORIES, MARKETPLACE_CATEGORIES } from '@/lib/categories'
import { nicheToNavItem, productHref } from '@/lib/product-niches'

export const SEARCH_SCOPES = [
    { id: 'all', label: 'All Categories', path: '/products' },
    { id: 'products', label: 'Products', path: '/products' },
    { id: 'services', label: 'Services', path: '/services' },
    { id: 'properties', label: 'Properties', path: '/properties' },
]

/** Fallback when API has no products yet */
export const PRODUCTS_SUBCATEGORIES = [
    ...LEAFY_CATEGORIES.map((name) => ({ name, href: productHref(name) })),
    ...MARKETPLACE_CATEGORIES.map((name) => ({ name, href: productHref(name) })),
]

export const BOOK_SERVICE_ITEM = {
    name: 'Book a service',
    href: '/services',
    icon: 'calendar',
}

export const SERVICES_SUBCATEGORIES = [
    { name: 'Garden Maintenance', href: '/services?category=Garden+Maintenance' },
    { name: 'Landscaping', href: '/services?category=Landscaping' },
    { name: 'Irrigation', href: '/services?category=Irrigation' },
    { name: 'Tree Care', href: '/services?category=Tree+Care' },
    { name: 'Lawn Care', href: '/services?category=Lawn+Care' },
]

export const PROPERTIES_SUBCATEGORIES = [
    { name: 'Farmhouses', href: '/properties?type=Farmhouse' },
    { name: 'Land', href: '/properties?type=Agricultural+Land' },
    { name: 'Nursery', href: '/properties?type=Nursery' },
    { name: 'All Properties', href: '/properties' },
]

/** Homepage property carousels under the properties banner */
export const HOME_PROPERTY_SECTIONS = [
    { title: 'Farmhouses', type: 'Farmhouse' },
    { title: 'Agricultural Land', type: 'Agricultural Land' },
    { title: 'Farm Stays', type: 'Farm Stay' },
    { title: 'Nursery', type: 'Nursery' },
]

export const MAIN_NAV_MENUS = [
    {
        id: 'products',
        label: 'Products',
        href: '/products',
        items: PRODUCTS_SUBCATEGORIES,
    },
    {
        id: 'services',
        label: 'Services',
        href: '/services',
        items: [...SERVICES_SUBCATEGORIES, BOOK_SERVICE_ITEM],
    },
    {
        id: 'properties',
        label: 'Properties',
        href: '/properties',
        items: PROPERTIES_SUBCATEGORIES,
    },
]

/** Bottom-nav menus — niches loaded live from product/service/property APIs in Navbar */
export const SECONDARY_NAV_MENUS = [
    { id: 'shop', label: 'Shop', href: '/products', nicheSource: 'products-all' },
    { id: 'services', label: 'Services', href: '/services', nicheSource: 'services' },
    { id: 'classifieds', label: 'Classifieds', href: '/products', nicheSource: 'classifieds' },
    { id: 'property', label: 'Property', href: '/properties', nicheSource: 'properties' },
]

export const MORE_NAV_LINKS = [
    { name: 'About', href: '/about', icon: 'info' },
    { name: 'How it works', href: '/how-it-works', icon: 'compass' },
    { name: 'Seller pricing', href: '/pricing', icon: 'tag' },
    { name: 'Contact', href: '/contact', icon: 'mail' },
    { name: 'Become a Seller', href: '/become-seller', icon: 'store' },
    { name: 'Become a partner', href: '/partner', icon: 'handshake' },
]

const SERVICE_ICONS = {
    'Daily Needs Services': 'droplets',
    'Home Services': 'home',
    'Garden Maintenance': 'scissors',
    Landscaping: 'tree',
    Irrigation: 'droplets',
}

/** Classifieds dropdown — short curated list only */
export const CLASSIFIEDS_NAV_ITEMS = [
    { name: 'Gardening', href: '/products?category=Gardening', icon: 'shovel' },
    { name: 'Electronics', href: '/products?category=Electronics', icon: 'smartphone' },
    { name: 'Sports', href: '/products?category=Sports+%26+Outdoors', icon: 'trophy' },
    { name: 'Fashion', href: '/products?category=Fashion', icon: 'shirt' },
    { name: 'Home & Kitchen', href: '/products?category=Home+%26+Kitchen', icon: 'sofa' },
]

export function buildPopularItems(menuId, niches) {
    switch (menuId) {
        case 'shop': {
            const productItems = niches.productsAll.length > 0
                ? niches.productsAll.map(nicheToNavItem)
                : LEAFY_CATEGORIES.map(nicheToNavItem)
            return [
                ...productItems,
                { name: 'All products', href: '/products', icon: 'tag' },
            ]
        }
        case 'classifieds':
            return CLASSIFIEDS_NAV_ITEMS
        case 'services': {
            const items = niches.services.length > 0
                ? niches.services.map((n) => ({
                    name: n.name,
                    href: `/services?category=${encodeURIComponent(n.name)}`,
                    icon: SERVICE_ICONS[n.name] || 'leaf',
                }))
                : SERVICES_SUBCATEGORIES.map((s) => ({
                    ...s,
                    icon: SERVICE_ICONS[s.name] || 'leaf',
                }))
            return [
                ...items,
                BOOK_SERVICE_ITEM,
            ]
        }
        case 'property':
            return niches.properties.length > 0
                ? [
                    ...niches.properties.map((n) => ({
                        name: n.name,
                        href: `/properties?type=${encodeURIComponent(n.name)}`,
                        icon: 'home',
                    })),
                    { name: 'All properties', href: '/properties', icon: 'tag' },
                ]
                : PROPERTIES_SUBCATEGORIES.map((p) => ({ ...p, icon: 'home' }))
        default:
            return []
    }
}

/** Full product category list for the search-bar Products dropdown */
export function buildProductsMenuItems() {
    return PRODUCTS_SUBCATEGORIES
}
