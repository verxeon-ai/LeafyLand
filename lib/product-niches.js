import { isMarketplaceCategory } from '@/lib/categories'

export const productHref = (category) =>
    `/products?category=${encodeURIComponent(category)}`

/** Map product category names to navbar icon keys */
const ICON_BY_CATEGORY = {
    'Big Plant': 'tree',
    Bulbs: 'flower',
    'Fruit Plant': 'apple',
    Gardening: 'shovel',
    'Indoor Greenery': 'sprout',
    'Indoor Greenary': 'sprout',
    Planters: 'pot',
    Plants: 'leaf',
    Seeds: 'seedling',
    'Soil & Fertilizers': 'flask',
    Electronics: 'smartphone',
    'Mobile Phones': 'smartphone',
    Laptops: 'smartphone',
    Fashion: 'shirt',
    'Home & Kitchen': 'sofa',
    'Sports & Outdoors': 'trophy',
    'Books & Stationery': 'tag',
    'Toys & Games': 'tag',
    'Beauty & Personal Care': 'tag',
    Automotive: 'truck',
}

function iconForCategory(name) {
    if (ICON_BY_CATEGORY[name]) return ICON_BY_CATEGORY[name]
    const lower = name.toLowerCase()
    if (lower.includes('plant') || lower.includes('garden') || lower.includes('leaf')) return 'leaf'
    if (lower.includes('electronic') || lower.includes('phone') || lower.includes('laptop')) return 'smartphone'
    if (lower.includes('fashion') || lower.includes('cloth')) return 'shirt'
    if (lower.includes('home') || lower.includes('kitchen') || lower.includes('furniture')) return 'sofa'
    if (lower.includes('sport') || lower.includes('outdoor')) return 'trophy'
    if (lower.includes('seed') || lower.includes('bulb')) return 'seedling'
    if (lower.includes('tool')) return 'shovel'
    return 'tag'
}

export function nicheToNavItem(niche) {
    const name = typeof niche === 'string' ? niche : niche.name
    return {
        name,
        href: productHref(name),
        icon: iconForCategory(name),
        count: typeof niche === 'object' ? niche.count : undefined,
    }
}

export function splitProductNiches(niches) {
    const leafy = []
    const marketplace = []
    for (const niche of niches) {
        if (isMarketplaceCategory(niche.name)) marketplace.push(niche)
        else leafy.push(niche)
    }
    return { all: niches, leafy, marketplace }
}
