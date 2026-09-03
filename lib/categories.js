// Central source of truth for product categories.
// "Marketplace" categories are treated as marketplace listings (derived from
// the category value itself — there is no separate DB column).

export const LEAFY_CATEGORIES = [
    'Big Plant', 'Bulbs', 'Fruit Plant', 'Gardening', 'Indoor Greenary',
    'Planters', 'Plants', 'Seeds', 'Soil & Fertilizers',
]

export const MARKETPLACE_CATEGORIES = [
    'Electronics', 'Mobile Phones', 'Laptops', 'Fashion',
    'Home & Kitchen', 'Sports & Outdoors', 'Books & Stationery',
    'Toys & Games', 'Beauty & Personal Care', 'Automotive',
]

export const ALL_CATEGORIES = [...LEAFY_CATEGORIES, ...MARKETPLACE_CATEGORIES]

export const isMarketplaceCategory = (category) =>
    MARKETPLACE_CATEGORIES.includes(category)

// Homepage shows at most these three product groups under the partners marquee.
export const HOME_PRODUCT_GROUPS = [
    {
        id: 'leafyland',
        title: 'LeafyLand',
        subtitle: 'Plants, pots, seeds & garden essentials',
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
            'Fashion', 'Home & Kitchen', 'Sports & Outdoors',
            'Books & Stationery', 'Toys & Games',
            'Beauty & Personal Care', 'Automotive',
        ],
    },
]

export function getHomeProductGroup(id) {
    return HOME_PRODUCT_GROUPS.find((g) => g.id === id) || null
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
