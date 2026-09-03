function stripTrailingSlash(url) {
    return url.replace(/\/+$/, '')
}

function normalizeUrl(raw) {
    if (!raw || typeof raw !== 'string') return null
    const trimmed = raw.trim()
    if (!trimmed) return null
    try {
        const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
        const parsed = new URL(withProtocol)
        return stripTrailingSlash(parsed.origin)
    } catch {
        return null
    }
}

function isLocalhost(url) {
    return /localhost|127\.0\.0\.1/i.test(url)
}

/** Public site URL for Auth.js — set AUTH_URL on Hostinger VPS to https://yourdomain.com */
export function resolveAuthUrl() {
    const candidates = [
        process.env.AUTH_URL,
        process.env.NEXTAUTH_URL,
        process.env.NEXT_PUBLIC_APP_URL,
        process.env.PUBLIC_APP_URL,
    ]

    const isDev = process.env.NODE_ENV !== 'production'

    if (isDev) {
        for (const raw of candidates) {
            const normalized = normalizeUrl(raw)
            if (normalized && isLocalhost(normalized)) return normalized
        }
        return 'http://localhost:3000'
    }

    for (const raw of candidates) {
        const normalized = normalizeUrl(raw)
        if (normalized && !isLocalhost(normalized)) return normalized
    }

    const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL
    if (vercelHost) {
        return normalizeUrl(vercelHost.startsWith('http') ? vercelHost : `https://${vercelHost}`)
    }

    for (const raw of candidates) {
        const normalized = normalizeUrl(raw)
        if (normalized) return normalized
    }

    return undefined
}

export function applyAuthUrl() {
    const url = resolveAuthUrl()
    if (url) {
        process.env.AUTH_URL = url
        if (!process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = url
    }
    return url
}
