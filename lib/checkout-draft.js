const DRAFT_KEY = 'leafyland-checkout-draft'

export const emptyCheckoutDraft = {
    step: 1,
    name: '',
    email: '',
    phone: '',
    addressId: '',
    couponCodeInput: '',
    coupon: null,
}

export function loadCheckoutDraft() {
    if (typeof window === 'undefined') return null
    try {
        const raw = sessionStorage.getItem(DRAFT_KEY)
        if (!raw) return null
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object') return null
        return { ...emptyCheckoutDraft, ...parsed }
    } catch {
        return null
    }
}

export function saveCheckoutDraft(draft) {
    if (typeof window === 'undefined') return
    try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    } catch {
        /* quota / private mode */
    }
}

export function clearCheckoutDraft() {
    if (typeof window === 'undefined') return
    try {
        sessionStorage.removeItem(DRAFT_KEY)
    } catch {
        /* ignore */
    }
}
