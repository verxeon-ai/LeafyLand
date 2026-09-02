'use client'

import { useState, useMemo } from 'react'
import { UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import FilterChips from '@/components/admin/FilterChips'
import { AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'
import {
  brandCardClass,
  brandPrimaryCtaClass,
  brandGhostCtaClass,
  brandInputClass,
  brandLinkClass,
  BRAND_GREEN,
  BRAND_GREEN_LIGHT,
} from '@/lib/brand-ui'
import { DetailFields, DetailSection, formatAdminDate } from '@/components/admin/AdminDetail'

const ROLE_FILTERS = ['All', 'Buyer', 'Seller', 'Admin']

const ROLE_STYLES = {
  admin: { backgroundColor: BRAND_GREEN, color: '#fff' },
  seller: { backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN },
  buyer: {},
}

function RoleBadge({ role }) {
  const key = (role || 'buyer').toLowerCase()
  const style = ROLE_STYLES[key]
  const label = key.charAt(0).toUpperCase() + key.slice(1)
  return (
    <span
      className={`inline-flex items-center rounded-xl px-2.5 py-0.5 text-xs font-semibold ${key === 'buyer' ? 'bg-slate-100 text-slate-600' : ''}`}
      style={style}
    >
      {label}
    </span>
  )
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function UsersPage() {
  const [roleFilter, setRoleFilter] = useState('All')
  const [selectedUser, setSelectedUser] = useState(null)
  const { data: users, setData: setUsers, loading } = useCachedJson('/api/admin/users', 'list')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '', confirmPassword: '' })

  const filteredData = useMemo(() => {
    if (roleFilter === 'All') return users
    return users.filter((u) => u.role === roleFilter.toLowerCase())
  }, [roleFilter, users])

  const handleCreateAdmin = async (e) => {
    e.preventDefault()

    if (newAdmin.password !== newAdmin.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newAdmin.name,
          email: newAdmin.email,
          password: newAdmin.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Could not create admin')
        return
      }
      toast.success(`Admin account created for ${data.email}`)
      setUsers((prev) => {
        const next = [data, ...prev]
        setCachedJson('/api/admin/users', next)
        return next
      })
      setNewAdmin({ name: '', email: '', password: '', confirmPassword: '' })
      setShowCreateForm(false)
    } catch {
      toast.error('Could not create admin')
    } finally {
      setCreating(false)
    }
  }

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (_, row) => (
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
            style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
          >
            {(row.name || '?').split(' ').map((n) => n[0]).join('')}
          </div>
          <span className="font-semibold text-slate-800">{row.name}</span>
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (val) => <span className="text-slate-600">{val}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (val) => <RoleBadge role={val} />,
    },
    {
      key: 'joinDate',
      label: 'Join Date',
      render: (val) => formatDate(val),
    },
    {
      key: 'totalOrders',
      label: 'Total Orders',
    },
    {
      key: 'id',
      label: 'View',
      render: (_, row) => (
        <button
          type="button"
          onClick={() => setSelectedUser(row)}
          className={brandLinkClass}
          style={{ color: BRAND_GREEN }}
        >
          View
        </button>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="View platform users. Create new admin accounts only — existing users cannot be promoted."
        action={
          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className={brandPrimaryCtaClass}
            style={{ backgroundColor: BRAND_GREEN }}
          >
            <UserPlus size={16} />
            Create Admin Account
          </button>
        }
      />

      {showCreateForm && (
        <form
          onSubmit={handleCreateAdmin}
          className={`${brandCardClass} space-y-4 p-5`}
        >
          <h2 className="text-sm font-bold text-slate-800">Create new admin account</h2>
          <p className="text-xs text-slate-500">
            Only create accounts for trusted team members. The email must not already be registered on the platform.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Full name"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
              className={brandInputClass}
            />
            <input
              type="email"
              required
              placeholder="Admin email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
              className={brandInputClass}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password (min 6 characters)"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
              className={brandInputClass}
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Confirm password"
              value={newAdmin.confirmPassword}
              onChange={(e) => setNewAdmin({ ...newAdmin, confirmPassword: e.target.value })}
              className={brandInputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={creating}
              className={`${brandPrimaryCtaClass} disabled:opacity-60`}
              style={{ backgroundColor: BRAND_GREEN }}
            >
              {creating ? 'Creating…' : 'Create admin account'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className={brandGhostCtaClass}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <FilterChips
        options={ROLE_FILTERS}
        value={roleFilter}
        onChange={setRoleFilter}
        getLabel={(r) => (r === 'All' ? 'All Roles' : r)}
      />

      {loading && users.length === 0 ? (
        <AdminTableSkeleton />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          searchKeys={['name', 'email']}
          emptyMessage="No users found"
        />
      )}

      <DetailSlideOver
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        eyebrow="User"
        title={selectedUser?.name ?? 'User details'}
        subtitle={selectedUser?.email}
      >
        {selectedUser && (
          <>
            <div className="flex items-center gap-4">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold"
                style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
              >
                {(selectedUser.name || '?').split(' ').map((n) => n[0]).join('')}
              </div>
              <div>
                <p className="text-base font-bold text-slate-800">{selectedUser.name}</p>
                <div className="mt-1.5">
                  <RoleBadge role={selectedUser.role} />
                </div>
              </div>
            </div>

            <DetailSection title="Account">
              <DetailFields
                items={[
                  { label: 'Email', value: selectedUser.email },
                  { label: 'Role', value: selectedUser.role ? selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1) : '—' },
                  { label: 'Joined', value: formatAdminDate(selectedUser.joinDate) },
                  { label: 'Orders', value: selectedUser.totalOrders },
                ]}
              />
            </DetailSection>

            {selectedUser.storeName && (
              <DetailSection title="Store">
                <DetailFields
                  items={[
                    { label: 'Name', value: selectedUser.storeName },
                    { label: 'Status', value: selectedUser.storeStatus },
                  ]}
                />
              </DetailSection>
            )}
          </>
        )}
      </DetailSlideOver>
    </div>
  )
}
