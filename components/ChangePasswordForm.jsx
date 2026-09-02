'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { brandInputClass, brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

function PasswordField({ id, label, value, onChange, autoComplete }) {
    const [visible, setVisible] = useState(false)
    return (
        <div>
            <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-500">
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete={autoComplete}
                    className={`${brandInputClass} pr-10`}
                    required
                />
                <button
                    type="button"
                    onClick={() => setVisible((open) => !open)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={visible ? 'Hide password' : 'Show password'}
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>
    )
}

export default function ChangePasswordForm({ hasPassword = true }) {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [saving, setSaving] = useState(false)

    const submit = async (e) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match')
            return
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        setSaving(true)
        try {
            const res = await fetch('/api/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(hasPassword ? { currentPassword } : {}),
                    newPassword,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not update password')
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            toast.success(hasPassword ? 'Password updated' : 'Password saved')
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={submit} className="space-y-3">
            {hasPassword && (
                <PasswordField
                    id="current-password"
                    label="Current password"
                    value={currentPassword}
                    onChange={setCurrentPassword}
                    autoComplete="current-password"
                />
            )}
            <PasswordField
                id="new-password"
                label={hasPassword ? 'New password' : 'Create a password'}
                value={newPassword}
                onChange={setNewPassword}
                autoComplete="new-password"
            />
            <PasswordField
                id="confirm-password"
                label="Confirm new password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                autoComplete="new-password"
            />
            <button
                type="submit"
                disabled={saving}
                className={`${brandPrimaryCtaClass} disabled:opacity-60`}
                style={{ backgroundColor: BRAND_GREEN }}
            >
                {saving ? 'Updating…' : hasPassword ? 'Update password' : 'Set password'}
            </button>
        </form>
    )
}
