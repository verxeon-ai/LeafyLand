'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { useLiveData } from '@/lib/useLiveData'

export default function NotificationBell({ nav = false }) {
    const { data, refresh } = useLiveData('/api/notifications', 15000)
    const [open, setOpen] = useState(false)
    const wrapRef = useRef(null)

    useEffect(() => {
        const close = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
        }
        document.addEventListener('mousedown', close)
        return () => document.removeEventListener('mousedown', close)
    }, [])

    const items = data?.items || []
    const unread = data?.unread || 0

    const toggle = async () => {
        const next = !open
        setOpen(next)
        if (next && unread > 0) {
            await fetch('/api/notifications/read', { method: 'POST' })
            refresh()
        }
    }

    return (
        <div className="relative" ref={wrapRef}>
            <button
                onClick={toggle}
                className={nav
                    ? "relative flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1 text-slate-800 transition-colors hover:bg-[#eef4ef] sm:px-2"
                    : "relative rounded-lg p-2 text-slate-700 transition-colors hover:bg-[#eef4ef]"
                }
                aria-label="Notifications"
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
                <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    <p className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                        Notifications
                    </p>
                    {items.length === 0 ? (
                        <p className="px-4 py-6 text-sm text-slate-400 text-center">Nothing yet.</p>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                            {items.map((n) => (
                                <li key={n.id}>
                                    <Link
                                        href={n.link || '#'}
                                        onClick={() => setOpen(false)}
                                        className={`block px-4 py-3 hover:bg-slate-50 transition-colors ${!n.readAt ? 'bg-emerald-50/40' : ''}`}
                                    >
                                        <p className="text-sm font-medium text-slate-800">{n.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">{n.body}</p>
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            {new Date(n.createdAt).toLocaleString()}
                                        </p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
