'use client'
import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { IndianRupee, Clock3, Truck, BadgeCheck, Banknote } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import StatCard from '@/components/admin/StatCard'
import { useLiveData } from '@/lib/useLiveData'
import {
    brandCardClass,
    brandLabelClass,
    brandPrimaryCtaClass,
    brandGhostCtaClass,
    brandInputClass,
    BRAND_GREEN,
} from '@/lib/brand-ui'

function fmt(paise) {
    return `₹${(Math.round(paise || 0) / 100).toLocaleString('en-IN')}`
}

const STATUS_STYLES = {
    PROCESSING: 'bg-amber-100 text-amber-700',
    PROCESSED: 'bg-[#eef4ef] text-[#2f7d4a]',
    FAILED: 'bg-red-100 text-red-700',
}

function ReleaseModal({ group, mode, onClose, onDone }) {
    const autoCommission = group.commissionPaise
    const [commissionInput, setCommissionInput] = useState(String(Math.round(autoCommission / 100)))
    const [reference, setReference] = useState('')
    const [releasing, setReleasing] = useState(false)

    const commissionPaise = Math.max(0, Math.round(Number(commissionInput || 0) * 100))
    const netPaise = Math.max(0, group.grossPaise - commissionPaise)
    const invalid =
        !Number.isFinite(commissionPaise) ||
        commissionPaise > group.grossPaise ||
        (mode === 'MANUAL' && reference.trim().length < 3)

    const release = async () => {
        setReleasing(true)
        try {
            const res = await fetch('/api/admin/payouts/release', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeId: group.storeId,
                    commissionPaise,
                    ...(mode === 'MANUAL' ? { reference: reference.trim() } : {}),
                }),
            })
            const d = await res.json()
            if (!res.ok) throw new Error(d.error || 'Release failed')
            toast.success(`Released ${fmt(netPaise)} to ${group.storeName}`)
            onDone()
        } catch (e) {
            toast.error(e.message)
        } finally {
            setReleasing(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm" onClick={onClose}>
            <div className={`${brandCardClass} w-full max-w-md space-y-4 p-6`} onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-800">Release payout — {group.storeName}</h3>
                <div className="space-y-1.5 rounded-xl bg-[#f4f8f5] p-4 text-sm text-slate-600">
                    <div className="flex justify-between"><span>{group.count} orders</span><span>Gross {fmt(group.grossPaise)}</span></div>
                    <div className="flex justify-between"><span>Auto commission</span><span>{fmt(autoCommission)}</span></div>
                    <div className="flex justify-between font-semibold text-slate-800"><span>Net payable</span><span>{fmt(netPaise)}</span></div>
                </div>
                <label className="block text-sm">
                    <span className="text-slate-500">Commission (₹)</span>
                    <input
                        value={commissionInput}
                        onChange={(e) => setCommissionInput(e.target.value)}
                        inputMode="decimal"
                        className={`mt-1 ${brandInputClass}`}
                    />
                </label>
                {mode === 'MANUAL' ? (
                    <label className="block text-sm">
                        <span className="text-slate-500">Bank reference / UTR (manual mode)</span>
                        <input
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="e.g. HDFC UTR N123..."
                            className={`mt-1 ${brandInputClass}`}
                        />
                    </label>
                ) : (
                    <p className="text-xs text-slate-500">RazorpayX will transfer {fmt(netPaise)} to the vendor&apos;s bank account.</p>
                )}
                <div className="flex justify-end gap-2 pt-2">
                    <button type="button" onClick={onClose} className={brandGhostCtaClass}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={invalid || releasing || netPaise < 100}
                        onClick={release}
                        className={`${brandPrimaryCtaClass} disabled:cursor-not-allowed disabled:opacity-40`}
                        style={{ backgroundColor: BRAND_GREEN }}
                    >
                        {releasing ? 'Releasing…' : `Release ${fmt(netPaise)}`}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function AdminPayoutsPage() {
    const { data, loading, refresh } = useLiveData('/api/admin/payouts')
    const [activeGroup, setActiveGroup] = useState(null)

    const summary = data?.summary
    const groups = data?.dueByStore || []
    const history = data?.history || []
    const mode = data?.gatewayMode || 'MANUAL'

    const cards = useMemo(
        () => [
            { icon: IndianRupee, label: 'Due now', value: fmt(summary?.dueNowPaise) },
            { icon: Clock3, label: 'Upcoming (day 7 pipeline)', value: fmt(summary?.upcomingPaise) },
            { icon: Truck, label: 'In transit', value: fmt(summary?.processingPaise) },
            { icon: BadgeCheck, label: 'Paid lifetime', value: fmt(summary?.paidPaise) },
        ],
        [summary],
    )

    return (
        <div className="space-y-6">
            <PageHeader
                title="Vendor Payouts"
                description={`Settlements release manually after each vendor's 7-day window · Gateway mode: ${mode === 'RAZORPAYX' ? 'RazorpayX' : 'Manual (record UTR)'}`}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {cards.map((c) => (
                    <StatCard key={c.label} icon={c.icon} label={c.label} value={loading ? '…' : c.value} />
                ))}
            </div>

            <div className={`${brandCardClass} p-5`}>
                <p className={`${brandLabelClass} mb-1`} style={{ color: BRAND_GREEN }}>Settlements</p>
                <h2 className="mb-4 text-lg font-bold text-slate-800">Due for release</h2>
                {!loading && groups.length === 0 && (
                    <p className="text-sm text-slate-500">Nothing due yet. Earnings appear 7 days after their payment was captured.</p>
                )}
                {groups.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead>
                                <tr className="border-b border-[#e4eee6] text-left text-slate-500">
                                    <th className="px-2 pb-3 font-medium">Vendor</th>
                                    <th className="px-2 pb-3 font-medium">Orders</th>
                                    <th className="px-2 pb-3 font-medium">Gross</th>
                                    <th className="px-2 pb-3 font-medium">Commission</th>
                                    <th className="px-2 pb-3 font-medium">Net</th>
                                    <th className="px-2 pb-3 text-right font-medium"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {groups.map((g) => (
                                    <tr key={g.storeId} className="border-b border-slate-50 last:border-0">
                                        <td className="px-2 py-3 font-medium text-slate-800">{g.storeName}</td>
                                        <td className="px-2 py-3 text-slate-600">{g.count}</td>
                                        <td className="px-2 py-3 text-slate-600">{fmt(g.grossPaise)}</td>
                                        <td className="px-2 py-3 text-slate-600">{fmt(g.commissionPaise)}</td>
                                        <td className="px-2 py-3 font-semibold text-slate-800">{fmt(g.netPaise)}</td>
                                        <td className="px-2 py-3 text-right">
                                            {g.bankDetailsComplete ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setActiveGroup(g)}
                                                    className={brandPrimaryCtaClass}
                                                    style={{ backgroundColor: BRAND_GREEN }}
                                                >
                                                    <Banknote size={14} /> Review &amp; Release
                                                </button>
                                            ) : (
                                                <span className="rounded-xl bg-red-50 px-2 py-1 text-xs font-semibold text-red-600">
                                                    Bank details missing
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className={`${brandCardClass} p-5`}>
                <p className={`${brandLabelClass} mb-1`} style={{ color: BRAND_GREEN }}>History</p>
                <h2 className="mb-4 text-lg font-bold text-slate-800">Payout history</h2>
                {!loading && history.length === 0 && <p className="text-sm text-slate-500">No payouts released yet.</p>}
                {history.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[760px] text-sm">
                            <thead>
                                <tr className="border-b border-[#e4eee6] text-left text-slate-500">
                                    <th className="px-2 pb-3 font-medium">Vendor</th>
                                    <th className="px-2 pb-3 font-medium">Gross</th>
                                    <th className="px-2 pb-3 font-medium">Commission</th>
                                    <th className="px-2 pb-3 font-medium">Net</th>
                                    <th className="px-2 pb-3 font-medium">Method</th>
                                    <th className="px-2 pb-3 font-medium">Reference</th>
                                    <th className="px-2 pb-3 font-medium">Status</th>
                                    <th className="px-2 pb-3 font-medium">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map((p) => (
                                    <tr key={p.id} className="border-b border-slate-50 last:border-0">
                                        <td className="px-2 py-3 font-medium text-slate-800">{p.storeName}</td>
                                        <td className="px-2 py-3 text-slate-600">{fmt(p.grossPaise)}</td>
                                        <td className="px-2 py-3 text-slate-600">
                                            {fmt(p.commissionPaise)}
                                            {p.commissionOverride && <span className="ml-1 text-[10px] font-semibold text-amber-600">adj</span>}
                                        </td>
                                        <td className="px-2 py-3 font-semibold text-slate-800">{fmt(p.netPaise)}</td>
                                        <td className="px-2 py-3 text-slate-600">{p.method === 'RAZORPAYX' ? 'RazorpayX' : 'Bank Transfer'}</td>
                                        <td className="max-w-[140px] truncate px-2 py-3 font-mono text-xs text-slate-500">{p.reference || '-'}</td>
                                        <td className="px-2 py-3">
                                            <span className={`rounded-xl px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[p.status] || 'bg-slate-100 text-slate-600'}`}>
                                                {p.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-2 py-3 text-slate-500">
                                            {new Date(p.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {activeGroup && (
                <ReleaseModal
                    group={activeGroup}
                    mode={mode}
                    onClose={() => setActiveGroup(null)}
                    onDone={() => {
                        setActiveGroup(null)
                        refresh()
                    }}
                />
            )}
        </div>
    )
}
