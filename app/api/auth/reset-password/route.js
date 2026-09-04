import { error, json, handleApiError } from '@/lib/api'
import { readPasswordResetToken, resetPasswordWithToken } from '@/lib/password-reset'

export async function GET(req) {
    try {
        const token = new URL(req.url).searchParams.get('token')
        const result = await readPasswordResetToken(token)
        if (!result.ok) return error(result.error, 400)
        return json({ valid: true, email: result.email })
    } catch (e) {
        return handleApiError(e)
    }
}

export async function POST(req) {
    try {
        const { token, password } = await req.json()
        const result = await resetPasswordWithToken(token, password)
        if (!result.ok) return error(result.error, 400)
        return json({ message: 'Password updated. You can sign in now.', email: result.email })
    } catch (e) {
        return handleApiError(e)
    }
}
