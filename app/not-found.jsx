import Link from 'next/link'
import { BRAND_GREEN } from '@/lib/brand-ui'

export default function NotFound() {
    return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: BRAND_GREEN }}>
                404
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">Page not found</h1>
            <p className="mt-2 max-w-md text-sm text-slate-500">
                The page you are looking for does not exist or may have moved.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Link
                    href="/"
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: BRAND_GREEN }}
                >
                    Go home
                </Link>
                <Link
                    href="/products"
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                    Browse products
                </Link>
            </div>
        </div>
    )
}
