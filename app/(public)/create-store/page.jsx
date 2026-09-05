'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Store, Upload, CheckCircle, Leaf, Info } from 'lucide-react'
import { fileToDataUrl } from '@/components/store/StoreLogo'

export default function CreateStore() {
    const router = useRouter()
    const [alreadySubmitted, setAlreadySubmitted] = useState(false)
    const [status, setStatus] = useState('')
    const [checking, setChecking] = useState(true)
    const [message, setMessage] = useState('')
    const [redirectIn, setRedirectIn] = useState(5)

    const [storeInfo, setStoreInfo] = useState({
        name: '',
        username: '',
        description: '',
        email: '',
        contact: '',
        address: '',
        image: '',
    })

    const onChangeHandler = (e) => {
        setStoreInfo({ ...storeInfo, [e.target.name]: e.target.value })
    }

    useEffect(() => {
        if (status !== 'approved') return
        setRedirectIn(5)
        const tick = setInterval(() => {
            setRedirectIn((n) => {
                if (n <= 1) {
                    clearInterval(tick)
                    router.push('/store')
                    return 0
                }
                return n - 1
            })
        }, 1000)
        return () => clearInterval(tick)
    }, [status, router])

    const fetchSellerStatus = async () => {
        try {
            const res = await fetch('/api/stores/apply')
            const data = await res.json()
            if (data.store) {
                setAlreadySubmitted(true)
                setStatus(data.store.status)
                setMessage(
                    data.store.status === 'approved'
                        ? 'Your store is live. You can open the vendor panel.'
                        : data.store.status === 'rejected'
                            ? 'Your application was rejected. Contact support or update details.'
                            : 'Your application is under review.'
                )
            }
        } catch {
            toast.error('Could not load store status')
        } finally {
            setChecking(false)
        }
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        try {
            let logo = ''
            if (storeInfo.image instanceof File) {
                logo = await fileToDataUrl(storeInfo.image)
            }
            const res = await fetch('/api/stores/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: storeInfo.name,
                    username: storeInfo.username,
                    description: storeInfo.description,
                    email: storeInfo.email,
                    contact: storeInfo.contact,
                    address: storeInfo.address,
                    logo,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not submit')
            toast.success('Store application submitted')
            setAlreadySubmitted(true)
            setStatus(data.status)
            setMessage('Your application is under review.')
        } catch (err) {
            toast.error(err.message)
        }
    }

    useEffect(() => {
        fetchSellerStatus()
    }, [])

    if (alreadySubmitted) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center px-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-5">
                    <CheckCircle size={32} className="text-emerald-600" />
                </div>
                <p className="sm:text-2xl lg:text-3xl font-semibold text-slate-500 text-center max-w-2xl">
                    {message}
                </p>
                {status === 'approved' && (
                    <p className="mt-5 text-slate-400 text-sm">
                        Redirecting to dashboard in{' '}
                        <span className="font-semibold">{redirectIn} second{redirectIn === 1 ? '' : 's'}</span>
                    </p>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    {status === 'approved' && (
                        <Link
                            href="/store"
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                            Open vendor panel
                        </Link>
                    )}
                    <Link
                        href="/"
                        className={`${status === 'approved' ? 'inline-flex items-center gap-2 px-6 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors' : 'inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors'}`}
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-50/50 min-h-[80vh]">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="w-14 h-14 mx-auto bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
                        <Store className="w-7 h-7 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                        Create Your <span className="text-emerald-600">Store</span>
                    </h1>
                    <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
                        Submit your store details for review. Our team will verify your
                        application and activate your store within 24–48 hours.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                    <form
                        onSubmit={(e) =>
                            toast.promise(onSubmitHandler(e), {
                                loading: 'Submitting data...',
                            })
                        }
                        className="space-y-5"
                    >
                        {/* Logo Upload */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-2 block">
                                Store Logo
                            </label>
                            <label className="flex flex-col items-center justify-center gap-2 w-full max-w-xs p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/30 transition-colors">
                                {storeInfo.image ? (
                                    <Image
                                        src={URL.createObjectURL(storeInfo.image)}
                                        alt="Store logo preview"
                                        width={80}
                                        height={80}
                                        className="w-20 h-20 rounded-xl object-cover"
                                    />
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Upload
                                                size={20}
                                                className="text-slate-400"
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500 text-center">
                                            Click to upload your store logo
                                        </span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setStoreInfo({
                                            ...storeInfo,
                                            image: e.target.files[0],
                                        })
                                    }
                                    hidden
                                />
                            </label>
                        </div>

                        {/* Store Name & Username */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                                    Store Name
                                </label>
                                <input
                                    name="name"
                                    onChange={onChangeHandler}
                                    value={storeInfo.name}
                                    type="text"
                                    required
                                    placeholder="e.g. Green Thumb Nursery"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                                    Username
                                </label>
                                <input
                                    name="username"
                                    onChange={onChangeHandler}
                                    value={storeInfo.username}
                                    type="text"
                                    required
                                    placeholder="e.g. greenthumb"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                                Store Description
                            </label>
                            <textarea
                                name="description"
                                onChange={onChangeHandler}
                                value={storeInfo.description}
                                rows={4}
                                required
                                placeholder="Tell buyers what your store offers — specialties, products, and what makes you unique..."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                            />
                        </div>

                        {/* Email & Contact */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                                    Business Email
                                </label>
                                <input
                                    name="email"
                                    onChange={onChangeHandler}
                                    value={storeInfo.email}
                                    type="email"
                                    required
                                    placeholder="store@example.com"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                                    Contact Number
                                </label>
                                <input
                                    name="contact"
                                    onChange={onChangeHandler}
                                    value={storeInfo.contact}
                                    type="tel"
                                    required
                                    placeholder="+91 98765 43210"
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        {/* Address */}
                        <div>
                            <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                                Business Address
                            </label>
                            <textarea
                                name="address"
                                onChange={onChangeHandler}
                                value={storeInfo.address}
                                rows={3}
                                required
                                placeholder="Full address including city, state, and pin code"
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500 focus:bg-white transition resize-none"
                            />
                        </div>

                        {/* Info Note */}
                        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <Info
                                size={16}
                                className="text-emerald-600 mt-0.5 shrink-0"
                            />
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Your store application will be reviewed by our team within
                                24–48 hours. You'll receive an email notification once your
                                store is approved and activated.
                            </p>
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={checking}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm rounded-xl active:scale-[0.98] transition-all shadow-sm shadow-emerald-200"
                            >
                                <Leaf size={16} />
                                Submit Store Application
                            </button>
                        </div>
                    </form>
                </div>

                {/* Help Link */}
                <p className="text-center text-xs text-slate-500 mt-6">
                    Need help setting up?{' '}
                    <Link
                        href="/contact"
                        className="text-emerald-600 font-semibold hover:underline"
                    >
                        Contact our support team
                    </Link>
                </p>
            </div>
        </div>
    )
}
