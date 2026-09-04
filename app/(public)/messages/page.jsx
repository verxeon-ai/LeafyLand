'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function BuyerMessagesPage() {
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/messages')
            .then(async (r) => {
                const data = await r.json()
                if (!r.ok) throw new Error(data.error || 'Failed to load')
                setMessages(Array.isArray(data) ? data : [])
            })
            .catch((e) => toast.error(e.message))
            .finally(() => setLoading(false))
    }, [])

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
            <h1 className="text-2xl font-bold text-slate-800">My Messages</h1>
            {messages.length === 0 ? (
                <p className="text-sm text-slate-500">No messages yet. Contact a seller from a property listing.</p>
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
