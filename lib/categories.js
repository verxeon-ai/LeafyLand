// Central source of truth for product categories.
// "Marketplace" categories are treated as marketplace listings (derived from
// the category value itself — there is no separate DB column).

// Seed / vendor form labels for garden products.
export const LEAFY_CATEGORIES = [
    'Big Plant', 'Bulbs', 'Fruit Plant', 'Gardening', 'Indoor Greenery',
    'Planters', 'Plants', 'Seeds', 'Soil & Fertilizers',
    // Navbar strip / common VPS labels
    'Garden Tools', 'Irrigation', 'Fertilizers', 'Pots', 'Landscaping',
    'Plant', 'Garden', 'Nursery', 'Organic', 'Soil', 'Fertilizer',
]

/** Known misspellings / alternate labels → canonical category. */
export const CATEGORY_ALIASES = {
    'Indoor Greenary': 'Indoor Greenery',
}

/** Expand a category label to all DB spellings that should match it. */
export function expandCategoryNames(category) {
    const raw = String(category || '').trim()
    if (!raw) return []
    const canonical = CATEGORY_ALIASES[raw] || raw
    const names = new Set([canonical, raw])
    for (const [alias, target] of Object.entries(CATEGORY_ALIASES)) {
        if (target.toLowerCase() === canonical.toLowerCase()) names.add(alias)
    }
    return [...names]
}

/** Prisma where fragment for one category (includes aliases). */
export function categoryEqualsWhere(category) {
    const names = expandCategoryNames(category)
    if (!names.length) return null
    if (names.length === 1) {
        return { category: { equals: names[0], mode: 'insensitive' } }
    }
    return {
        OR: names.map((c) => ({ category: { equals: c, mode: 'insensitive' } })),
    }
}

export const MARKETPLACE_CATEGORIES = [
    'Electronics', 'Mobile Phones', 'Laptops', 'Fashion',
    'Home & Kitchen', 'Grocery', 'Sports & Outdoors', 'Books & Stationery',
    'Toys & Games', 'Beauty & Personal Care', 'Pet Supplies', 'Automotive',
]

export const ALL_CATEGORIES = [...new Set([...LEAFY_CATEGORIES, ...MARKETPLACE_CATEGORIES])]

const MARKETPLACE_LOWER = new Set(
    MARKETPLACE_CATEGORIES.map((c) => c.toLowerCase()),
)

export const isMarketplaceCategory = (category) =>
    MARKETPLACE_LOWER.has(String(category || '').trim().toLowerCase())

/** Garden / LeafyLand catalog = anything that is not a marketplace category. */
export const isLeafyCategory = (category) =>
    Boolean(String(category || '').trim()) && !isMarketplaceCategory(category)

/** Prisma where fragment: exclude known marketplace category labels (case-insensitive). */
export function notMarketplaceCategoryWhere() {
    return {
        NOT: {
            OR: MARKETPLACE_CATEGORIES.map((c) => ({
                category: { equals: c, mode: 'insensitive' },
            })),
        },
    }
}

// Homepage shows at most these three product groups under the partners marquee.
export const HOME_PRODUCT_GROUPS = [
    {
        id: 'leafyland',
        title: 'LeafyLand',
        subtitle: 'Plants, pots, seeds & garden essentials',
        // Match any non-marketplace category so VPS gardening labels still appear
        // even when they are not in LEAFY_CATEGORIES (e.g. "Garden Tools", "Pots").
        mode: 'leafy',
        categories: LEAFY_CATEGORIES,
    },
    {
        id: 'electronics',
        title: 'Electronics',
        subtitle: 'Phones, laptops & gadgets',
        categories: ['Electronics', 'Mobile Phones', 'Laptops'],
    },
    {
        id: 'lifestyle',
        title: 'Lifestyle',
        subtitle: 'Fashion, home, beauty & more',
        categories: [
            'Fashion', 'Home & Kitchen', 'Grocery', 'Sports & Outdoors',
            'Books & Stationery', 'Toys & Games',
            'Beauty & Personal Care', 'Pet Supplies', 'Automotive',
        ],
    },
]

/** Per-category carousels under the partners marquee (Shop / leafy catalog). */
export const HOME_CATEGORY_SECTIONS = [
    { title: 'Big Plant', category: 'Big Plant' },
    { title: 'Bulbs', category: 'Bulbs' },
    { title: 'Fruit Plant', category: 'Fruit Plant' },
    { title: 'Gardening', category: 'Gardening' },
    { title: 'Indoor Greenery', category: 'Indoor Greenery', aliases: ['Indoor Greenary'] },
    { title: 'Planters', category: 'Planters' },
    { title: 'Plants', category: 'Plants' },
    { title: 'Seeds', category: 'Seeds' },
    { title: 'Soil & Fertilizers', category: 'Soil & Fertilizers' },
    { title: 'Garden Tools', category: 'Garden Tools' },
    { title: 'Irrigation', category: 'Irrigation' },
    { title: 'Fertilizers', category: 'Fertilizers' },
    { title: 'Pots', category: 'Pots' },
    { title: 'Landscaping', category: 'Landscaping' },
]

export function getHomeProductGroup(id) {
    return HOME_PRODUCT_GROUPS.find((g) => g.id === id) || null
}

/** Build a Prisma `category` filter for a homepage group (or null). */
export function getHomeGroupCategoryWhere(group) {
    if (!group) return null
    if (group.mode === 'leafy') return notMarketplaceCategoryWhere()
    if (Array.isArray(group.categories) && group.categories.length) {
        return {
            OR: group.categories.map((c) => ({
                category: { equals: c, mode: 'insensitive' },
            })),
        }
    }
    return null
}

// Display categories shown in the navbar CategoriesStrip. These are the labels
// the visitor sees; each maps (via its dropdown sub-links in CategoriesStrip)
// to one or more product categories. They are backed by the Category table and
// seeded from here so the UI and DB stay in sync.
export const STRIP_LEAFY = [
    'Plants', 'Garden Tools', 'Irrigation', 'Farmhouses',
    'Landscaping', 'Fertilizers', 'Pots',
]

export const STRIP_MARKETPLACE = MARKETPLACE_CATEGORIES

export const STRIP_CATEGORIES = [
    ...STRIP_LEAFY.map((name, i) => ({ name, type: 'leafy', order: i })),
    ...STRIP_MARKETPLACE.map((name, i) => ({
        name,
        type: 'marketplace',
        order: STRIP_LEAFY.length + i,
    })),
]
