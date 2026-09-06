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

const inputClass = `auth-input w-full pl-10 pr-4 bg-white border border-[#e5ebe6] ${brandRadiusClass} outline-none placeholder:text-gray-400 focus:border-[#2f7d4a] focus:ring-1 focus:ring-[#2f7d4a]/20 transition`

/**
 * Vertical rhythm is driven by CSS variables instead of fixed Tailwind
 * spacing so the card compacts on short viewports and relaxes on tall ones.
 * Values at the top of each clamp match the previous static mobile design;
 * the lg block restores the exact desktop spacing.
 */
const AUTH_CSS = `
.auth-page {
    --auth-shell-pad: 0.5rem;
    --auth-shell-x: clamp(0.75rem, 4vw, 1.25rem);
    --auth-card-pad: 1.25rem;
    --auth-tabs-mb: 0.75rem;
    --auth-lede-mb: 0.625rem;
    --auth-field-gap: 0.5rem;
    --auth-input-py: 0.5rem;
    --auth-divider-my: 0.5rem;
    --auth-google-h: 2.25rem;
    --auth-hero-max: 15rem;
    --auth-logo-row-h: 2.25rem;
    --auth-logo-h: 1.875rem;
    --auth-card-overlap: -1rem;

    /* min-height rather than height: the shell fills exactly one screen, but
       can still grow when sign-up, a large system font, or an open keyboard
       needs more room. Growing lets the page scroll instead of clipping. */
    min-height: 100vh;
    min-height: 100dvh;

    /* Grows into a tall window but never shrinks below its content: a zero
       shrink factor keeps the shell from compressing under its own form, so
       overflow always goes downward, where the page can scroll. */
    flex: 1 0 auto;
}

@supports (height: 1svh) {
    .auth-page {
        --auth-shell-pad: clamp(0.375rem, 1.1svh, 0.75rem);
        --auth-card-pad: clamp(0.9rem, 2.7svh, 1.25rem);
        --auth-tabs-mb: clamp(0.5rem, 1.7svh, 0.75rem);
        --auth-lede-mb: clamp(0.4rem, 1.5svh, 0.625rem);
        --auth-field-gap: clamp(0.375rem, 1.15svh, 0.5rem);
        --auth-input-py: clamp(0.4375rem, 1.2svh, 0.5rem);
        --auth-divider-my: clamp(0.35rem, 1.1svh, 0.5rem);
        --auth-google-h: clamp(2.1rem, 4.6svh, 2.25rem);
        --auth-hero-max: min(20rem, 40svh);
        --auth-logo-row-h: clamp(2rem, 6svh, 2.25rem);
        --auth-logo-h: clamp(1.5rem, 5svh, 1.875rem);
    }
}

@media (min-width: 1024px) {
    .auth-page {
        --auth-card-pad: 1.5rem;
        --auth-tabs-mb: 1rem;
        --auth-lede-mb: 1rem;
        --auth-field-gap: 0.75rem;
        --auth-input-py: 0.625rem;
        --auth-divider-my: 0.875rem;
        --auth-google-h: 2.5rem;

        --auth-stage-py: 2rem;
        --auth-stage-px: 2.5rem;
        --auth-card-col-w: 25rem;
        --auth-bottom-py: 0.75rem;
        --auth-bottom-pb: 1rem;
    }
}

/* Desktop spacing is height-aware for the same reason mobile is: a 1366x768
   laptop leaves roughly 640px of viewport, and the fixed values above add up
   to more than that once sign-up adds a field. Every clamp maximum is the
   original desktop number, so a comfortably tall window is unchanged. */
@supports (height: 1svh) {
    @media (min-width: 1024px) {
        .auth-page {
            --auth-card-pad: clamp(1rem, 2.7svh, 1.5rem);
            --auth-tabs-mb: clamp(0.5rem, 2.2svh, 1rem);
            --auth-lede-mb: clamp(0.5rem, 2.2svh, 1rem);
            --auth-field-gap: clamp(0.4rem, 1.65svh, 0.75rem);
            --auth-input-py: clamp(0.45rem, 1.4svh, 0.625rem);
            --auth-divider-my: clamp(0.4rem, 1.9svh, 0.875rem);
            --auth-google-h: clamp(2.1rem, 5.5svh, 2.5rem);

            --auth-stage-py: clamp(1rem, 3.2svh, 2rem);
            --auth-bottom-py: clamp(0.5rem, 1.6svh, 0.75rem);
            --auth-bottom-pb: clamp(0.5rem, 1.7svh, 1rem);
        }
    }
}

/* Very short viewports (small phones in portrait, any phone in landscape) get
   a tighter tier than the clamp minimums so the taller sign-up form still
   fits. Input font-size is deliberately untouched — it must stay 16px. */
@media (max-height: 500px) and (max-width: 1023px) {
    .auth-page {
        --auth-shell-pad: 0.3125rem;
        --auth-card-pad: 0.75rem;
        --auth-tabs-mb: 0.4375rem;
        --auth-lede-mb: 0.3125rem;
        --auth-field-gap: 0.3125rem;
        --auth-input-py: 0.375rem;
        --auth-divider-my: 0.3125rem;
        --auth-google-h: 2rem;
    }
}

/* Landscape phones, around 360px of height: the card alone is taller than the
   viewport, so spend the last of the surrounding chrome before giving up and
   scrolling. No portrait phone reaches this tier — the shortest is 480px. */
@media (max-height: 430px) and (max-width: 1023px) {
    .auth-page {
        --auth-card-pad: 0.5rem;
        --auth-tabs-mb: 0.25rem;
        --auth-lede-mb: 0.1875rem;
        --auth-field-gap: 0.25rem;
        --auth-input-py: 0.3125rem;
        --auth-divider-my: 0.25rem;
        --auth-google-h: 1.75rem;
        --auth-logo-row-h: 1.625rem;
        --auth-logo-h: 1.25rem;
    }

    .auth-legal {
        display: none;
    }
}

/* Mobile shell. Safe-area insets keep notches and the home indicator clear of
   the form in both orientations. */
.auth-mobile {
    flex: 1 0 auto;
    padding-top: max(var(--auth-shell-pad), env(safe-area-inset-top, 0px));
    padding-bottom: max(var(--auth-shell-pad), env(safe-area-inset-bottom, 0px));
    padding-left: max(var(--auth-shell-x), env(safe-area-inset-left, 0px));
    padding-right: max(var(--auth-shell-x), env(safe-area-inset-right, 0px));
}

.auth-mobile-inner {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    /* Takes over once the illustration has grown as far as it may, so spare
       height is split above and below the stack instead of pooling under it. */
    justify-content: center;
    width: 100%;
    max-width: 26rem;
    margin-inline: auto;
}

.auth-topbar {
    position: relative;
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    height: var(--auth-logo-row-h);
}

.auth-logo {
    height: var(--auth-logo-h);
    width: auto;
    object-fit: contain;
}

/* The illustration is the only flexible band: it grows into leftover height up
   to --auth-hero-max and collapses toward nothing when the viewport is short,
   so the form is never the thing that gets squeezed. */
.auth-hero {
    position: relative;
    flex: 1 1 0%;
    min-height: 0;
    max-height: var(--auth-hero-max);
    overflow: hidden;
}

/* Out of flow on purpose. An in-flow image contributes a content-based minimum
   height to the column, which would push the shell past one screen and defeat
   the collapse; absolute positioning leaves the band sized purely by the space
   flexbox has left over. max-width/max-height keep it centred and contained. */
.auth-hero-img {
    position: absolute;
    inset: 0;
    margin: auto;
    width: auto;
    height: auto;
    max-width: 90%;
    max-height: 100%;
    object-fit: contain;
}

.auth-card-wrap {
    position: relative;
    z-index: 10;
    flex: 0 0 auto;
    margin-top: var(--auth-card-overlap);
}

.auth-legal {
    flex: 0 0 auto;
    margin-top: var(--auth-shell-pad);
    text-align: center;
}

/* Short viewports: drop the illustration rather than squeeze the form, and
   undo the overlap it was sitting under. Sign-up carries an extra field and a
   consent row, so it gives the illustration up sooner. */
@media (max-height: 540px) {
    .auth-page.is-signup .auth-hero {
        display: none;
    }

    .auth-page.is-signup {
        --auth-card-overlap: 0rem;
    }
}

@media (max-height: 480px) {
    .auth-hero {
        display: none;
    }

    .auth-page {
        --auth-card-overlap: 0rem;
    }
}

/* Desktop composition. The brand column and the card sit in normal flow inside
   a grid, so the stage is sized by its own content and the page can scroll when
   a window is genuinely too short. Both used to be absolutely positioned, which
   meant they added no height: the stage stayed one screen tall and clipped
   whatever did not fit, with nothing to scroll to. Only the decorative photo is
   still out of flow. */
.auth-desktop {
    flex: 1 0 auto;
}

.auth-stage {
    position: relative;
    display: flex;
    flex: 1 0 auto;
    padding-block: var(--auth-stage-py);
    background-color: #f7faf7;
}

.auth-stage-grid {
    position: relative;
    z-index: 10;
    display: grid;
    flex: 1 1 auto;
    grid-template-columns: minmax(0, 1fr) var(--auth-card-col-w);
    align-items: stretch;
    gap: 2rem;
    padding-left: var(--auth-stage-px);
    padding-right: 5rem;
}

.auth-card-col {
    display: flex;
    flex-direction: column;
    min-width: 0;
}

/* Auto margins rather than centred alignment: they clamp to zero once free
   space runs out, so a short window pushes the card down where the page can
   scroll, instead of splitting the overflow across the top edge too. */
.auth-card-col > * {
    margin-block: auto;
}

/* Pinned to the top of the stage while the card stays vertically centred —
   the arrangement the absolute positioning used to produce. */
.auth-brand {
    align-self: start;
    max-width: 20rem;
}

.auth-brand-logo {
    height: 2.25rem;
    height: clamp(1.75rem, 3.4svh, 2.25rem);
    width: auto;
    object-fit: contain;
}

.auth-brand-title {
    margin-top: 2rem;
    margin-top: clamp(1rem, 3.4svh, 2rem);
    font-size: 2.15rem;
    font-size: clamp(1.55rem, 3.9svh, 2.15rem);
    line-height: 1.12;
}

.auth-brand-lede {
    margin-top: 0.75rem;
}

.auth-features {
    display: flex;
    flex-direction: column;
    margin-top: 1.5rem;
    margin-top: clamp(0.875rem, 2.6svh, 1.5rem);
    gap: 0.75rem;
    gap: clamp(0.5rem, 1.6svh, 0.75rem);
}

.auth-feature-icon {
    width: 2.5rem;
    width: clamp(2rem, 4.3svh, 2.5rem);
    height: 2.5rem;
    height: clamp(2rem, 4.3svh, 2.5rem);
}

.auth-plants {
    position: absolute;
    top: 1.5rem;
    bottom: 0.75rem;
    /* Sits in the gap between the brand column and the card: the left edge
       clears the brand text at every width, and the right edge stops short of
       the card's left edge (card width + the grid's right padding) so the form
       never covers the photo. */
    left: max(30%, 24rem);
    right: calc(var(--auth-card-col-w) + 5rem + 1.5rem);
    overflow: hidden;
    border-radius: 0.75rem;
}

.auth-plants-fade {
    position: absolute;
    inset-block: 0;
    left: 0;
    width: 28%;
    background-image: linear-gradient(to right, #f7faf7, rgba(247, 250, 247, 0));
}

/* Just above the lg breakpoint the brand column, photo, and card cannot all
   fit side by side, and the photo would be left as a narrow sliver. It steps
   aside there and returns as soon as there is room. */
@media (max-width: 1099px) {
    .auth-plants {
        display: none;
    }
}

.auth-bottom {
    position: relative;
    z-index: 30;
    flex: 0 0 auto;
    padding-inline: 1.5rem;
    padding-bottom: var(--auth-bottom-pb);
}

.auth-bottom-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding-inline: 1.25rem;
    padding-block: var(--auth-bottom-py);
    border-radius: 1rem;
    background-color: #eef3ef;
}

@media (min-width: 1280px) {
    .auth-stage-grid {
        padding-left: 3.5rem;
    }

    .auth-brand-title {
        font-size: 2.5rem;
        font-size: clamp(1.55rem, 4.4svh, 2.5rem);
    }

    .auth-bottom {
        padding-inline: 2rem;
    }
}

/* Laptop-height windows: give up the two purely decorative rows so the brand
   column, the form, and the switch bar all still fit one screen. Both return
   on a taller window. */
@media (min-width: 1024px) and (max-height: 820px) {
    .auth-secure-note,
    .auth-bottom-perks {
        display: none;
    }
}

/* Shorter still (scaled displays, split-screen, half-height windows). The card
   itself is already at the floor of its clamps, so the last thing left to trade
   is chrome around it. Below roughly 560px the composition genuinely cannot fit
   and the page scrolls — reachable, which is the point. */
@media (min-width: 1024px) and (max-height: 680px) {
    .auth-page {
        --auth-stage-py: 0.75rem;
        --auth-bottom-pb: 0.625rem;
    }

    .auth-legal-desktop {
        display: none;
    }

    .auth-bottom-icon {
        width: 2.5rem;
        height: 2.5rem;
    }
}

.auth-input {
    /* 16px stops iOS Safari from zooming the viewport on focus. */
    font-size: 1rem;
    padding-top: var(--auth-input-py);
    padding-bottom: var(--auth-input-py);
    /* Breathing room when the browser scrolls a focused field clear of the keyboard. */
    scroll-margin-block: 1.25rem;
}

.auth-google {
    height: var(--auth-google-h);
    padding-top: 0;
    padding-bottom: 0;
}

@media (min-width: 1024px) {
    .auth-input {
        font-size: 0.875rem;
    }
}

.auth-input:-webkit-autofill,
.auth-input:-webkit-autofill:hover,
.auth-input:-webkit-autofill:focus {
    -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
    -webkit-text-fill-color: #1f2937 !important;
    caret-color: #1f2937;
    transition: background-color 9999s ease-out;
}
`

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
    const [googleEnabled, setGoogleEnabled] = useState(false)

    useEffect(() => {
        fetch('/api/auth/config')
            .then((r) => r.json())
            .then((d) => setGoogleEnabled(Boolean(d?.googleEnabled)))
            .catch(() => setGoogleEnabled(false))
    }, [])

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
                    window.location.assign(data.devVerifyUrl)
                    return
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
            <div className="flex items-center gap-3" style={{ marginBlock: 'var(--auth-divider-my)' }}>
                <div className="flex-1 h-px bg-[#e5ebe6]" />
                <span className="text-[11px] text-gray-400">or continue with</span>
                <div className="flex-1 h-px bg-[#e5ebe6]" />
            </div>
            <GoogleSignInButton
                callbackUrl={safeCallbackUrl}
                disabled={loading}
                label="Google"
                className="auth-google border-[#e5ebe6] shadow-none"
            />
        </>
    )

    const formCard = (mobile) => (
        <div
            className={`bg-white rounded-[1.5rem] ${mobile ? 'shadow-[0_12px_40px_rgba(31,41,55,0.08)]' : 'shadow-[0_24px_60px_rgba(15,40,20,0.10)]'}`}
            style={{ padding: 'var(--auth-card-pad)' }}
        >
            <div className="flex items-end" style={{ marginBottom: 'var(--auth-tabs-mb)' }}>
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
            <p
                className="auth-lede text-sm mt-0.5 lg:mt-1"
                style={{ color: BRAND.muted, marginBottom: 'var(--auth-lede-mb)' }}
            >
                {isSignUp
                    ? 'Join LeafyLand today'
                    : mobile
                        ? 'Sign in to continue'
                        : 'Enter your details to access your account'}
            </p>

            {formError && (
                <p
                    className={`text-sm text-red-600 bg-red-50 border border-red-100 ${brandRadiusClass} px-3 py-2`}
                    style={{ marginBottom: 'var(--auth-tabs-mb)' }}
                >
                    {formError}
                </p>
            )}

            <form
                onSubmit={handleSubmit}
                className="flex flex-col"
                style={{ gap: 'var(--auth-field-gap)' }}
            >
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
                        <Link href="/forgot-password" className="text-[13px] font-semibold" style={{ color: BRAND.green }}>
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
                    className={`w-full text-white text-sm font-semibold ${brandRadiusClass} transition-opacity hover:opacity-90 disabled:opacity-60`}
                    style={{ backgroundColor: BRAND.green, paddingBlock: 'var(--auth-input-py)' }}
                >
                    {loading ? 'Please wait…' : isSignUp ? 'Create Account' : (
                        <>
                            <span className="lg:hidden">Login</span>
                            <span className="hidden lg:inline">Login to LeafyLand</span>
                        </>
                    )}
                </button>
            </form>

            {googleEnabled && googleBlock}

            {!mobile && (
                <p className="auth-secure-note mt-3.5 flex items-center justify-center gap-1.5 text-[11px]" style={{ color: BRAND.muted }}>
                    <ShieldCheck size={13} style={{ color: BRAND.green }} />
                    Secure & Encrypted Connection
                </p>
            )}
        </div>
    )

    return (
        <div
            className={`auth-page flex flex-col${isSignUp ? ' is-signup' : ''}`}
            style={{ backgroundColor: '#f4f8f5' }}
        >
            <style>{AUTH_CSS}</style>
            {/* Mobile — header + floating illustration + raised form card */}
            <div className="auth-mobile lg:hidden flex flex-col bg-white">
                <div className="auth-mobile-inner">
                    <div className="auth-topbar">
                        <Link
                            href="/"
                            className="absolute left-0 p-1.5 text-gray-500"
                            aria-label="Back to home"
                        >
                            <ArrowLeft size={22} strokeWidth={1.75} />
                        </Link>
                        <Link href="/">
                            <Image src={assets.logo} alt="LeafyLand" width={150} height={38} className="auth-logo" />
                        </Link>
                    </div>

                    <div className="auth-hero">
                        <Image
                            src="/auth-hero.png"
                            alt=""
                            width={640}
                            height={360}
                            className="auth-hero-img"
                            priority
                        />
                    </div>

                    <div className="auth-card-wrap">
                        {formCard(true)}
                    </div>

                    <p className="auth-legal text-[10px]" style={{ color: BRAND.muted }}>
                        © {new Date().getFullYear()} LeafyLand. All rights reserved.
                    </p>
                </div>
            </div>

            {/* Desktop */}
            <div className="auth-desktop hidden lg:flex flex-col">
                <div className="auth-stage">
                    <div className="auth-plants">
                        <Image
                            src="/auth-plants.png"
                            alt=""
                            fill
                            sizes="50vw"
                            className="object-cover object-[center_60%]"
                            priority
                        />
                        <div className="auth-plants-fade" />
                    </div>

                    <div className="auth-stage-grid">
                        <div className="auth-brand">
                            <Link href="/" className="inline-flex w-fit">
                                <Image src={assets.logo} alt="LeafyLand" width={160} height={40} className="auth-brand-logo" />
                            </Link>

                            <h1 className="auth-brand-title font-bold" style={{ color: BRAND.text }}>
                                {isSignUp ? 'Join' : 'Welcome'}
                                <br />
                                <span style={{ color: BRAND.green }}>{isSignUp ? 'LeafyLand!' : 'Back!'}</span>
                            </h1>
                            <p className="auth-brand-lede text-sm leading-relaxed" style={{ color: BRAND.muted }}>
                                {isSignUp
                                    ? 'Create an account to shop, book, hire, and sell — all in one place.'
                                    : 'Sign in to continue your journey with LeafyLand'}
                            </p>

                            <ul className="auth-features">
                                {FEATURES.map((item) => (
                                    <li key={item.title} className="flex items-start gap-3">
                                        <span
                                            className="auth-feature-icon flex items-center justify-center rounded-full bg-white shrink-0 shadow-sm"
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

                        <div className="auth-card-col">
                            {formCard(false)}
                        </div>
                    </div>
                </div>

                <div className="auth-bottom">
                    <div className="auth-bottom-card">
                        <span className="auth-bottom-icon flex items-center justify-center w-12 h-12 rounded-full bg-white shrink-0" style={{ color: BRAND.green }}>
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
                            <div className="auth-bottom-perks flex items-center gap-4 mt-1 text-[11px]" style={{ color: BRAND.muted }}>
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
                    <p className="auth-legal-desktop text-center text-[11px] mt-2.5" style={{ color: BRAND.muted }}>
                        © {new Date().getFullYear()} LeafyLand. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex-1" style={{ backgroundColor: '#f4f8f5' }} />}>
            <LoginForm />
        </Suspense>
    )
}
