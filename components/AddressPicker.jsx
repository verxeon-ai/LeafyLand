'use client'

import { useEffect, useState } from 'react'
import { Plus, Star, Trash2, Pencil } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import AddressFormModal from './AddressFormModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { BRAND_GREEN, BRAND_GREEN_LIGHT, brandSecondaryCtaClass } from '@/lib/brand-ui'

const AddressPicker = ({ value, onChange, contactDefaults, onAddressesChange }) => {
    const { status } = useSession()
    const [addresses, setAddresses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const load = () => {
        if (status !== 'authenticated') {
            setAddresses([])
            onAddressesChange?.([])
            setLoading(false)
            return
        }
        setLoading(true)
        fetch('/api/addresses')
            .then(async (r) => {
                if (r.status === 401) return []
                const data = await r.json()
                return Array.isArray(data) ? data : []
            })
            .then((list) => {
                setAddresses(list)
                onAddressesChange?.(list)
                if (!value && list.length) {
                    const def = list.find((a) => a.isDefault) || list[0]
                    onChange?.(def.id)
                }
            })
            .catch(() => {
                setAddresses([])
                onAddressesChange?.([])
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        if (status === 'loading') return
        load()
    }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

    if (status === 'unauthenticated') {
        return (
            <p className="text-sm text-slate-500">
                Please{' '}
                <a href="/login?callbackUrl=/checkout" className="font-semibold hover:underline" style={{ color: BRAND_GREEN }}>
                    sign in
                </a>{' '}
                to choose a delivery address.
            </p>
        )
    }

    if (loading || status === 'loading') return <p className="text-sm text-slate-400">Loading addresses…</p>

    const setDefault = async (id) => {
        const res = await fetch(`/api/addresses/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isDefault: true }),
        })
        if (!res.ok) return toast.error('Could not set default')
        toast.success('Default address updated')
        load()
        onChange?.(id)
    }

    const remove = async (id) => {
        const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE' })
        if (!res.ok) throw new Error('Could not delete address')
        toast.success('Address deleted')
        const next = addresses.filter((a) => a.id !== id)
        setAddresses(next)
        onAddressesChange?.(next)
        if (value === id) onChange?.(next.find((a) => a.isDefault)?.id || next[0]?.id || null)
    }

    const form = showForm && (
        <AddressFormModal
            initial={editing}
            defaults={!editing ? contactDefaults : undefined}
            onClose={() => { setShowForm(false); setEditing(null) }}
            onSaved={(saved) => {
                setShowForm(false)
                setEditing(null)
                if (saved?.id) onChange?.(saved.id)
                load()
            }}
        />
    )

    if (!addresses.length) {
        return (
            <div className="text-sm text-slate-500">
                <p>No saved addresses yet. Add one to continue.</p>
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className={`${brandSecondaryCtaClass} mt-3`}
                    style={{ color: BRAND_GREEN }}
                >
                    <Plus size={16} /> Add address
                </button>
                {form}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {addresses.map((a) => {
                const selected = value === a.id
                return (
                    <div
                        key={a.id}
                        className="flex min-w-0 cursor-pointer gap-2.5 rounded-xl border p-3 sm:gap-3 sm:p-4"
                        style={
                            selected
                                ? { borderColor: BRAND_GREEN, backgroundColor: BRAND_GREEN_LIGHT }
                                : { borderColor: '#e4eee6', backgroundColor: '#fff' }
                        }
                        onClick={() => onChange?.(a.id)}
                    >
                        <input
                            type="radio"
                            name="address"
                            checked={selected}
                            onChange={() => onChange?.(a.id)}
                            className="mt-1 shrink-0 accent-[#2f7d4a]"
                        />
                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex min-w-0 flex-wrap items-center gap-2">
                                    {a.label && (
                                        <span className="rounded-xl bg-white/80 px-2 py-0.5 text-xs font-semibold text-slate-700">
                                            {a.label}
                                        </span>
                                    )}
                                    {a.isDefault && (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: BRAND_GREEN }}>
                                            <Star size={12} className="fill-current" /> Default
                                        </span>
                                    )}
                                </div>
                                <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                    {!a.isDefault && (
                                        <button type="button" onClick={() => setDefault(a.id)} className="hidden text-xs font-medium hover:underline sm:inline" style={{ color: BRAND_GREEN }}>
                                            Set default
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => { setEditing(a); setShowForm(true) }}
                                        className="rounded-xl p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
                                        title="Edit"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteId(a.id)}
                                        className="rounded-xl p-1.5 text-slate-400 hover:bg-white hover:text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="mt-1 break-words text-sm text-slate-700">{a.name}, {a.phone}</p>
                            <p className="mt-0.5 break-words text-xs leading-relaxed text-slate-500">
                                {a.street}, {a.city}, {a.state} {a.zip}, {a.country}
                            </p>
                            {!a.isDefault && (
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setDefault(a.id) }}
                                    className="mt-2 text-xs font-medium hover:underline sm:hidden"
                                    style={{ color: BRAND_GREEN }}
                                >
                                    Set default
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
            <button
                type="button"
                onClick={() => { setEditing(null); setShowForm(true) }}
                className="inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                style={{ color: BRAND_GREEN }}
            >
                <Plus size={16} /> Add address
            </button>
            {form}
            <ConfirmDialog
                open={Boolean(deleteId)}
                onClose={() => setDeleteId(null)}
                onConfirm={() => remove(deleteId)}
                danger
                title="Delete this address?"
                description="Orders that already used it will keep a record without the live address."
                confirmLabel="Delete address"
            />
        </div>
    )
}

export default AddressPicker
