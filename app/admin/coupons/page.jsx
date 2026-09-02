'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import EmptyState from '@/components/admin/EmptyState'
import { AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'
import {
  brandCardClass,
  brandLabelClass,
  brandInputClass,
  brandPrimaryCtaClass,
  brandDangerCtaClass,
  BRAND_GREEN,
} from '@/lib/brand-ui'

export default function AdminCoupons() {
  const { data: coupons, setData: setCoupons, loading } = useCachedJson('/api/admin/coupons', 'list')

  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discount: '',
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: format(new Date(), 'yyyy-MM-dd'),
  })

  const handleChange = (e) => {
    setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
  }

  const handleToggle = (field) => {
    setNewCoupon({ ...newCoupon, [field]: !newCoupon[field] })
  }

  const handleAddCoupon = async (e) => {
    e.preventDefault()

    const exists = coupons.some((c) => c.code.toUpperCase() === newCoupon.code.toUpperCase())
    if (exists) {
      toast.error('Coupon code already exists')
      return
    }

    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCoupon,
          discount: Number(newCoupon.discount),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not create coupon')
        return
      }
      toast.success('Coupon added successfully')
      setCoupons((prev) => {
        const next = [data, ...prev]
        setCachedJson('/api/admin/coupons', next)
        return next
      })
      setNewCoupon({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: false,
        expiresAt: format(new Date(), 'yyyy-MM-dd'),
      })
    } catch {
      toast.error('Could not create coupon')
    }
  }

  const handleDelete = async (code) => {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (!res.ok) {
        toast.error('Could not delete coupon')
        return
      }
      setCoupons((prev) => {
        const next = prev.filter((c) => c.code !== code)
        setCachedJson('/api/admin/coupons', next)
        return next
      })
      toast.success('Coupon deleted')
    } catch {
      toast.error('Could not delete coupon')
    }
  }

  const columns = [
    {
      key: 'code',
      label: 'Code',
      render: (val) => <span className="font-mono font-semibold text-slate-800">{val}</span>,
    },
    {
      key: 'description',
      label: 'Description',
    },
    {
      key: 'discount',
      label: 'Discount',
      render: (val) => <span className="font-medium">{val}%</span>,
    },
    {
      key: 'expiresAt',
      label: 'Expiry',
      render: (val) => format(new Date(val), 'MMM dd, yyyy'),
    },
    {
      key: 'isPublic',
      label: 'Public',
      render: (val) =>
        val ? (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#eef4ef]">
            <Check className="h-3.5 w-3.5" style={{ color: BRAND_GREEN }} />
          </span>
        ) : (
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
            <X className="h-3.5 w-3.5 text-red-500" />
          </span>
        ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => handleDelete(row.code)}
          className={`${brandDangerCtaClass} text-xs`}
        >
          Delete
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-8">
      <PageHeader
        title="Coupons"
        description="Manage discount coupons for your store"
      />

      <form
        onSubmit={handleAddCoupon}
        className={`${brandCardClass} p-6`}
      >
        <p className={`${brandLabelClass} mb-1`} style={{ color: BRAND_GREEN }}>New coupon</p>
        <h2 className="mb-5 text-lg font-bold text-slate-800">Add New Coupon</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Code</label>
            <input
              type="text"
              name="code"
              value={newCoupon.code}
              onChange={handleChange}
              placeholder="e.g. SUMMER20"
              required
              className={brandInputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Description</label>
            <input
              type="text"
              name="description"
              value={newCoupon.description}
              onChange={handleChange}
              placeholder="e.g. Summer sale discount"
              required
              className={brandInputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Discount %</label>
            <input
              type="number"
              name="discount"
              value={newCoupon.discount}
              onChange={handleChange}
              placeholder="e.g. 20"
              min={1}
              max={100}
              required
              className={brandInputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">Expiry Date</label>
            <input
              type="date"
              name="expiresAt"
              value={newCoupon.expiresAt}
              onChange={handleChange}
              className={brandInputClass}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={newCoupon.isPublic}
              onChange={() => handleToggle('isPublic')}
              className="h-4 w-4 rounded border-slate-300 accent-[#2f7d4a]"
            />
            <span className="text-sm text-slate-700">Public</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={newCoupon.forNewUser}
              onChange={() => handleToggle('forNewUser')}
              className="h-4 w-4 rounded border-slate-300 accent-[#2f7d4a]"
            />
            <span className="text-sm text-slate-700">New Users Only</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={newCoupon.forMember}
              onChange={() => handleToggle('forMember')}
              className="h-4 w-4 rounded border-slate-300 accent-[#2f7d4a]"
            />
            <span className="text-sm text-slate-700">Members Only</span>
          </label>
        </div>

        <button
          type="submit"
          className={`mt-5 ${brandPrimaryCtaClass}`}
          style={{ backgroundColor: BRAND_GREEN }}
        >
          Add Coupon
        </button>
      </form>

      <div>
        <p className={`${brandLabelClass} mb-1`} style={{ color: BRAND_GREEN }}>Catalog</p>
        <h2 className="mb-4 text-lg font-bold text-slate-800">All Coupons</h2>

        {loading && coupons.length === 0 ? (
          <AdminTableSkeleton />
        ) : coupons.length === 0 ? (
          <EmptyState
            icon={X}
            title="No coupons yet"
            description="Add your first coupon above"
          />
        ) : (
          <DataTable
            columns={columns}
            data={coupons}
            searchKeys={['code', 'description']}
            emptyMessage="No coupons found"
          />
        )}
      </div>
    </div>
  )
}
