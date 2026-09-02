'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Mail, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import ChangePasswordForm from '@/components/ChangePasswordForm'
import { AdminError } from '@/components/admin/AdminStates'
import {
    brandCardClass,
    brandInputClass,
    brandLabelClass,
    brandPrimaryCtaClass,
    BRAND_GREEN,
    BRAND_GREEN_LIGHT,
    BRAND_TEXT,
} from '@/lib/brand-ui'

export default function AdminProfilePage() {
    const { data: session, update } = useSession()
    const [profile, setProfile] = useState(null)
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const load = () => {
        setLoading(true)
        setError('')
        fetch('/api/me')
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not load profile')
                setProfile(data)
                setName(data.name || '')
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const display = profile || session?.user

    const saveName = async (e) => {
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
            setProfile(data)
            await update?.()
            toast.success('Profile updated')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading && !display) {
        return (
            <div className="space-y-6">
                <PageHeader title="Profile" description="Your admin account details" />
                <div className={`${brandCardClass} h-64 animate-pulse`} />
            </div>
        )
    }

    if (error && !display) {
        return (
            <div className="space-y-6">
                <PageHeader title="Profile" description="Your admin account details" />
                <AdminError message={error} onRetry={load} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Profile" description="View your details and change your password" />

            <div className={`${brandCardClass} p-5`}>
                <div className="flex items-center gap-4">
                    <div
                        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                    >
                        <User size={26} />
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-lg font-bold" style={{ color: BRAND_TEXT }}>
                            {display?.name || 'Admin'}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-slate-500">
                            <Mail size={14} />
                            {display?.email || '—'}
                        </p>
                        <span
                            className="mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                            style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                        >
                            <Shield size={12} />
                            Admin account
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className={`${brandCardClass} p-5`}>
                    <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Account</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-800">Profile details</h2>
                    <form onSubmit={saveName} className="mt-4 space-y-3">
                        <div>
                            <label htmlFor="admin-name" className="mb-1.5 block text-xs font-medium text-slate-500">
                                Full name
                            </label>
                            <input
                                id="admin-name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={brandInputClass}
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="admin-email" className="mb-1.5 block text-xs font-medium text-slate-500">
                                Email
                            </label>
                            <input
                                id="admin-email"
                                value={display?.email || ''}
                                disabled
                                className={`${brandInputClass} bg-slate-50 text-slate-500`}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={saving}
                            className={`${brandPrimaryCtaClass} disabled:opacity-60`}
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            {saving ? 'Saving…' : 'Save changes'}
                        </button>
                    </form>
                </div>

                <div className={`${brandCardClass} p-5`}>
                    <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Security</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-800">
                        {profile?.hasPassword === false ? 'Set password' : 'Change password'}
                    </h2>
                    <p className="mt-1 mb-4 text-sm text-slate-500">
                        Use a password that is at least 6 characters.
                    </p>
                    <ChangePasswordForm hasPassword={profile?.hasPassword !== false} />
                </div>
            </div>
        </div>
    )
}
