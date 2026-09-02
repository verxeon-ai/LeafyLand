import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { applyAuthSecret } from '@/lib/auth-secret'
import { applyAuthUrl } from '@/lib/auth-url'
import { isGoogleAuthEnabled, getGoogleCredentials } from '@/lib/auth-providers'

const authSecret = applyAuthSecret()
applyAuthUrl()

const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)

async function attachStore(userId) {
    const store = await prisma.store.findUnique({
        where: { userId },
        select: { id: true, status: true, isActive: true, name: true },
    })
    return store
}

const googleEnabled = isGoogleAuthEnabled()

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...(googleEnabled ? { adapter: PrismaAdapter(prisma) } : {}),
    session: { strategy: 'jwt' },
    secret: authSecret,
    trustHost: true,
    // Allow Google login when the same email already registered with password
    allowDangerousEmailAccountLinking: true,
    pages: {
        signIn: '/login',
        error: '/login',
    },
    providers: [
        ...(googleEnabled
            ? [
                Google({
                    clientId: getGoogleCredentials().clientId,
                    clientSecret: getGoogleCredentials().clientSecret,
                }),
            ]
            : []),
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    const email = credentials?.email?.toString().toLowerCase().trim()
                    const password = credentials?.password?.toString()
                    if (!email || !password) return null

                    const user = await prisma.user.findUnique({ where: { email } })
                    if (!user?.passwordHash) return null

                    const ok = await bcrypt.compare(password, user.passwordHash)
                    if (!ok) return null

                    if (!user.emailVerified) return null

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        image: user.image,
                        role: user.role,
                    }
                } catch (err) {
                    console.error('Credentials authorize failed', err)
                    return null
                }
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google' && user?.email) {
                const email = user.email.toLowerCase()
                const data = { emailVerified: new Date() }
                if (adminEmails.includes(email)) {
                    data.role = 'ADMIN'
                }
                await prisma.user.updateMany({
                    where: { email: user.email },
                    data,
                })
            }
            return true
        },
        async jwt({ token, user }) {
            try {
                const userId = user?.id || token.sub
                if (!userId) return token

                const dbUser = await prisma.user.findUnique({
                    where: { id: userId },
                    select: { id: true, role: true, name: true, email: true, image: true },
                })
                if (!dbUser) return token

                const store = await attachStore(dbUser.id)
                token.sub = dbUser.id
                token.role = dbUser.role
                token.name = dbUser.name
                token.email = dbUser.email
                token.picture = dbUser.image
                token.storeId = store?.id || null
                token.storeStatus = store?.status || null
                token.storeActive = store?.isActive || false
                return token
            } catch (err) {
                console.error('JWT callback failed', err)
                return token
            }
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.sub
                session.user.role = token.role
                session.user.storeId = token.storeId
                session.user.storeStatus = token.storeStatus
                session.user.storeActive = token.storeActive
            }
            return session
        },
        async redirect({ url, baseUrl }) {
            try {
                if (url.startsWith('/')) return `${baseUrl}${url}`
                const next = new URL(url)
                if (next.origin === baseUrl) return url
            } catch {
                return `${baseUrl}/auth/continue`
            }
            return `${baseUrl}/auth/continue`
        },
    },
    events: {
        async createUser({ user }) {
            if (user.email) {
                const data = { emailVerified: new Date() }
                if (adminEmails.includes(user.email.toLowerCase())) {
                    data.role = 'ADMIN'
                }
                await prisma.user.update({
                    where: { id: user.id },
                    data,
                })
            }
        },
    },
})
