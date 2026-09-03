'use client'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { addAddress } from '@/lib/features/address/addressSlice'
import {
    brandInputClass,
    brandPrimaryCtaClass,
    BRAND_GREEN,
} from '@/lib/brand-ui'

const EMPTY = {
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    label: '',
    isDefault: false,
}

const AddressFormModal = ({ onClose, onSaved, initial = null, defaults = null }) => {
    const dispatch = useDispatch()
    const isEdit = Boolean(initial?.id)
    const [form, setForm] = useState(() => {
        if (initial) return { ...EMPTY, ...initial, isDefault: Boolean(initial.isDefault) }
        return { ...EMPTY, ...defaults, isDefault: Boolean(defaults?.isDefault) }
    })
    const [saving, setSaving] = useState(false)
    const [errors, setErrors] = useState({})

    const change = (e) => {
        const { name, type, value, checked } = e.target
        setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
        setErrors((prev) => ({ ...prev, [name]: '' }))
    }

    const validate = () => {
        const next = {}
        if (!form.name.trim()) next.name = 'Full name is required'
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Enter a valid email'
        if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 8) next.phone = 'Enter a valid phone number'
        if (!form.street.trim()) next.street = 'Street address is required'
        if (!form.city.trim()) next.city = 'City is required'
        if (!form.state.trim()) next.state = 'State / area is required'
        if (!form.zip.trim()) next.zip = 'Postal code is required'
        if (!form.country.trim()) next.country = 'Country is required'
        setErrors(next)
        return Object.keys(next).length === 0
    }

    const submit = async (e) => {
        e.preventDefault()
        if (!validate() || saving) return
        setSaving(true)
        const url = isEdit ? `/api/addresses/${initial.id}` : '/api/addresses'
        const method = isEdit ? 'PUT' : 'POST'
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        setSaving(false)
        if (!res.ok) {
            const msg = await res.json().catch(() => ({}))
            toast.error(msg.error || 'Could not save address')
            return
        }
        const saved = await res.json()
        if (!isEdit) dispatch(addAddress(saved))
        toast.success(isEdit ? 'Address updated' : 'Address saved')
        onSaved?.(saved)
        onClose?.()
    }

    const field = (name, props) => (
        <div>
            <input name={name} onChange={change} value={form[name] || ''} className={brandInputClass} {...props} />
            {errors[name] && <p className="mt-1 text-xs text-red-600">{errors[name]}</p>}
        </div>
    )

    return (
        <form
            onSubmit={submit}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-white/70 p-0 backdrop-blur sm:items-center sm:p-4"
        >
            <div className="flex max-h-[92dvh] w-full max-w-md flex-col gap-3 overflow-y-auto rounded-t-2xl border border-slate-100 bg-white p-4 shadow-xl sm:rounded-xl sm:p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">{isEdit ? 'Edit address' : 'Add address'}</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700" aria-label="Close">
                        <XIcon size={22} />
                    </button>
                </div>
                {field('label', { type: 'text', placeholder: 'Label (e.g. Home, Work)' })}
                {field('name', { type: 'text', placeholder: 'Full name', required: true, autoComplete: 'name' })}
                {field('email', { type: 'email', placeholder: 'Email address', required: true, autoComplete: 'email' })}
                {field('phone', { type: 'tel', placeholder: 'Phone', required: true, autoComplete: 'tel' })}
                {field('street', { type: 'text', placeholder: 'Street address', required: true, autoComplete: 'street-address' })}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {field('city', { type: 'text', placeholder: 'City', required: true, autoComplete: 'address-level2' })}
                    {field('state', { type: 'text', placeholder: 'State / area', required: true, autoComplete: 'address-level1' })}
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {field('zip', { type: 'text', inputMode: 'numeric', placeholder: 'Postal code', required: true, autoComplete: 'postal-code' })}
                    {field('country', { type: 'text', placeholder: 'Country', required: true, autoComplete: 'country-name' })}
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={change} className="accent-[#2f7d4a]" />
                    Set as default address
                </label>
                <button
                    type="submit"
                    disabled={saving}
                    className={`${brandPrimaryCtaClass} py-2.5 disabled:opacity-60`}
                    style={{ backgroundColor: BRAND_GREEN }}
                >
                    {saving ? 'Saving…' : isEdit ? 'Update address' : 'Save address'}
                </button>
            </div>
        </form>
    )
}

export default AddressFormModal
