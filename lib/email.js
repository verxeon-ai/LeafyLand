import 'server-only'
import nodemailer from 'nodemailer'

const PLACEHOLDER_MARKERS = [
    'yourdomain.com',
    'your_email_password',
    'your-email-password',
    'example.com',
    'changeme',
]

function looksLikePlaceholder(value) {
    const normalized = value.toLowerCase()
    return PLACEHOLDER_MARKERS.some((marker) => normalized.includes(marker))
}

function getSmtpConfig() {
    const host = process.env.SMTP_HOST?.trim()
    const user = process.env.SMTP_USER?.trim()
    const pass = process.env.SMTP_PASS?.trim()
    if (!host || !user || !pass) return null
    if (looksLikePlaceholder(user) || looksLikePlaceholder(pass) || looksLikePlaceholder(host)) {
        return null
    }

    const port = Number(process.env.SMTP_PORT || 465)
    const secure = process.env.SMTP_SECURE !== 'false' && port === 465

    return { host, port, secure, auth: { user, pass } }
}

export function isEmailConfigured() {
    return Boolean(getSmtpConfig())
}

function getFromAddress() {
    return process.env.EMAIL_FROM?.trim() || process.env.SMTP_USER?.trim() || 'LeafyLand <noreply@leafyland.com>'
}

let transporterPromise = null

function getTransporter() {
    const config = getSmtpConfig()
    if (!config) return null
    if (!transporterPromise) {
        transporterPromise = Promise.resolve(nodemailer.createTransport(config))
    }
    return transporterPromise
}

export async function sendEmail({ to, subject, html, text }) {
    const transport = await getTransporter()
    if (!transport) {
        throw new Error('Email is not configured. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.')
    }

    await transport.sendMail({
        from: getFromAddress(),
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
    })
}
