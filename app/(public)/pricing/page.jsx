import Link from 'next/link'
import { BadgeCheck, Percent, Wallet, Store } from 'lucide-react'
import { BRAND_GREEN } from '@/lib/brand-ui'

export const metadata = {
    title: 'Seller Pricing — LeafyLand',
    description: 'Transparent commission and payout terms for selling on LeafyLand.',
}

const tiers = [
    {
        icon: Percent,
        title: 'Standard commission',
        value: '10%',
        detail: 'Deducted from completed product sales before vendor payout. Matches the default store commission rate.',
    },
    {
        icon: Wallet,
        title: 'Payout window',
        value: '7 days',
        detail: 'Earnings unlock seven days after payment capture, then an admin releases the payout to your bank account.',
    },
    {
        icon: BadgeCheck,
        title: 'Listing fees',
        value: '₹0',
        detail: 'No upfront fee to list products, services, or properties. You only pay commission on successful product sales.',
    },
]

export default function PricingPage() {
    return (
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
            <div className="mb-10 text-center">
                <div
                    className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ backgroundColor: '#eef4ef', color: BRAND_GREEN }}
                >
                    <Store className="h-7 w-7" />
                </div>
                <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">Seller pricing</h1>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
                    Simple, transparent fees for vendors on LeafyLand — no listing charges, commission only on paid product orders.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                {tiers.map((tier) => (
                    <div key={tier.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                        <tier.icon className="mb-3 h-5 w-5" style={{ color: BRAND_GREEN }} />
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{tier.title}</p>
                        <p className="mt-1 text-2xl font-bold text-slate-800">{tier.value}</p>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500">{tier.detail}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6 text-center sm:p-8">
                <p className="mb-5 text-sm leading-relaxed text-slate-600">
                    Custom commission rates can be agreed in writing. Full terms are in our seller policy.
                </p>
                <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                        href="/become-seller"
                        className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-colors"
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        Become a seller
                    </Link>
                    <Link
                        href="/seller-policy"
                        className="inline-flex items-center justify-center rounded-xl border border-emerald-200 px-5 py-2.5 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
                    >
                        Read seller policy
                    </Link>
                </div>
            </div>
        </div>
    )
}
