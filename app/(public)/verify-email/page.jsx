'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { assets } from '@/assets/assets'
import { Mail, CheckCircle2, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')
    const emailParam = searchParams.get('email') || ''

    const [email, setEmail] = useState(emailParam)
    const [status, setStatus] = useState(token ? 'verifying' : 'pending')
    const [message, setMessage] = useState('')
    const [resending, setResending] = useState(false)

    const verifiedRef = useRef(false)
    useEffect(() => {
        if (!token || verifiedRef.current) return
        verifiedRef.current = true

        fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
            .then(async (r) => {
                const data = await r.json()
                if (!r.ok) throw new Error(data.error || 'Verification failed')
                setStatus('success')
                setMessage('Your email has been verified. You can sign in now.')
                setEmail(data.email || emailParam)
            })
            .catch((err) => {
                setStatus('error')
                setMessage(err.message || 'Verification failed')
            })
    }, [token, emailParam])

    const handleResend = async (e) => {
        e.preventDefault()
        const normalized = email.trim()
        if (!normalized) {
            toast.error('Enter your email address')
            return
        }

        setResending(true)
        try {
            const res = await fetch('/api/auth/resend-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: normalized }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not resend email')
            if (data.verifyUrl) {
                window.location.assign(data.verifyUrl)
                return
            }
            toast.success(data.message || 'Verification email sent')
        } catch (err) {
            toast.error(err.message || 'Could not resend email')
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="min-h-[60svh] flex items-center justify-center px-4 py-8 sm:py-10 bg-slate-50/50">
            <div className="w-full max-w-md">
                <div className="text-center mb-6 sm:mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-3">
                        <Image src={assets.logo} alt="LeafyLand" width={140} height={35} className="h-9 w-auto object-contain" />
                    </Link>
                    <h1 className="text-xl font-bold text-slate-800">Verify your email</h1>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 sm:p-8 space-y-5">
                    {status === 'verifying' && (
                        <p className="text-sm text-slate-600 text-center">Verifying your email…</p>
                    )}

                    {status === 'success' && (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="mx-auto text-emerald-600" size={40} />
                            <p className="text-sm text-slate-700">{message}</p>
                            <button
                                type="button"
                                onClick={() => router.push('/login')}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-sm"
                            >
                                Go to sign in
                            </button>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center space-y-4">
                            <XCircle className="mx-auto text-red-500" size={40} />
                            <p className="text-sm text-red-600">{message}</p>
                        </div>
                    )}

                    {(status === 'pending' || status === 'error') && (
                        <>
                            <p className="text-sm text-slate-600 text-center">
                                We sent a verification link to your email. Open it to activate your account.
                            </p>

                            <form onSubmit={handleResend} className="space-y-3">
                                <label className="text-xs font-medium text-slate-600 block">Resend verification email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base sm:text-sm focus:outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={resending}
                                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium rounded-xl text-sm"
                                >
                                    {resending ? 'Sending…' : 'Resend email'}
                                </button>
                            </form>

                            <p className="text-center text-sm text-slate-500">
                                <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
                                    Back to sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-[60svh]" />}>
            <VerifyEmailContent />
        </Suspense>
    )
}
