'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { assets } from '@/assets/assets'
import {
    Mail, Lock, Eye, EyeOff, User, ShieldCheck,
    Heart, Package, Zap, ArrowLeft, Sprout, Building2, Wrench,
    BadgeCheck, Users, Check,
} from 'lucide-react'
import toast from 'react-hot-toast'
import GoogleSignInButton from '@/components/GoogleSignInButton'
import { brandRadiusClass, BRAND_GREEN } from '@/lib/brand-ui'

const BRAND = {
    green: BRAND_GREEN,
    bottomBg: '#f4f8f5',
    greenLight: '#eef4ef',
    text: '#1f2937',
    muted: '#6b7280',
}

const AUTH_ERROR_MESSAGES = {
    OAuthAccountNotLinked:
        'This email is already registered with a password. Sign in with email and password instead.',
    OAuthSignin: 'Google sign-in could not start. Check AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET on the server.',
    OAuthCallback: 'Google sign-in failed. Confirm AUTH_URL matches your domain and the Google redirect URI.',
    OAuthCreateAccount: 'Could not create your account with Google. Please try again.',
    Callback: 'Sign-in callback failed. Set AUTH_URL to your public site URL (e.g. https://yourdomain.com).',
    AccessDenied: 'Access was denied. Try another Google account.',
    Configuration: 'Auth is misconfigured on the server. Contact support.',
    Default: 'Sign-in failed. Please try again.',
    email_not_verified: 'Please verify your email before signing in. Check your inbox for the verification link.',
}

const REMEMBER_KEY = 'leafyland_remember_email'

const FEATURES = [
    { icon: Sprout, title: 'Gardening Products', text: 'Plants, planters, tools & garden essentials' },
    { icon: Building2, title: 'Properties', text: 'Farmhouses, land & green retreats' },
    { icon: Wrench, title: 'Services', text: 'Landscaping, plant care & home services' },
    { icon: BadgeCheck, title: 'Verified Vendors', text: 'Vetted sellers you can buy from with confidence' },
    { icon: Users, title: 'Experts', text: 'Agronomists, architects & garden professionals' },
]

const inputClass = `auth-input w-full pl-10 pr-4 py-2 lg:py-2.5 bg-white border border-[#e5ebe6] ${brandRadiusClass} text-sm outline-none placeholder:text-gray-400 focus:border-[#2f7d4a] focus:ring-1 focus:ring-[#2f7d4a]/20 transition`

function LeafMark() {
    return (
        <svg className="inline-block w-[18px] h-[18px] -mt-1 ml-0.5" viewBox="0 0 24 24" aria-hidden>
            <path fill="#2f7d4a" d="M6.5 14.5C6.5 8.5 12 4 18.5 3.5 17 10 12.5 14 6.5 14.5Z" />
            <path fill="#3d9a5c" d="M10 19c0-4.8 4-8.2 10-9-1.2 5.2-5 9-10 9Z" />
        </svg>
    )
}

function Field({ label, icon: Icon, children, compact }) {
    return (
        <div>
            <label className={`${compact ? 'text-xs mb-1' : 'text-[13px] mb-1.5'} font-medium block`} style={{ color: BRAND.text }}>{label}</label>
            <div className="relative">
                {Icon && (
                    <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                )}
                {children}
            </div>
        </div>
    )
}

function LoginForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const callbackUrl = searchParams.get('callbackUrl') || '/auth/continue'
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [remember, setRemember] = useState(false)
    const [agreeTerms, setAgreeTerms] = useState(false)

    useEffect(() => {
        try {
            const saved = localStorage.getItem(REMEMBER_KEY)
            if (saved) {
                setEmail(saved)
                setRemember(true)
            }
        } catch {}
    }, [])

    useEffect(() => {
        const errorCode = searchParams.get('error')
        if (!errorCode) return
        const message = AUTH_ERROR_MESSAGES[errorCode] || AUTH_ERROR_MESSAGES.Default
        setFormError(message)
        toast.error(message)
    }, [searchParams])

    const safeCallbackUrl = callbackUrl.startsWith('/') ? callbackUrl : '/auth/continue'

    const switchMode = (signUp) => {
        setIsSignUp(signUp)
        setFormError('')
        setAgreeTerms(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isSignUp && !agreeTerms) {
            const msg = 'Please agree to the Terms & Conditions'
            setFormError(msg)
            toast.error(msg)
            return
        }
        setLoading(true)
        setFormError('')
        try {
            if (isSignUp) {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password }),
                })
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not create account')

                if (data.devVerifyUrl) {
                    console.info('[dev] Verification link:', data.devVerifyUrl)
                }
                window.location.assign(`/verify-email?email=${encodeURIComponent(email)}`)
                return
            }

            const checkRes = await fetch('/api/auth/check-credentials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })
            const checkData = await checkRes.json()
            if (!checkRes.ok) {
                throw new Error(checkData.error || 'Invalid email or password')
            }
            if (checkData.status === 'email_not_verified') {
                window.location.assign(`/verify-email?email=${encodeURIComponent(email)}`)
                return
            }

            try {
                if (remember) localStorage.setItem(REMEMBER_KEY, email)
                else localStorage.removeItem(REMEMBER_KEY)
            } catch {}

            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl: safeCallbackUrl,
            })
            if (result?.error) {
                throw new Error(
                    result.error === 'CredentialsSignin'
                        ? 'Invalid email or password'
                        : 'Sign-in failed. Try again, or create the account on this site first.',
                )
            }
            router.push(safeCallbackUrl)
        } catch (err) {
            setFormError(err.message)
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    const googleBlock = (
        <>
            <div className="flex items-center gap-3 my-2 lg:my-3.5">
                <div className="flex-1 h-px bg-[#e5ebe6]" />
                <span className="text-[11px] text-gray-400">or continue with</span>
                <div className="flex-1 h-px bg-[#e5ebe6]" />
            </div>
            <GoogleSignInButton
                callbackUrl={safeCallbackUrl}
                disabled={loading}
                label="Google"
                className="border-[#e5ebe6] shadow-none h-9 lg:h-10"
            />
        </>
    )

    const formCard = (mobile) => (
        <div className={`bg-white ${mobile ? `rounded-[1.5rem] shadow-[0_12px_40px_rgba(31,41,55,0.08)] p-5` : `rounded-[1.5rem] shadow-[0_24px_60px_rgba(15,40,20,0.10)] p-6`}`}>
            <div className={`flex items-end ${mobile ? 'mb-3' : 'mb-4'}`}>
                {['Login', 'Sign Up'].map((tab) => {
                    const active = tab === 'Sign Up' ? isSignUp : !isSignUp
                    return (
                        <button
                            key={tab}
                            type="button"
                            onClick={() => switchMode(tab === 'Sign Up')}
                            className={`flex-1 ${mobile ? 'pb-2' : 'pb-2.5'} text-[15px] font-semibold relative transition-colors`}
                            style={{ color: active ? BRAND.green : '#9ca3af' }}
                        >
                            {tab}
                            {active && (
                                <span
                                    className="absolute left-1/2 -translate-x-1/2 bottom-0 h-[2.5px] w-14 rounded-full"
                                    style={{ backgroundColor: BRAND.green }}
                                />
                            )}
                        </button>
                    )
                })}
            </div>

            <h2 className={`${mobile ? 'text-lg' : 'text-xl'} leading-tight font-bold`} style={{ color: BRAND.text }}>
                {isSignUp
                    ? 'Create Your Account'
                    : mobile
                        ? 'Welcome Back!'
                        : 'Glad to see you again'}{' '}
                <LeafMark />
            </h2>
            <p className={`text-sm mt-0.5 ${mobile ? 'mb-2.5' : 'mt-1 mb-4'}`} style={{ color: BRAND.muted }}>
                {isSignUp
                    ? 'Join LeafyLand today'
                    : mobile
                        ? 'Sign in to continue'
                        : 'Enter your details to access your account'}
            </p>

            {formError && (
                <p className={`mb-3 text-sm text-red-600 bg-red-50 border border-red-100 ${brandRadiusClass} px-3 py-2`}>
                    {formError}
                </p>
            )}

            <form onSubmit={handleSubmit} className={mobile ? 'space-y-2' : 'space-y-3'}>
                {isSignUp && (
                    <Field label="Full Name" icon={User} compact={mobile}>
                        <input
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className={inputClass}
                        />
                    </Field>
                )}

                <Field label={isSignUp ? 'Email' : 'Email or Phone'} icon={Mail} compact={mobile}>
                    <input
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={inputClass}
                    />
                </Field>

                <Field label="Password" icon={Lock} compact={mobile}>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className={`${inputClass} pr-10`}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </Field>

                {!isSignUp ? (
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                        <label className="flex items-center gap-2 text-[13px] cursor-pointer" style={{ color: BRAND.muted }}>
                            <input
                                type="checkbox"
                                checked={remember}
                                onChange={(e) => setRemember(e.target.checked)}
                                className="rounded border-gray-300 accent-[#2f7d4a]"
                            />
                            Remember me
                        </label>
                        <Link href="/contact" className="text-[13px] font-semibold" style={{ color: BRAND.green }}>
                            Forgot Password?
                        </Link>
                    </div>
                ) : (
                    <label className="flex items-start gap-2 text-xs cursor-pointer" style={{ color: BRAND.muted }}>
                        <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="mt-0.5 rounded border-gray-300 accent-[#2f7d4a]"
                        />
                        <span>
                            I agree to the{' '}
                            <Link href="/terms" className="font-semibold hover:underline" style={{ color: BRAND.green }}>
                                Terms & Conditions
                            </Link>
                        </span>
                    </label>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full ${mobile ? 'py-2' : 'py-2.5'} text-white text-sm font-semibold ${brandRadiusClass} transition-opacity hover:opacity-90 disabled:opacity-60`}
                    style={{ backgroundColor: BRAND.green }}
                >
                    {loading ? 'Please wait…' : isSignUp ? 'Create Account' : (
                        <>
                            <span className="lg:hidden">Login</span>
                            <span className="hidden lg:inline">Login to LeafyLand</span>
                        </>
                    )}
                </button>
            </form>

            {googleBlock}

            {!mobile && (
                <p className="mt-3.5 flex items-center justify-center gap-1.5 text-[11px]" style={{ color: BRAND.muted }}>
                    <ShieldCheck size={13} style={{ color: BRAND.green }} />
                    Secure & Encrypted Connection
                </p>
            )}
        </div>
    )

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ backgroundColor: '#f4f8f5' }}>
            <style>{`
                .auth-input:-webkit-autofill,
                .auth-input:-webkit-autofill:hover,
                .auth-input:-webkit-autofill:focus {
                    -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
                    -webkit-text-fill-color: #1f2937 !important;
                    caret-color: #1f2937;
                    transition: background-color 9999s ease-out;
                }
            `}</style>
            {/* Mobile — header + floating illustration + raised form card */}
            <div className="lg:hidden h-full flex flex-col overflow-hidden bg-white px-4 pt-2 pb-2">
                <div className="flex items-center justify-center relative h-9 shrink-0">
                    <Link
                        href="/"
                        className="absolute left-0 p-1.5 text-gray-500"
                        aria-label="Back to home"
                    >
                        <ArrowLeft size={22} strokeWidth={1.75} />
                    </Link>
                    <Link href="/">
                        <Image src={assets.logo} alt="LeafyLand" width={150} height={38} className="h-[30px] w-auto object-contain" />
                    </Link>
                </div>

                <div className="shrink-0 flex justify-center -mt-1">
                    <Image
                        src="/auth-hero.png"
                        alt=""
                        width={640}
                        height={360}
                        className="w-[90%] h-[158px] object-contain"
                        priority
                    />
                </div>

                <div className="relative z-10 -mt-4 flex-1 min-h-0">
                    {formCard(true)}
                    <p className="text-center text-[10px] mt-3" style={{ color: BRAND.muted }}>
                        © {new Date().getFullYear()} LeafyLand. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Desktop */}
            <div className="hidden lg:flex flex-col flex-1 min-h-0 overflow-hidden">
                <div className="flex-1 relative min-h-0" style={{ backgroundColor: '#f7faf7' }}>
                    <div className="absolute top-0 left-0 w-[40%] z-10 px-10 xl:px-14 pt-8 xl:pt-10">
                        <Link href="/" className="inline-flex w-fit">
                            <Image src={assets.logo} alt="LeafyLand" width={160} height={40} className="h-9 w-auto object-contain" />
                        </Link>

                        <div className="mt-8 xl:mt-10 max-w-[320px]">
                            <h1 className="text-[2.15rem] xl:text-[2.5rem] font-bold leading-[1.12]" style={{ color: BRAND.text }}>
                                {isSignUp ? 'Join' : 'Welcome'}
                                <br />
                                <span style={{ color: BRAND.green }}>{isSignUp ? 'LeafyLand!' : 'Back!'}</span>
                            </h1>
                            <p className="mt-3 text-sm leading-relaxed" style={{ color: BRAND.muted }}>
                                {isSignUp
                                    ? 'Create an account to shop, book, hire, and sell — all in one place.'
                                    : 'Sign in to continue your journey with LeafyLand'}
                            </p>

                            <ul className="mt-6 space-y-3">
                                {FEATURES.map((item) => (
                                    <li key={item.title} className="flex items-start gap-3">
                                        <span
                                            className="flex items-center justify-center w-10 h-10 rounded-full bg-white shrink-0 shadow-sm"
                                            style={{ color: BRAND.green }}
                                        >
                                            <item.icon size={18} strokeWidth={1.75} />
                                        </span>
                                        <span>
                                            <span className="block text-sm font-semibold" style={{ color: BRAND.text }}>
                                                {item.title}
                                            </span>
                                            <span className="block text-xs mt-0.5 leading-snug" style={{ color: BRAND.muted }}>
                                                {item.text}
                                            </span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div
                        className="absolute top-6 bottom-3 left-[30%] overflow-hidden rounded-xl"
                        style={{ right: 'calc(5rem + 400px - 5.5rem)' }}
                    >
                        <Image
                            src="/auth-plants.png"
                            alt=""
                            fill
                            sizes="50vw"
                            className="object-cover object-[center_60%]"
                            priority
                        />
                        <div className="absolute inset-y-0 left-0 w-[28%] bg-gradient-to-r from-[#f7faf7] to-transparent" />
                    </div>

                    <div className="absolute inset-y-0 right-20 z-20 flex items-center">
                        <div className="w-[400px]">
                            {formCard(false)}
                        </div>
                    </div>
                </div>

                <div className="shrink-0 px-6 xl:px-8 pb-4 pt-0 relative z-30">
                    <div
                        className="rounded-2xl px-5 py-3 flex items-center gap-4"
                        style={{ backgroundColor: '#eef3ef' }}
                    >
                        <span className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white shrink-0" style={{ color: BRAND.green }}>
                            <svg viewBox="0 0 32 32" className="w-7 h-7" aria-hidden>
                                <ellipse cx="16" cy="28" rx="8" ry="2" fill="#e7efe8" />
                                <rect x="13" y="20" width="6" height="8" rx="1.5" fill="#c4ae8a" />
                                <path d="M16 21c-6-8-2-14 4-16-1 6-1 10 2 14-2 1-4 2-6 2Z" fill="#2f7d4a" />
                                <path d="M16 21c6-7 4-14-2-16 2 6 3 10 0 14 1 1 2 2 2 2Z" fill="#7dae7a" />
                            </svg>
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs" style={{ color: BRAND.muted }}>
                                {isSignUp ? 'Already have an account?' : 'New to LeafyLand?'}
                            </p>
                            <p className="text-base font-semibold leading-tight" style={{ color: BRAND.green }}>
                                {isSignUp ? 'Sign in and pick up where you left off' : 'Create an account and explore more'}
                            </p>
                            <div className="hidden md:flex items-center gap-4 mt-1 text-[11px]" style={{ color: BRAND.muted }}>
                                <span className="inline-flex items-center gap-1"><Package size={12} /> Track Orders</span>
                                <span className="inline-flex items-center gap-1"><Heart size={12} /> Save Favorites</span>
                                <span className="inline-flex items-center gap-1"><Zap size={12} /> Faster Checkout</span>
                                <span className="inline-flex items-center gap-1"><Check size={12} /> Personalized Picks</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => switchMode(!isSignUp)}
                            className={`shrink-0 px-5 py-2.5 text-sm font-semibold bg-white border border-gray-200 ${brandRadiusClass} hover:bg-white/80 transition-colors`}
                            style={{ color: BRAND.green }}
                        >
                            {isSignUp ? 'Sign In' : 'Create Account'}
                        </button>
                    </div>
                    <p className="text-center text-[11px] mt-2.5" style={{ color: BRAND.muted }}>
                        © {new Date().getFullYear()} LeafyLand. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen" style={{ backgroundColor: '#f4f8f5' }} />}>
            <LoginForm />
        </Suspense>
    )
}
