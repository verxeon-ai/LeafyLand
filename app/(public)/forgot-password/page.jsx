'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
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

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        const normalized = email.trim()
        if (!normalized) {
            toast.error('Enter your email address')
            return
        }
        setSending(true)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalized }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not send reset email')
            if (data.resetUrl) {
                window.location.assign(data.resetUrl)
                return
            }
            setSent(true)
            toast.success(data.message || 'Check your email')
        } catch (err) {
            toast.error(err.message || 'Could not send reset email')
        } finally {
            setSending(false)
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
                        Forgot password
                    </h1>
                    <p className="mt-1.5 text-sm" style={{ color: BRAND_MUTED }}>
                        Enter your email and we will send a link to update your password.
                    </p>
                </div>

                <div className={`${brandCardClass} p-5 sm:p-7`}>
                    {sent ? (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="mx-auto" size={40} style={{ color: BRAND_GREEN }} />
                            <p className="text-sm" style={{ color: BRAND_TEXT }}>
                                If an account exists for that email, we sent a reset link. Check your inbox.
                            </p>
                            <Link
                                href="/login"
                                className={`${brandPrimaryCtaClass} w-full`}
                                style={{ backgroundColor: BRAND_GREEN }}
                            >
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label htmlFor="reset-email" className="mb-1.5 block text-xs font-medium text-slate-500">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        id="reset-email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className={`${brandInputClass} pl-9`}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={sending}
                                className={`${brandPrimaryCtaClass} w-full disabled:opacity-60`}
                                style={{ backgroundColor: BRAND_GREEN }}
                            >
                                {sending ? 'Sending…' : 'Send reset link'}
                            </button>
                        </form>
                    )}
                </div>

                <p className="mt-5 text-center">
                    <Link href="/login" className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: BRAND_GREEN }}>
                        <ArrowLeft size={14} />
                        Back to sign in
                    </Link>
                </p>
            </div>
        </div>
    )
}
