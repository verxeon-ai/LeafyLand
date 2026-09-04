import 'server-only'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import { resolveAuthUrl } from '@/lib/auth-url'

const TOKEN_EXPIRY_HOURS = 1
const IDENTIFIER_PREFIX = 'pwd-reset:'

function resetIdentifier(email) {
    return `${IDENTIFIER_PREFIX}${email.toLowerCase().trim()}`
}

export function buildResetUrl(token) {
    const baseUrl = resolveAuthUrl() || process.env.AUTH_URL || 'http://localhost:3000'
    return `${baseUrl.replace(/\/+$/, '')}/reset-password?token=${token}`
}

export async function createPasswordResetToken(email) {
    const normalized = email.toLowerCase().trim()
    const identifier = resetIdentifier(normalized)
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await prisma.verificationToken.deleteMany({ where: { identifier } })
    await prisma.verificationToken.create({
        data: { identifier, token, expires },
    })

    return token
}

export async function sendPasswordResetEmail(email, name) {
    const normalized = email.toLowerCase().trim()
    const token = await createPasswordResetToken(normalized)
    const resetUrl = buildResetUrl(token)
    const displayName = name?.trim() || normalized.split('@')[0]

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #334155;">
            <h2 style="color: #2f7d4a;">Reset your LeafyLand password</h2>
            <p>Hi ${displayName},</p>
            <p>We received a request to reset the password for this account. Click the button below to choose a new password.</p>
            <p style="margin: 28px 0;">
                <a href="${resetUrl}" style="background: #2f7d4a; color: #fff; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 600;">
                    Update password
                </a>
            </p>
            <p style="font-size: 13px; color: #64748b;">This link expires in ${TOKEN_EXPIRY_HOURS} hour.</p>
            <p style="font-size: 13px; color: #64748b;">If you did not ask to reset your password, you can ignore this email.</p>
            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">Or copy this link: ${resetUrl}</p>
        </div>
    `

    if (!isEmailConfigured()) {
        if (process.env.NODE_ENV === 'development') {
            console.info('[dev] Email not configured. Password reset link:', resetUrl)
            return { sent: false, resetUrl }
        }
        throw new Error('Email service is not configured')
    }

    try {
        await sendEmail({
            to: normalized,
            subject: 'Reset your LeafyLand password',
            html,
            text: `Hi ${displayName}, reset your LeafyLand password: ${resetUrl}`,
        })
        return { sent: true, resetUrl: null }
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('[dev] SMTP send failed. Password reset link:', resetUrl)
            console.error(err)
            return { sent: false, resetUrl }
        }
        throw err
    }
}

export async function readPasswordResetToken(token) {
    if (!token?.trim()) {
        return { ok: false, error: 'Invalid reset link' }
    }

    const record = await prisma.verificationToken.findFirst({
        where: { token: token.trim() },
    })

    if (!record?.identifier?.startsWith(IDENTIFIER_PREFIX)) {
        return { ok: false, error: 'Invalid or expired reset link' }
    }

    if (record.expires < new Date()) {
        await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } })
        return { ok: false, error: 'This reset link has expired. Request a new one.' }
    }

    const email = record.identifier.slice(IDENTIFIER_PREFIX.length)
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
        return { ok: false, error: 'Account not found' }
    }

    return { ok: true, email: user.email, name: user.name, identifier: record.identifier }
}

export async function resetPasswordWithToken(token, newPassword) {
    if (!newPassword || newPassword.length < 6) {
        return { ok: false, error: 'Password must be at least 6 characters' }
    }

    const check = await readPasswordResetToken(token)
    if (!check.ok) return check

    await prisma.user.update({
        where: { email: check.email },
        data: {
            passwordHash: await bcrypt.hash(newPassword, 12),
            emailVerified: new Date(),
        },
    })
    await prisma.verificationToken.deleteMany({ where: { identifier: check.identifier } })

    return { ok: true, email: check.email }
}
