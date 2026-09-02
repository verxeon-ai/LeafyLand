'use client'
import Link from 'next/link'
import { AlertTriangle, Wallet, Clock3, Hourglass, BadgeCheck } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import DataTable from '@/components/admin/DataTable'
import EmptyState from '@/components/admin/EmptyState'
import { AdminStatSkeleton } from '@/components/admin/AdminStates'
import { useLiveData } from '@/lib/useLiveData'
import { brandCardClass } from '@/lib/brand-ui'

function fmt(paise) {
    return `₹${(Math.round(paise || 0) / 100).toLocaleString('en-IN')}`
}

const STATUS_STYLES = {
    DUE: 'bg-slate-100 text-slate-600',
    PROCESSING: 'bg-amber-100 text-amber-700',
    PAID: 'bg-[#eef4ef] text-[#2f7d4a]',
    PROCESSED: 'bg-[#eef4ef] text-[#2f7d4a]',
    FAILED: 'bg-red-100 text-red-700',
}

function Chip({ status }) {
    const label = status === 'PROCESSED' ? 'Completed' : status === 'PROCESSING' ? 'Processing' : status
    return (
        <span className={`rounded-xl px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
            {label}
        </span>
    )
}

export default function VendorPayouts() {
    const { data, loading } = useLiveData('/api/vendor/payouts')

    const wallet = data?.wallet
    const earnings = data?.earnings || []
    const payouts = data?.payouts || []

    const earningColumns = [
        { key: 'orderId', label: 'Order', render: (val) => <span className="font-mono text-xs text-slate-600">{String(val || '').slice(-8)}</span> },
        { key: 'createdAt', label: 'Sale date', render: (val) => new Date(val).toLocaleDateString('en-IN') },
        { key: 'grossPaise', label: 'Gross', render: (val) => fmt(val) },
        { key: 'commissionPaise', label: 'Commission', render: (val) => `-${fmt(val)}` },
        { key: 'eligibleAt', label: 'Unlocks', render: (val) => new Date(val).toLocaleDateString('en-IN') },
        { key: 'status', label: 'Status', render: (val) => <Chip status={val} /> },
    ]

    const payoutColumns = [
        { key: 'reference', label: 'Reference', render: (val, row) => <span className="font-mono text-xs text-slate-600">{val || row.id?.slice(-8)}</span> },
        { key: 'netPaise', label: 'Net paid', render: (val) => <span className="font-semibold text-slate-800">{fmt(val)}</span> },
        { key: 'method', label: 'Method', render: (val) => (val === 'RAZORPAYX' ? 'RazorpayX' : 'Bank Transfer') },
        { key: 'status', label: 'Status', render: (val) => <Chip status={val} /> },
        {
            key: 'processedAt',
            label: 'Date',
            render: (val, row) => new Date(val || row.createdAt).toLocaleDateString('en-IN'),
        },
    ]

    return (
        <div className="space-y-6">
            <PageHeader eyebrow="Vendor" title="Wallet" description="Earnings, payouts and bank details" />

            {data && !data.bankDetailsComplete && (
                <Link
                    href="/store/settings"
                    className={`${brandCardClass} flex items-start gap-3 border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100`}
                >
                    <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600" />
                    <span className="text-sm text-amber-800">
                        Your bank details are incomplete. Add your account number and IFSC in Store Settings so
                        LeafyLand can release your payouts.
                    </span>
                </Link>
            )}

            {loading && !data ? (
                <AdminStatSkeleton />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard icon={Wallet} label="Available to receive" value={fmt(wallet?.dueNowPaise)} />
                    <StatCard icon={Hourglass} label="In transit" value={fmt(wallet?.processingPaise)} />
                    <StatCard icon={Clock3} label="Upcoming (within 7 days)" value={fmt(wallet?.upcomingPaise)} />
                    <StatCard icon={BadgeCheck} label="Total received" value={fmt(wallet?.lifetimePaidPaise)} />
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#2f7d4a' }}>Earnings</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-800">Order earnings</h2>
                    {data && (
                        <p className="mt-1 text-sm text-slate-500">Commission {data.commissionRate}% · funds unlock 7 days after each sale</p>
                    )}
                </div>
                {!loading && earnings.length === 0 ? (
                    <EmptyState title="No earnings yet" description="They appear automatically when customers pay" />
                ) : (
                    <DataTable columns={earningColumns} data={earnings} searchKeys={['orderId', 'status']} emptyMessage="No earnings yet" />
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: '#2f7d4a' }}>History</p>
                    <h2 className="mt-1 text-lg font-bold text-slate-800">Payout history</h2>
                </div>
                {!loading && payouts.length === 0 ? (
                    <EmptyState title="No payouts yet" description="Completed payouts will show here" />
                ) : (
                    <DataTable columns={payoutColumns} data={payouts} searchKeys={['reference', 'method', 'status']} emptyMessage="No payouts yet" />
                )}
            </div>
        </div>
    )
}
