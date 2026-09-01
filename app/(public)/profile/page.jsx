'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import {
    User, Package, ShoppingCart, Store, MapPin, LogOut,
    ChevronRight, Mail, Shield, MessageSquare, Calendar, Home, Heart,
} from 'lucide-react'
import toast from 'react-hot-toast'
import WishlistSection from '@/components/WishlistSection'
import ConfirmLogoutModal from '@/components/ConfirmLogoutModal'

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
            <div className="min-h-[70vh] bg-slate-50/60">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-pulse">
                        <div className="h-32 bg-emerald-700/40" />
                        <div className="p-6 space-y-3">
                            <div className="h-4 w-40 bg-slate-100 rounded" />
                            <div className="h-10 w-full bg-slate-100 rounded-xl" />
                            <div className="h-10 w-full bg-slate-100 rounded-xl" />
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
    const links = [
        { href: '/orders', label: 'My Orders', desc: 'Track purchases and past orders', icon: Package },
        { href: '/bookings', label: 'My Bookings', desc: 'Service bookings you requested', icon: Calendar },
        { href: '/visits', label: 'Property Visits', desc: 'Scheduled property visits', icon: Home },
        { href: '/messages', label: 'Messages', desc: 'Conversations with sellers', icon: MessageSquare },
        { href: '/cart', label: 'My Cart', desc: 'Items waiting to be checked out', icon: ShoppingCart },
        { href: '#wishlist', label: 'My Wishlist', desc: 'Saved products, services & properties', icon: Heart },
        {
            href: store?.status === 'approved' ? '/store' : store ? '/create-store' : '/become-seller',
            label: store?.status === 'approved' ? 'Vendor Panel' : store ? 'Store Application' : 'Become a Seller',
            desc: store?.status === 'approved'
                ? 'Manage your store'
                : store
                    ? `Status: ${store.status}`
                    : 'Start selling on LeafyLand',
            icon: Store,
        },
    ]

    return (
        <div className="min-h-[70vh] bg-slate-50/60">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-8 text-white">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-white/15 border border-white/25 flex items-center justify-center overflow-hidden shrink-0">
                                {display?.image ? (
                                    <Image src={display.image} alt="" width={64} height={64} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={28} className="text-white" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-xl sm:text-2xl font-bold truncate">
                                    {display?.name || 'Buyer'}
                                </h1>
                                <p className="text-emerald-100 text-sm flex items-center gap-1.5 mt-1 truncate">
                                    <Mail size={14} /> {display?.email}
                                </p>
                                <span className="inline-flex items-center gap-1 mt-2 text-[11px] font-semibold bg-white/15 px-2 py-0.5 rounded-full">
                                    <Shield size={12} /> Buyer Account
                                </span>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={saveProfile} className="p-6 border-b border-slate-100 space-y-3">
                        <h2 className="text-sm font-semibold text-slate-800">Profile details</h2>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Full name</label>
                            <input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white"
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-slate-500 mb-1.5 block">Email</label>
                            <input
                                value={display?.email || ''}
                                disabled
                                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-500"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving || loading}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </form>

                    <div className="p-4 sm:p-6 space-y-2">
                        <h2 className="text-sm font-semibold text-slate-800 px-2 mb-2">Quick links</h2>
                        {links.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-emerald-50 transition-colors group"
                            >
                                <span className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-100">
                                    <item.icon size={18} />
                                </span>
                                <span className="flex-1 min-w-0">
                                    <span className="block text-sm font-semibold text-slate-800">{item.label}</span>
                                    <span className="block text-xs text-slate-500 truncate">{item.desc}</span>
                                </span>
                                <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-600" />
                            </Link>
                        ))}

                        <button
                            type="button"
                            onClick={() => setShowLogout(true)}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-50 transition-colors text-left mt-2"
                        >
                            <span className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                <LogOut size={18} />
                            </span>
                            <span className="flex-1">
                                <span className="block text-sm font-semibold text-slate-800">Logout</span>
                                <span className="block text-xs text-slate-500">Sign out of your account</span>
                            </span>
                        </button>

                        <ConfirmLogoutModal open={showLogout} onClose={() => setShowLogout(false)} />
                    </div>
                </div>

                <div id="wishlist">
                    <WishlistSection />
                </div>

                <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
                    <MapPin size={12} /> LeafyLand buyer account
                </p>
            </div>
        </div>
    )
}
