import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { error, json, handleApiError } from '@/lib/api'
import { sendVerificationEmail } from '@/lib/email-verification'
import { isEmailConfigured } from '@/lib/email'

function sentResponse(verification) {
    return json({
        message: 'Verification email sent. Check your inbox.',
        ...(process.env.NODE_ENV === 'development' && verification.verifyUrl
            ? { verifyUrl: verification.verifyUrl }
            : {}),
    })
}

export async function POST(req) {
    try {
        const { email } = await req.json()
        const normalized = email?.toLowerCase()?.trim()
        if (!normalized) return error('Email is required')

        const user = await prisma.user.findUnique({ where: { email: normalized } })
        if (!user) {
            return json({ message: 'If an account exists, a verification email has been sent.' })
        }

        if (user.emailVerified) {
            return json({ message: 'Email is already verified. You can sign in.' })
        }

        if (!user.passwordHash) {
            return error('This account uses Google sign-in. Sign in with Google instead.', 400)
        }

        if (!isEmailConfigured() && process.env.NODE_ENV !== 'development') {
            return error('Email service is not configured. Contact support.', 503)
        }

        return sentResponse(await sendVerificationEmail(user.email, user.name))
    } catch (e) {
        console.error('Resend verification failed', e)
        return handleApiError(e)
    }
}

export async function PUT(req) {
    try {
        const { email, password } = await req.json()
        const normalized = email?.toLowerCase()?.trim()
        if (!normalized || !password) {
            return error('Email and password are required')
        }

        const user = await prisma.user.findUnique({ where: { email: normalized } })
        if (!user?.passwordHash) {
            return error('Invalid email or password', 401)
        }

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return error('Invalid email or password', 401)

        if (user.emailVerified) {
            return json({ message: 'Email is already verified. You can sign in.' })
        }

        if (!isEmailConfigured() && process.env.NODE_ENV !== 'development') {
            return error('Email service is not configured. Contact support.', 503)
        }

        return sentResponse(await sendVerificationEmail(user.email, user.name))
    } catch (e) {
        console.error('Resend verification failed', e)
        return handleApiError(e)
    }
}
