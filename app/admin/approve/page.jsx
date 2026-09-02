'use client'

import { useMemo } from 'react'
import { CheckCircle } from 'lucide-react'
import PageHeader from '@/components/admin/PageHeader'
import EmptyState from '@/components/admin/EmptyState'
import { AdminTableSkeleton } from '@/components/admin/AdminStates'
import toast from 'react-hot-toast'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'
import {
  brandCardClass,
  brandPrimaryCtaClass,
  brandDangerCtaClass,
  BRAND_GREEN,
} from '@/lib/brand-ui'

export default function AdminApprove() {
  const { data: stores, setData: setStores, loading } = useCachedJson('/api/admin/stores', 'list')
  const pendingStores = useMemo(
    () => (stores || []).filter((s) => s.status === 'pending'),
    [stores],
  )

  const updateStatus = async (id, status) => {
    const res = await fetch(`/api/admin/stores/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return toast.error(status === 'approved' ? 'Approve failed' : 'Reject failed')
    setStores((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, status } : s))
      setCachedJson('/api/admin/stores', next)
      return next
    })
    toast.success(status === 'approved' ? 'Store approved' : 'Store rejected')
  }

  const handleApprove = (id) => updateStatus(id, 'approved')
  const handleReject = (id) => updateStatus(id, 'rejected')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Store Approvals"
        description="Review and approve pending store applications"
      />

      {loading && pendingStores.length === 0 ? (
        <AdminTableSkeleton rows={3} />
      ) : pendingStores.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="No pending approvals"
          description="All store applications have been reviewed"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {pendingStores.map((store) => (
            <div
              key={store.id}
              className={`${brandCardClass} flex flex-col p-5`}
            >
              <h3 className="text-lg font-bold text-slate-800">{store.name}</h3>
              <p className="text-sm text-slate-500">{store.user?.name}</p>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{store.description}</p>
              <p className="mt-3 text-xs text-slate-400">
                Applied {new Date(store.createdAt).toLocaleDateString()}
              </p>
              <div className="mt-auto flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => handleApprove(store.id)}
                  className={brandPrimaryCtaClass}
                  style={{ backgroundColor: BRAND_GREEN }}
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={() => handleReject(store.id)}
                  className={brandDangerCtaClass}
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
