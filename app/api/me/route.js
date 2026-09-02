import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { json, error, requireUser, handleApiError } from '@/lib/api'

const publicUserSelect = {
    id: true,
    name: true,
    email: true,
    image: true,
    role: true,
    cart: true,
    store: true,
}

function toPublicUser(user, passwordHash) {
    return {
        ...user,
        hasPassword: Boolean(passwordHash),
    }
}

export async function GET() {
    try {
        const sessionUser = await requireUser()
        const user = await prisma.user.findUnique({
            where: { id: sessionUser.id },
            select: { ...publicUserSelect, passwordHash: true },
        })
        if (!user) return error('User not found', 404)
        const { passwordHash, ...rest } = user
        return json(toPublicUser(rest, passwordHash))
    } catch (e) {
        return handleApiError(e)
    }
}

export async function PATCH(req) {
    try {
        const sessionUser = await requireUser()
        const body = await req.json()
        const data = {}
        if (typeof body.name === 'string') data.name = body.name.trim()
        if (typeof body.image === 'string') data.image = body.image
        if (body.cart && typeof body.cart === 'object') data.cart = body.cart

        if (typeof body.newPassword === 'string' && body.newPassword.length) {
            if (body.newPassword.length < 6) {
                return error('Password must be at least 6 characters')
            }
            const existing = await prisma.user.findUnique({
                where: { id: sessionUser.id },
                select: { passwordHash: true },
            })
            if (!existing) return error('User not found', 404)
            if (existing.passwordHash) {
                const current = typeof body.currentPassword === 'string' ? body.currentPassword : ''
                if (!current) return error('Current password is required')
                const ok = await bcrypt.compare(current, existing.passwordHash)
                if (!ok) return error('Current password is incorrect', 401)
            }
            data.passwordHash = await bcrypt.hash(body.newPassword, 12)
        }

        if (!Object.keys(data).length) return error('Nothing to update')

        const user = await prisma.user.update({
            where: { id: sessionUser.id },
            data,
            select: { ...publicUserSelect, passwordHash: true },
        })
        const { passwordHash, ...rest } = user
        return json(toPublicUser(rest, passwordHash))
    } catch (e) {
        return handleApiError(e)
    }
}
