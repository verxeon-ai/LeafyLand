'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import {
    User, Package, Store, LogOut, Mail, Shield, MessageSquare, Calendar, Home,
} from 'lucide-react'
import toast from 'react-hot-toast'
import ConfirmLogoutModal from '@/components/ConfirmLogoutModal'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import {
    brandCardClass,
    brandInputClass,
    brandLabelClass,
    brandPrimaryCtaClass,
    brandDangerCtaClass,
    BRAND_GREEN,
    BRAND_GREEN_LIGHT,
    BRAND_MINT,
    BRAND_MINT_BORDER,
    BRAND_TEXT,
    BRAND_MUTED,
} from '@/lib/brand-ui'

function initialsFromName(name) {
    const parts = String(name || '').trim().split(/\s+/).filter(Boolean)
    if (!parts.length) return 'U'
    return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase()
}

export default function BuyerProfilePage() {
    const { data: session, status: sessionStatus, update } = useSession()
    const [showLogout, setShowLogout] = useState(false)
    const [profile, setProfile] = useState(null)
    const [name, setName] = useState(() => session?.user?.name || '')
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/me')
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not load profile')
                setProfile(data)
                setName(data.name || '')
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false))
    }, [])

    const display = profile || session?.user
    const waiting = loading && !display

    if (waiting || (sessionStatus === 'loading' && !display)) {
        return (
            <div className="flex-1" style={{ backgroundColor: BRAND_MINT }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                    <div className="h-7 w-36 bg-white rounded-xl mb-6 animate-pulse" />
                    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
                        <div className={`${brandCardClass} h-64 animate-pulse`} />
                        <div className="space-y-5">
                            <div className={`${brandCardClass} h-56 animate-pulse`} />
                            <div className={`${brandCardClass} h-56 animate-pulse`} />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const saveProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch('/api/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not save')
            setProfile((p) => ({ ...p, name: data.name }))
            await update?.()
            toast.success('Profile updated')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    const store = profile?.store
    const sellerHref = store?.status === 'approved' ? '/store' : store ? '/create-store' : '/become-seller'
    const sellerLabel = store?.status === 'approved' ? 'Vendor panel' : store ? 'Store application' : 'Become a seller'
    const sellerDesc = store?.status === 'approved'
        ? 'Manage listings and orders'
        : store
            ? `Status: ${store.status}`
            : 'Start selling on LeafyLand'

    const activity = [
        { href: '/orders', label: 'Orders', desc: 'Purchases and tracking', icon: Package },
        { href: '/bookings', label: 'Bookings', desc: 'Services you booked', icon: Calendar },
        { href: '/visits', label: 'Visits', desc: 'Property appointments', icon: Home },
        { href: '/messages', label: 'Messages', desc: 'Chats with sellers', icon: MessageSquare },
        { href: sellerHref, label: sellerLabel, desc: sellerDesc, icon: Store },
    ]

    return (
        <div className="flex-1" style={{ backgroundColor: BRAND_MINT }}>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
                <div className="mb-6">
                    <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Account</p>
                    <h1 className="mt-1 text-xl sm:text-2xl font-bold" style={{ color: BRAND_TEXT }}>
                        Profile settings
                    </h1>
                    <p className="mt-1 text-sm" style={{ color: BRAND_MUTED }}>
                        Update your details and open your activity.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5 items-start">
                    <aside className={`${brandCardClass} overflow-hidden lg:sticky lg:top-24`}>
                        <div className="px-5 pt-6 pb-5 text-center border-b" style={{ borderColor: BRAND_MINT_BORDER, backgroundColor: BRAND_MINT }}>
                            <div
                                className="mx-auto w-16 h-16 rounded-xl bg-white border flex items-center justify-center overflow-hidden"
                                style={{ borderColor: BRAND_MINT_BORDER }}
                            >
                                {display?.image ? (
                                    <Image src={display.image} alt="" width={64} height={64} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold" style={{ color: BRAND_GREEN }}>
                                        {initialsFromName(display?.name)}
                                    </span>
                                )}
                            </div>
                            <p className="mt-3 text-sm font-bold truncate" style={{ color: BRAND_TEXT }}>
                                {display?.name || 'Buyer'}
                            </p>
                            <p className="mt-0.5 text-xs truncate flex items-center justify-center gap-1" style={{ color: BRAND_MUTED }}>
                                <Mail size={11} /> {display?.email}
                            </p>
                            <span
                                className="mt-3 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                                style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                            >
                                <Shield size={11} /> Buyer
                            </span>
                        </div>

                        <nav className="p-3 space-y-0.5">
                            <a
                                href="#details"
                                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium"
                                style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                            >
                                <User size={16} />
                                Profile
                            </a>
                            {activity.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-[#eef4ef] transition-colors"
                                >
                                    <item.icon size={16} />
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                type="button"
                                onClick={() => setShowLogout(true)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut size={16} />
                                Sign out
                            </button>
                        </nav>
                    </aside>

                    <div className="space-y-5 min-w-0">
                        <section id="details" className={`${brandCardClass} p-5 sm:p-6`}>
                            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Personal</p>
                            <h2 className="mt-1 text-base sm:text-lg font-bold" style={{ color: BRAND_TEXT }}>
                                Profile details
                            </h2>
                            <p className="mt-1 text-sm mb-5" style={{ color: BRAND_MUTED }}>
                                This name appears on orders and messages.
                            </p>
                            <form onSubmit={saveProfile} className="space-y-3 max-w-lg">
                                <div>
                                    <label htmlFor="profile-name" className="mb-1.5 block text-xs font-medium text-slate-500">
                                        Full name
                                    </label>
                                    <input
                                        id="profile-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className={brandInputClass}
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="profile-email" className="mb-1.5 block text-xs font-medium text-slate-500">
                                        Email
                                    </label>
                                    <input
                                        id="profile-email"
                                        value={display?.email || ''}
                                        disabled
                                        className={`${brandInputClass} bg-slate-50 text-slate-500`}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving || loading}
                                    className={`${brandPrimaryCtaClass} disabled:opacity-60`}
                                    style={{ backgroundColor: BRAND_GREEN }}
                                >
                                    {saving ? 'Saving…' : 'Save changes'}
                                </button>
                            </form>
                        </section>

                        <section className={`${brandCardClass} p-5 sm:p-6`}>
                            <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Security</p>
                            <h2 className="mt-1 text-base sm:text-lg font-bold" style={{ color: BRAND_TEXT }}>
                                {profile?.hasPassword === false ? 'Set password' : 'Change password'}
                            </h2>
                            <p className="mt-1 text-sm mb-5" style={{ color: BRAND_MUTED }}>
                                Use a password that is at least 6 characters.
                            </p>
                            <div className="max-w-lg">
                                <ChangePasswordForm hasPassword={profile?.hasPassword !== false} />
                            </div>
                        </section>

                        <section>
                            <p className={`${brandLabelClass} mb-3`} style={{ color: BRAND_GREEN }}>Activity</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {activity.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`${brandCardClass} flex items-start gap-3 p-4 hover:border-[#c5d6c9] transition-colors`}
                                    >
                                        <span
                                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                                        >
                                            <item.icon size={18} />
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block text-sm font-semibold" style={{ color: BRAND_TEXT }}>
                                                {item.label}
                                            </span>
                                            <span className="block text-xs mt-0.5" style={{ color: BRAND_MUTED }}>
                                                {item.desc}
                                            </span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        <button
                            type="button"
                            onClick={() => setShowLogout(true)}
                            className={`${brandDangerCtaClass} lg:hidden`}
                        >
                            <LogOut size={15} />
                            Sign out
                        </button>
                    </div>
                </div>
            </div>
            <ConfirmLogoutModal open={showLogout} onClose={() => setShowLogout(false)} />
        </div>
    )
}
