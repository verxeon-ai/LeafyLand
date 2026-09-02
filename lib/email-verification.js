import 'server-only'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendEmail, isEmailConfigured } from '@/lib/email'
import { resolveAuthUrl } from '@/lib/auth-url'

const TOKEN_EXPIRY_HOURS = 24

export async function createVerificationToken(email) {
    const normalized = email.toLowerCase().trim()
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

    await prisma.verificationToken.deleteMany({ where: { identifier: normalized } })
    await prisma.verificationToken.create({
        data: { identifier: normalized, token, expires },
    })

    return token
}

export async function verifyEmailToken(token) {
    if (!token?.trim()) {
        return { ok: false, error: 'Invalid verification link' }
    }

    const record = await prisma.verificationToken.findFirst({
        where: { token: token.trim() },
    })

    if (!record) {
        return { ok: false, error: 'Invalid or expired verification link' }
    }

    if (record.expires < new Date()) {
        await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } })
        return { ok: false, error: 'Verification link has expired. Request a new one.' }
    }

    const user = await prisma.user.findUnique({ where: { email: record.identifier } })
    if (!user) {
        return { ok: false, error: 'Account not found' }
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
    })

    await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } })

    return { ok: true, email: user.email, name: user.name }
}

export function buildVerificationUrl(token) {
    const baseUrl = resolveAuthUrl() || process.env.AUTH_URL || 'http://localhost:3000'
    return `${baseUrl.replace(/\/+$/, '')}/verify-email?token=${token}`
}

export async function sendVerificationEmail(email, name) {
    const normalized = email.toLowerCase().trim()
    const token = await createVerificationToken(normalized)
    const verifyUrl = buildVerificationUrl(token)
    const displayName = name?.trim() || normalized.split('@')[0]

    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #334155;">
            <h2 style="color: #047857;">Verify your LeafyLand email</h2>
            <p>Hi ${displayName},</p>
            <p>Thanks for signing up. Click the button below to confirm this email address belongs to you.</p>
            <p style="margin: 28px 0;">
                <a href="${verifyUrl}" style="background: #047857; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    Verify email address
                </a>
            </p>
            <p style="font-size: 13px; color: #64748b;">This link expires in ${TOKEN_EXPIRY_HOURS} hours.</p>
            <p style="font-size: 13px; color: #64748b;">If you did not create an account, you can ignore this email.</p>
            <p style="font-size: 12px; color: #94a3b8; word-break: break-all;">Or copy this link: ${verifyUrl}</p>
        </div>
    `

    if (!isEmailConfigured()) {
        if (process.env.NODE_ENV === 'development') {
            console.info('[dev] Email not configured. Verification link:', verifyUrl)
            return { sent: false, verifyUrl }
        }
        throw new Error('Email service is not configured')
    }

    try {
        await sendEmail({
            to: normalized,
            subject: 'Verify your LeafyLand email',
            html,
            text: `Hi ${displayName}, verify your LeafyLand email: ${verifyUrl}`,
        })
        return { sent: true, verifyUrl: null }
    } catch (err) {
        if (process.env.NODE_ENV === 'development') {
            console.error('[dev] SMTP send failed. Verification link:', verifyUrl)
            console.error(err)
            return { sent: false, verifyUrl }
        }
        throw err
    }
}
