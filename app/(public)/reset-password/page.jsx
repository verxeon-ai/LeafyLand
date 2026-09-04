'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { assets } from '@/assets/assets'
import {
    brandCardClass,
    brandInputClass,
    brandLabelClass,
    brandPrimaryCtaClass,
    BRAND_GREEN,
    BRAND_MINT,
    BRAND_MUTED,
    BRAND_TEXT,
} from '@/lib/brand-ui'

function PasswordField({ id, label, value, onChange, autoComplete }) {
    const [visible, setVisible] = useState(false)
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-500">
                {label}
            </label>
            <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    className={`${brandInputClass} pl-9 pr-10`}
                    required
                    minLength={6}
                />
                <button
                    type="button"
                    onClick={() => setVisible((open) => !open)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    )
}

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token') || ''

    const [status, setStatus] = useState(token ? 'checking' : 'missing')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        if (!token) {
            setStatus('missing')
            return
        }
        let cancelled = false
        fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Invalid reset link')
                if (!cancelled) {
                    setEmail(data.email || '')
                    setStatus('ready')
                }
            })
            .catch((err) => {
                if (!cancelled) {
                    setStatus('invalid')
                    toast.error(err.message)
                }
            })
        return () => { cancelled = true }
    }, [token])

    const submit = async (e) => {
        e.preventDefault()
        if (password !== confirm) {
            toast.error('Passwords do not match')
            return
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        setSaving(true)
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not update password')
            setStatus('done')
            toast.success(data.message || 'Password updated')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="flex-1 flex items-center justify-center px-4 py-10" style={{ backgroundColor: BRAND_MINT }}>
            <div className="w-full max-w-md">
                <div className="text-center mb-6">
                    <Link href="/" className="inline-block mb-4">
                        <Image src={assets.logo} alt="LeafyLand" width={150} height={38} className="h-9 w-auto object-contain" />
                    </Link>
                    <p className={brandLabelClass} style={{ color: BRAND_GREEN }}>Account</p>
                    <h1 className="mt-1 text-xl font-bold" style={{ color: BRAND_TEXT }}>
                        Update password
                    </h1>
                    {email && status === 'ready' && (
                        <p className="mt-1.5 text-sm" style={{ color: BRAND_MUTED }}>
                            For {email}
                        </p>
                    )}
                </div>

                <div className={`${brandCardClass} p-5 sm:p-7`}>
                    {status === 'checking' && (
                        <p className="text-sm text-center" style={{ color: BRAND_MUTED }}>Checking your reset link…</p>
                    )}

                    {status === 'missing' && (
                        <div className="text-center space-y-4">
                            <XCircle className="mx-auto text-red-500" size={40} />
                            <p className="text-sm" style={{ color: BRAND_TEXT }}>
                                This page needs a reset link from your email.
                            </p>
                            <Link
                                href="/forgot-password"
                                className={`${brandPrimaryCtaClass} w-full`}
                                style={{ backgroundColor: BRAND_GREEN }}
                            >
                                Request a new link
                            </Link>
                        </div>
                    )}

                    {status === 'invalid' && (
                        <div className="text-center space-y-4">
                            <XCircle className="mx-auto text-red-500" size={40} />
                            <p className="text-sm" style={{ color: BRAND_TEXT }}>
                                This reset link is invalid or has expired.
                            </p>
                            <Link
                                href="/forgot-password"
                                className={`${brandPrimaryCtaClass} w-full`}
                                style={{ backgroundColor: BRAND_GREEN }}
                            >
                                Request a new link
                            </Link>
                        </div>
                    )}

                    {status === 'done' && (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="mx-auto" size={40} style={{ color: BRAND_GREEN }} />
                            <p className="text-sm" style={{ color: BRAND_TEXT }}>
                                Your password has been updated. You can sign in now.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className={`${brandPrimaryCtaClass} w-full`}
                                style={{ backgroundColor: BRAND_GREEN }}
                            >
                                Go to sign in
                            </button>
                        </div>
                    )}

                    {status === 'ready' && (
                        <form onSubmit={submit} className="space-y-3">
                            <PasswordField
                                id="new-password"
                                label="New password"
                                value={password}
                                onChange={setPassword}
                                autoComplete="new-password"
                            />
                            <PasswordField
                                id="confirm-password"
                                label="Confirm new password"
                                value={confirm}
                                onChange={setConfirm}
                                autoComplete="new-password"
                            />
                            <p className="text-xs" style={{ color: BRAND_MUTED }}>
                                Use at least 6 characters.
                            </p>
                            <button
                                type="submit"
                                disabled={saving}
                                className={`${brandPrimaryCtaClass} w-full disabled:opacity-60`}
                                style={{ backgroundColor: BRAND_GREEN }}
                            >
                                {saving ? 'Updating…' : 'Update password'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="flex-1" style={{ backgroundColor: BRAND_MINT }} />}>
            <ResetPasswordContent />
        </Suspense>
    )
}
