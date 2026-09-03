export const LOCATION_KEY = 'leafyland_location'
export const LOCATION_EVENT = 'leafyland:location'
export const DEFAULT_CITY = 'Mumbai'

const CITY_ALIASES = {
    bengaluru: ['bengaluru', 'bangalore'],
    bangalore: ['bengaluru', 'bangalore'],
}

export function cityMatchNeedles(city) {
    const raw = String(city || '').trim().toLowerCase()
    if (!raw) return []
    const aliases = CITY_ALIASES[raw]
    return aliases ? [...aliases] : [raw]
}

export function getSavedLocation() {
    if (typeof window === 'undefined') return DEFAULT_CITY
    try {
        return localStorage.getItem(LOCATION_KEY) || DEFAULT_CITY
    } catch {
        return DEFAULT_CITY
    }
}

export function setSavedLocation(city) {
    const next = String(city || '').trim() || DEFAULT_CITY
    try {
        localStorage.setItem(LOCATION_KEY, next)
    } catch { /* private mode */ }
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(LOCATION_EVENT, { detail: next }))
    }
    return next
}

export function storeMatchesCity(store, city) {
    const needles = cityMatchNeedles(city)
    if (!needles.length) return false
    const extra = store?.settings && typeof store.settings === 'object' && !Array.isArray(store.settings)
        ? store.settings
        : {}
    const storeCity = String(extra.city || '').trim().toLowerCase()
    const address = String(store?.address || '').toLowerCase()
    return needles.some((needle) => storeCity === needle || address.includes(needle))
}
