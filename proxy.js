import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'

const DEV_FALLBACK = 'leafyland-dev-insecure-secret-do-not-use-in-prod'

function resolveSecret() {
    const explicit = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    if (explicit) return explicit
    if (process.env.NODE_ENV === 'production') return null
    return DEV_FALLBACK
}

async function readAuthToken(req) {
    const secret = resolveSecret()
    if (!secret) return null

    const cookieNames = [
        '__Secure-authjs.session-token',
        'authjs.session-token',
        '__Secure-next-auth.session-token',
        'next-auth.session-token',
    ]
    const present = cookieNames.filter((name) => req.cookies.get(name)?.value)
    const toTry = present.length ? present : cookieNames

    for (const cookieName of toTry) {
        const token = await getToken({
            req,
            secret,
            cookieName,
            secureCookie: cookieName.startsWith('__Secure-'),
        })
        if (token) return token
    }
    return null
}

export async function proxy(req) {
    const { pathname } = req.nextUrl
    const token = await readAuthToken(req)

    const isAdmin = pathname.startsWith('/admin')
    const isStore = pathname.startsWith('/store')
    const isOrders = pathname === '/orders' || pathname.startsWith('/orders/')
    const isProfile = pathname === '/profile' || pathname.startsWith('/profile/')
    const isCreateStore = pathname.startsWith('/create-store')
    const isLogin = pathname.startsWith('/login')
    const isBuyerProtected =
        pathname.startsWith('/messages') ||
        pathname.startsWith('/bookings') ||
        pathname.startsWith('/visits')

    if (isLogin && token) {
        return NextResponse.redirect(new URL('/auth/continue', req.url))
    }

    if ((isAdmin || isStore || isOrders || isProfile || isCreateStore || isBuyerProtected) && !token) {
        const login = new URL('/login', req.url)
        login.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(login)
    }

    if (isAdmin && token?.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', req.url))
    }

    if (isStore) {
        if (!token?.storeId) {
            return NextResponse.redirect(new URL('/become-seller', req.url))
        }
        if (token.storeStatus !== 'approved' || !token.storeActive) {
            return NextResponse.redirect(new URL('/create-store', req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/store/:path*',
        '/orders/:path*',
        '/orders',
        '/profile/:path*',
        '/profile',
        '/create-store',
        '/login',
        '/messages',
        '/messages/:path*',
        '/bookings',
        '/bookings/:path*',
        '/visits',
        '/visits/:path*',
    ],
}
