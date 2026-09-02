'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Percent, Users, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import EmptyState from '@/components/admin/EmptyState'
import ConfirmDialog from '@/components/ConfirmDialog'
import {
    brandPrimaryCtaClass,
    brandSecondaryCtaClass,
    brandCardClass,
    brandInputClass,
    BRAND_GREEN,
} from '@/lib/brand-ui'

export default function VendorCoupons() {
    const [coupons, setCoupons] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [deleting, setDeleting] = useState(null)
    const [newCoupon, setNewCoupon] = useState({ code: '', description: '', discount: '', expiresAt: '' })

    const load = () => {
        fetch('/api/vendor/coupons')
            .then((r) => r.json())
            .then((data) => { if (Array.isArray(data)) setCoupons(data) })
    }

    useEffect(() => { load() }, [])

    const handleCreate = async (e) => {
        e.preventDefault()
        const res = await fetch('/api/vendor/coupons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...newCoupon,
                discount: Number(newCoupon.discount),
            }),
        })
        const data = await res.json()
        if (!res.ok) return toast.error(data.error || 'Could not create coupon')
        toast.success('Coupon created')
        setNewCoupon({ code: '', description: '', discount: '', expiresAt: '' })
        setShowForm(false)
        load()
    }

    const handleDelete = async () => {
        if (!deleting) return
        const res = await fetch('/api/vendor/coupons', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: deleting }),
        })
        if (!res.ok) {
            toast.error('Could not delete coupon')
            throw new Error('delete')
        }
        toast.success('Coupon deleted')
        load()
    }

    return (
        <div className="space-y-6">
            <PageHeader
                eyebrow="Vendor"
                title="Coupons"
                description={`${coupons.length} active coupons`}
                action={
                    <button type="button" onClick={() => setShowForm(!showForm)} className={brandPrimaryCtaClass} style={{ backgroundColor: BRAND_GREEN }}>
                        <Plus size={16} /> {showForm ? 'Cancel' : 'Create Coupon'}
                    </button>
                }
            />

            {showForm && (
                <form onSubmit={handleCreate} className={`${brandCardClass} p-6`}>
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">New Coupon</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Code</label>
                            <input type="text" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} placeholder="e.g. MONSOON20" required className={brandInputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Discount %</label>
                            <input type="number" value={newCoupon.discount} onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })} placeholder="e.g. 20" min={1} max={100} required className={brandInputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Expires</label>
                            <input type="date" value={newCoupon.expiresAt} onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })} className={brandInputClass} />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
                            <input type="text" value={newCoupon.description} onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })} placeholder="e.g. Monsoon season special" required className={brandInputClass} />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button type="submit" className={brandPrimaryCtaClass} style={{ backgroundColor: BRAND_GREEN }}>Create</button>
                        <button type="button" onClick={() => setShowForm(false)} className={brandSecondaryCtaClass}>Cancel</button>
                    </div>
                </form>
            )}

            {coupons.length === 0 && !showForm ? (
                <EmptyState icon={Percent} title="No coupons yet" description="Create one to offer a discount on your store" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map(coupon => (
                        <div key={coupon.code} className={`${brandCardClass} p-5`}>
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <span className="font-mono font-bold text-lg text-slate-800">{coupon.code}</span>
                                    <div className="flex items-center gap-1 mt-1">
                                        <Percent size={12} className="text-[#2f7d4a]" />
                                        <span className="text-sm font-bold text-[#2f7d4a]">{coupon.discount}% OFF</span>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setDeleting(coupon.code)} className="rounded-xl p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">{coupon.description}</p>
                            <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100">
                                <span className="flex items-center gap-1"><Users size={12} /> {coupon.usageCount || 0} used</span>
                                <span className="flex items-center gap-1"><Calendar size={12} /> Expires {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : '—'}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleting}
                onClose={() => setDeleting(null)}
                danger
                eyebrow="Sales"
                title="Delete this coupon?"
                description={deleting ? `Code ${deleting} will stop working immediately.` : ''}
                confirmLabel="Delete"
                onConfirm={handleDelete}
            />
        </div>
    )
}
