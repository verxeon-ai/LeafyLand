'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
    brandCardClass,
    brandInputClass,
    brandPrimaryCtaClass,
    brandSecondaryCtaClass,
    BRAND_GREEN,
} from '@/lib/brand-ui'

export default function BuyerMessagesPage() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)
    const [composeOpen, setComposeOpen] = useState(false)
    const [stores, setStores] = useState([])
    const [storeId, setStoreId] = useState('')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)

    const loadMessages = () =>
        fetch('/api/messages')
            .then(async (r) => {
                const data = await r.json()
                if (!r.ok) throw new Error(data.error || 'Failed to load')
                setMessages(Array.isArray(data) ? data : [])
            })

    useEffect(() => {
        loadMessages()
            .catch((e) => toast.error(e.message))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        if (!composeOpen) return
        fetch('/api/shops')
            .then(async (r) => {
                if (!r.ok) return []
                const data = await r.json()
                return Array.isArray(data) ? data : data.shops || []
            })
            .then((list) => setStores(list))
            .catch(() => setStores([]))
    }, [composeOpen])

    const sendCompose = async (e) => {
        e.preventDefault()
        if (!storeId || !body.trim()) {
            toast.error('Choose a store and write a message')
            return
        }
        setSending(true)
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, body: body.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not send')
            toast.success('Message sent')
            setBody('')
            setStoreId('')
            setComposeOpen(false)
            await loadMessages()
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSending(false)
        }
    }

    if (loading) return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
            <h1 className="text-2xl font-bold text-slate-800">My Messages</h1>
            <div className="space-y-3 animate-pulse">
                <div className="h-24 bg-slate-100 rounded-2xl" />
                <div className="h-24 bg-slate-100 rounded-2xl" />
            </div>
        </div>
    )

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-2xl font-bold text-slate-800">My Messages</h1>
                <button
                    type="button"
                    onClick={() => setComposeOpen((v) => !v)}
                    className={brandPrimaryCtaClass}
                    style={{ backgroundColor: BRAND_GREEN }}
                >
                    {composeOpen ? 'Close' : 'New message'}
                </button>
            </div>

            {composeOpen && (
                <form onSubmit={sendCompose} className={`${brandCardClass} space-y-3 p-4`}>
                    <p className="text-sm text-slate-500">
                        Message a seller directly, or use Contact Seller on a property listing.
                    </p>
                    <select
                        required
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className={brandInputClass}
                    >
                        <option value="">Select a store</option>
                        {stores.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}{s.username ? ` (@${s.username})` : ''}
                            </option>
                        ))}
                    </select>
                    {!stores.length && (
                        <p className="text-xs text-slate-400">
                            No store directory available. Open a property listing and use Contact Seller, or visit a shop page.
                        </p>
                    )}
                    <textarea
                        required
                        rows={4}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your message…"
                        className={brandInputClass}
                    />
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={sending || !stores.length}
                            className={`${brandPrimaryCtaClass} disabled:opacity-60`}
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            {sending ? 'Sending…' : 'Send'}
                        </button>
                        <button type="button" onClick={() => setComposeOpen(false)} className={brandSecondaryCtaClass}>
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {messages.length === 0 ? (
                <p className="text-sm text-slate-500">No messages yet. Contact a seller from a property listing or start a new message.</p>
            ) : (
                messages.map((m) => (
                    <div key={m.id} className="border border-slate-200 rounded-2xl p-4 bg-white space-y-2">
                        <div className="flex justify-between gap-2 text-xs text-slate-400">
                            {m.store?.username ? (
                                <Link href={`/shop/${m.store.username}`} className="font-semibold text-emerald-700 hover:underline">
                                    {m.store?.name || 'Store'}
                                </Link>
                            ) : (
                                <span className="font-semibold text-slate-700">{m.store?.name || 'Store'}</span>
                            )}
                            <span>{new Date(m.createdAt).toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-sm text-slate-700">{m.body}</p>
                        {m.reply ? (
                            <div className="bg-emerald-50 rounded-xl p-3 text-sm text-slate-700">
                                <p className="text-xs font-semibold text-emerald-700 mb-1">Seller reply</p>
                                {m.reply}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Awaiting seller reply</p>
                        )}
                    </div>
                ))
            )}
        </div>
    )
}
