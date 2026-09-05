'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'
import { BRAND_GREEN, brandInputClass, brandPrimaryCtaClass, brandSecondaryCtaClass } from '@/lib/brand-ui'

export default function ContactSellerModal({
    storeId,
    listingId,
    listingPath = 'properties',
    onClose,
}) {
    const { data: session } = useSession()
    const router = useRouter()
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!session?.user) {
            toast.error('Please sign in')
            router.push(`/login?callbackUrl=/${listingPath}/${listingId}`)
            return
        }
        if (!storeId) {
            toast.error('Seller unavailable')
            return
        }
        setSending(true)
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, body: message.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not send')
            toast.success('Message sent to seller')
            setMessage('')
            onClose?.()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} />
            <form onSubmit={sendMessage} className="relative mx-4 w-full max-w-md space-y-4 rounded-xl bg-white p-6">
                <h3 className="text-lg font-semibold text-slate-800">Message seller</h3>
                <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask about availability, price, or visit details…"
                    className={brandInputClass}
                />
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={onClose} className={brandSecondaryCtaClass}>
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={sending}
                        className={`${brandPrimaryCtaClass} disabled:opacity-60`}
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        {sending ? 'Sending…' : 'Send'}
                    </button>
                </div>
            </form>
        </div>
    )
}
