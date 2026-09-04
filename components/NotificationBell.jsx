'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'

const SEEN_KEY = 'll-alerts-seen'

function formatWhen(value) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const diff = Date.now() - date.getTime()
    const mins = Math.round(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hours = Math.round(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.round(hours / 24)
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

function fingerprint(item) {
    return `${item.id}:${item.title}:${item.body}`
}

function readSeen() {
    try {
        return JSON.parse(localStorage.getItem(SEEN_KEY) || '{}')
    } catch {
        return {}
    }
}

function writeSeen(items) {
    const next = { ...readSeen() }
    for (const item of items) {
        if (item.live) next[item.id] = fingerprint(item)
    }
    localStorage.setItem(SEEN_KEY, JSON.stringify(next))
    return next
}

function unreadCount(items, storedUnread, seen) {
    const liveUnread = items.filter((item) => item.live && seen[item.id] !== fingerprint(item)).length
    return storedUnread + liveUnread
}

export default function NotificationBell({ nav = false }) {
    const [items, setItems] = useState([])
    const [storedUnread, setStoredUnread] = useState(0)
    const [seen, setSeen] = useState({})
    const [loading, setLoading] = useState(true)
    const [open, setOpen] = useState(false)
    const wrapRef = useRef(null)
    const unread = unreadCount(items, storedUnread, seen)

    const refresh = useCallback(async () => {
        try {
            const res = await fetch('/api/notifications', { cache: 'no-store' })
            const data = await res.json().catch(() => null)
            if (!res.ok || !data || data.error) return
            const nextItems = Array.isArray(data.items) ? data.items : []
            setItems(nextItems)
            setStoredUnread(Number(data.unread) || 0)
            setSeen(readSeen())
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        setSeen(readSeen())
        let timer
        const loop = async () => {
            if (document.visibilityState === 'visible') await refresh()
            timer = setTimeout(loop, 15000)
        }
        loop()
        return () => clearTimeout(timer)
    }, [refresh])

    useEffect(() => {
        const close = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    const toggle = async () => {
        const next = !open
        setOpen(next)
        if (!next) return
        setSeen(writeSeen(items))
        setStoredUnread(0)
        setItems((prev) => prev.map((item) => (
            item.live || item.readAt ? item : { ...item, readAt: new Date().toISOString() }
        )))
        await fetch('/api/notifications/read', { method: 'POST' })
        refresh()
    }

    return (
        <div className="relative" ref={wrapRef}>
            <button
                type="button"
                onClick={toggle}
                className={nav
                    ? "relative flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 text-slate-800 transition-colors hover:bg-[#eef4ef] sm:px-2"
                    : "relative rounded-lg p-2 text-slate-700 transition-colors hover:bg-[#eef4ef]"
                }
                aria-label="Alerts"
            >
                <Bell size={nav ? 20 : 18} strokeWidth={1.75} />
                {nav && (
                    <span className="hidden text-[10px] font-medium text-[#6b7280] lg:block">Alerts</span>
                )}
                {unread > 0 && (
                    <span
                        className={`absolute flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ${nav ? 'right-0.5 top-0' : '-right-0.5 -top-0.5'}`}
                        style={{ backgroundColor: '#2f7d4a' }}
                    >
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 z-[80] mt-2 w-80 overflow-hidden rounded-xl border border-[#e4eee6] bg-white shadow-[0_16px_40px_rgba(31,41,55,0.12)]">
                    <p className="border-b border-[#e4eee6] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Alerts
                    </p>
                    {loading && items.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-slate-400">Loading…</p>
                    ) : items.length === 0 ? (
                        <p className="px-4 py-6 text-center text-sm text-slate-400">You&apos;re all caught up.</p>
                    ) : (
                        <ul className="max-h-80 divide-y divide-[#e4eee6] overflow-y-auto">
                            {items.map((n) => {
                                const fresh = n.live
                                    ? seen[n.id] !== fingerprint(n)
                                    : !n.readAt
                                return (
                                    <li key={n.id}>
                                        {n.link ? (
                                            <Link
                                                href={n.link}
                                                onClick={() => setOpen(false)}
                                                className={`block px-4 py-3 transition-colors hover:bg-[#f4f8f5] ${fresh ? 'bg-[#eef4ef]/70' : ''}`}
                                            >
                                                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>
                                                <p className="mt-1 text-[10px] text-slate-400">{formatWhen(n.createdAt)}</p>
                                            </Link>
                                        ) : (
                                            <div className={`block px-4 py-3 ${fresh ? 'bg-[#eef4ef]/70' : ''}`}>
                                                <p className="text-sm font-medium text-slate-800">{n.title}</p>
                                                <p className="mt-0.5 text-xs text-slate-500">{n.body}</p>
                                                <p className="mt-1 text-[10px] text-slate-400">{formatWhen(n.createdAt)}</p>
                                            </div>
                                        )}
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
