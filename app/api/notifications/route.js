import { getNotificationInbox } from '@/lib/inbox'
import { json, requireUser, handleApiError } from '@/lib/api'

export async function GET() {
    try {
        const user = await requireUser()
        const inbox = await getNotificationInbox(user)
        return json(inbox)
    } catch (e) {
        return handleApiError(e)
    }
}
