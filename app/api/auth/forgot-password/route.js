import { prisma } from '@/lib/prisma'
import { error, json, handleApiError } from '@/lib/api'
import { isEmailConfigured } from '@/lib/email'
import { sendPasswordResetEmail } from '@/lib/password-reset'

const GENERIC = 'If an account exists for that email, we sent a reset link.'

export async function POST(req) {
    try {
        const { email } = await req.json()
        const normalized = email?.toLowerCase()?.trim()
        if (!normalized) return error('Email is required')

        const user = await prisma.user.findUnique({
            where: { email: normalized },
            select: { email: true, name: true },
        })

        if (!user) {
            return json({ message: GENERIC })
        }

        if (!isEmailConfigured() && process.env.NODE_ENV !== 'development') {
            return error('Email service is not configured. Contact support.', 503)
        }

        const result = await sendPasswordResetEmail(user.email, user.name)
        return json({
            message: GENERIC,
            ...(process.env.NODE_ENV === 'development' && result.resetUrl
                ? { resetUrl: result.resetUrl }
                : {}),
        })
    } catch (e) {
        console.error('Forgot password failed', e)
        return handleApiError(e)
    }
}
