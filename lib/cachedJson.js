const cache = new Map()
const inflight = new Map()
const SS_PREFIX = 'll-json:'
const DEFAULT_TTL = 90_000

function canUseSession() {
    try {
        return typeof window !== 'undefined' && typeof sessionStorage !== 'undefined'
    } catch {
        return false
    }
}

function readSession(url, ttlMs) {
    if (!canUseSession()) return null
    try {
        const raw = sessionStorage.getItem(SS_PREFIX + url)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed.at !== 'number') return null
        if (Date.now() - parsed.at > ttlMs) return null
        return parsed.data
    } catch {
        return null
    }
}

function writeSession(url, data) {
    if (!canUseSession()) return
    try {
        sessionStorage.setItem(SS_PREFIX + url, JSON.stringify({ at: Date.now(), data }))
    } catch {
        /* quota / private mode */
    }
}

function remember(url, data) {
    cache.set(url, { at: Date.now(), data })
    writeSession(url, data)
}

export function setCachedJson(url, data) {
    remember(url, data)
}

export const ADMIN_ROUTES = [
    '/admin',
    '/admin/stores',
    '/admin/approve',
    '/admin/users',
    '/admin/orders',
    '/admin/payouts',
    '/admin/contact',
    '/admin/products',
    '/admin/properties',
    '/admin/services',
    '/admin/coupons',
]

export const ADMIN_ROUTE_API = {
    '/admin': '/api/admin/dashboard',
    '/admin/stores': '/api/admin/stores',
    '/admin/approve': '/api/admin/stores',
    '/admin/users': '/api/admin/users',
    '/admin/orders': '/api/admin/orders',
    '/admin/payouts': '/api/admin/payouts',
    '/admin/contact': '/api/admin/contact',
    '/admin/products': '/api/admin/products',
    '/admin/properties': '/api/admin/properties',
    '/admin/services': '/api/admin/services',
    '/admin/coupons': '/api/admin/coupons',
}

export const VENDOR_ROUTES = [
    '/store',
    '/store/products',
    '/store/add-product',
    '/store/inventory',
    '/store/properties',
    '/store/add-property',
    '/store/services',
    '/store/add-service',
    '/store/bookings',
    '/store/visits',
    '/store/orders',
    '/store/customers',
    '/store/coupons',
    '/store/analytics',
    '/store/reviews',
    '/store/payouts',
    '/store/messages',
    '/store/settings',
]

export const VENDOR_ROUTE_API = {
    '/store': '/api/vendor/dashboard',
    '/store/products': '/api/vendor/products',
    '/store/inventory': '/api/vendor/products',
    '/store/properties': '/api/vendor/properties',
    '/store/services': '/api/vendor/services',
    '/store/bookings': '/api/vendor/bookings',
    '/store/visits': '/api/vendor/visits',
    '/store/orders': '/api/vendor/orders',
    '/store/customers': '/api/vendor/customers',
    '/store/coupons': '/api/vendor/coupons',
    '/store/analytics': '/api/vendor/analytics',
    '/store/reviews': '/api/vendor/reviews',
    '/store/payouts': '/api/vendor/payouts',
    '/store/messages': '/api/vendor/messages',
    '/store/settings': '/api/vendor/settings',
}

export function prefetchVendorApi(url) {
    if (!url || typeof window === 'undefined') return
    cachedJson(url).catch(() => {})
}

export function prefetchVendor() {
    if (typeof window === 'undefined') return
    const apis = [...new Set(Object.values(VENDOR_ROUTE_API))]
    const run = async () => {
        for (const url of apis) {
            if (peekCachedJson(url) !== undefined) continue
            try {
                await cachedJson(url)
            } catch {
                /* ignore prefetch errors */
            }
        }
    }
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => { run() }, { timeout: 4000 })
    } else {
        setTimeout(run, 400)
    }
}

export function prefetchAdminApi(url) {
    if (!url || typeof window === 'undefined') return
    cachedJson(url).catch(() => {})
}

export function prefetchAdmin() {
    if (typeof window === 'undefined') return
    const apis = [...new Set(Object.values(ADMIN_ROUTE_API))]
    const run = async () => {
        for (const url of apis) {
            if (peekCachedJson(url) !== undefined) continue
            try {
                await cachedJson(url)
            } catch {
                /* ignore prefetch errors */
            }
        }
    }
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => { run() }, { timeout: 4000 })
    } else {
        setTimeout(run, 400)
    }
}

/**
 * Sync read of in-memory or sessionStorage cache so listing pages can paint
 * instantly on back-navigation without waiting for the network.
 */
export function peekListedById(listUrl, id) {
    if (!id) return undefined
    const list = peekCachedJson(listUrl)
    if (!Array.isArray(list)) return undefined
    return list.find((item) => item.id === id)
}

export function peekDetail(detailUrl, listUrl, id) {
    const cached = peekCachedJson(detailUrl)
    if (cached && cached.id) return cached
    return peekListedById(listUrl, id)
}

export function peekCachedJson(url, { ttlMs = DEFAULT_TTL } = {}) {
    const now = Date.now()
    const hit = cache.get(url)
    if (hit && now - hit.at < ttlMs) return hit.data
    return undefined
}

/** Safe after mount only — sessionStorage differs from SSR and will hydrate-mismatch if used in render. */
export function restoreCachedJson(url, { ttlMs = DEFAULT_TTL } = {}) {
    const memory = peekCachedJson(url, { ttlMs })
    if (memory !== undefined) return memory
    const stored = readSession(url, ttlMs)
    if (stored !== null && stored !== undefined) {
        cache.set(url, { at: Date.now(), data: stored })
        return stored
    }
    return undefined
}

/**
 * Dedupes in-flight GETs and writes JSON into memory + sessionStorage.
 * Always revalidates so listing pages don't stay stuck on a stale snapshot.
 * Use peekCachedJson() for instant first paint.
 */
export function cachedJson(url) {
    if (inflight.has(url)) return inflight.get(url)

    const pending = fetch(url, { cache: 'no-store' })
        .then(async (res) => {
            const data = await res.json()
            if (res.ok) remember(url, data)
            return data
        })
        .finally(() => inflight.delete(url))

    inflight.set(url, pending)
    return pending
}

export function prefetchCatalog() {
    if (typeof window === 'undefined') return
    const run = () => {
        cachedJson('/api/products?limit=40').catch(() => {})
        cachedJson('/api/services').catch(() => {})
        cachedJson('/api/properties').catch(() => {})
        cachedJson('/api/categories').catch(() => {})
        cachedJson('/api/products/niches').catch(() => {})
        cachedJson('/api/services/niches').catch(() => {})
        cachedJson('/api/properties/niches').catch(() => {})
    }
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(run, { timeout: 2500 })
    } else {
        setTimeout(run, 400)
    }
}

export function clearFetchCache(prefix) {
    if (!prefix) {
        cache.clear()
        if (canUseSession()) {
            const keys = []
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i)
                if (key && key.startsWith(SS_PREFIX)) keys.push(key)
            }
            keys.forEach((k) => sessionStorage.removeItem(k))
        }
        return
    }
    for (const key of cache.keys()) {
        if (key.startsWith(prefix)) cache.delete(key)
    }
    if (canUseSession()) {
        sessionStorage.removeItem(SS_PREFIX + prefix)
        const keys = []
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i)
            if (key && key.startsWith(SS_PREFIX + prefix)) keys.push(key)
        }
        keys.forEach((k) => sessionStorage.removeItem(k))
    }
}
