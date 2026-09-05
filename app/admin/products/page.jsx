'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import FilterChips from '@/components/admin/FilterChips'
import CatalogImage from '@/components/CatalogImage'
import ConfirmDialog from '@/components/ConfirmDialog'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import toast from 'react-hot-toast'
import { useCachedJson } from '@/lib/useCachedJson'
import { setCachedJson } from '@/lib/cachedJson'
import {
  brandLinkClass,
  brandPrimaryCtaClass,
  brandDangerCtaClass,
  brandInputClass,
  BRAND_GREEN,
} from '@/lib/brand-ui'
import { DetailFields, DetailGallery, DetailNote, DetailSection, displayValue, formatAdminMoney } from '@/components/admin/AdminDetail'

const STATUS_OPTIONS = ['All', 'pending', 'approved', 'rejected']

export default function ProductsPage() {
  const { data: products, setData: setProducts, loading, error, reload: load } = useCachedJson('/api/admin/products', 'list')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [editStock, setEditStock] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const updateProduct = async (id, payload, successMsg) => {
    const res = await fetch('/api/admin/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...payload }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || 'Update failed')
      return null
    }
    toast.success(successMsg)
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      setCachedJson('/api/admin/products', next)
      return next
    })
    setSelectedProduct((prev) => (prev?.id === id ? { ...prev, ...data } : prev))
    return data
  }

  const handleDelete = async () => {
    if (!deleting) return
    const res = await fetch('/api/admin/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleting.id }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      toast.error(data.error || 'Could not delete')
      throw new Error('delete')
    }
    toast.success(data.message || 'Product deleted')
    setProducts((prev) => {
      const next = data.softDeleted
        ? prev.map((p) => (p.id === deleting.id ? { ...p, status: 'rejected', inStock: false, stock: 0 } : p))
        : prev.filter((p) => p.id !== deleting.id)
      setCachedJson('/api/admin/products', next)
      return next
    })
    setSelectedProduct((prev) => (prev?.id === deleting.id ? null : prev))
  }

  const saveEdits = async () => {
    if (!selectedProduct) return
    setSaving(true)
    try {
      await updateProduct(
        selectedProduct.id,
        {
          stock: editStock === '' ? selectedProduct.stock : Number(editStock),
          price: editPrice === '' ? selectedProduct.price : Number(editPrice),
        },
        'Product updated',
      )
    } finally {
      setSaving(false)
    }
  }

  const filteredData = useMemo(() => {
    if (statusFilter === 'All') return products
    return products.filter((p) => (p.status || 'approved') === statusFilter)
  }, [statusFilter, products])

  const columns = [
    {
      key: 'images',
      label: 'Image',
      render: (val, row) => (
        <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-slate-100">
          {val?.[0] ? (
            <CatalogImage fill src={val[0]} alt={row.name || ''} className="object-cover" sizes="48px" />
          ) : null}
        </div>
      ),
    },
    { key: 'name', label: 'Name', render: (val) => <span className="font-semibold">{val || 'N/A'}</span> },
    {
      key: 'storeName',
      label: 'Store',
      render: (val) => val || 'N/A',
    },
    { key: 'category', label: 'Category' },
    {
      key: 'price',
      label: 'Price',
      render: (val) => `₹${(val || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val || 'approved'} />,
    },
    {
      key: 'id',
      label: 'Actions',
      render: (_val, row) => (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedProduct(row)
              setEditStock(String(row.stock ?? 0))
              setEditPrice(String(row.price ?? 0))
            }}
            className={brandLinkClass}
            style={{ color: BRAND_GREEN }}
          >
            View
          </button>
          {(row.status || 'approved') === 'pending' && (
            <>
              <button
                type="button"
                onClick={() => updateProduct(row.id, { status: 'approved' }, 'Product approved')}
                className={brandLinkClass}
                style={{ color: BRAND_GREEN }}
              >
                Approve
              </button>
              <button
                type="button"
                onClick={() => updateProduct(row.id, { status: 'rejected' }, 'Product rejected')}
                className="text-sm font-semibold text-red-600 transition-colors hover:opacity-80"
              >
                Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader title="Products" description="Approve and manage products across stores" />

      <FilterChips
        options={STATUS_OPTIONS}
        value={statusFilter}
        onChange={setStatusFilter}
        getLabel={(s) => (s === 'All' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1))}
      />

      {loading && products.length === 0 ? (
        <AdminTableSkeleton />
      ) : error && products.length === 0 ? (
        <AdminError message={error} onRetry={load} />
      ) : (
        <DataTable
          columns={columns}
          data={filteredData}
          searchKeys={['name', 'category', 'storeName']}
          emptyMessage="No products found"
        />
      )}

      <DetailSlideOver
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        eyebrow="Product"
        title={selectedProduct?.name || 'Product details'}
        subtitle={selectedProduct?.storeName}
      >
        {selectedProduct && (
          <>
            <DetailGallery key={selectedProduct.id} images={selectedProduct.images} alt={selectedProduct.name} />

            <DetailSection title="About">
              <DetailNote>{displayValue(selectedProduct.description)}</DetailNote>
            </DetailSection>

            <DetailSection title="Details">
              <DetailFields
                items={[
                  { label: 'Category', value: selectedProduct.category },
                  { label: 'Store', value: selectedProduct.storeName },
                  { label: 'Status', value: selectedProduct.status || 'approved' },
                  { label: 'MRP', value: formatAdminMoney(selectedProduct.mrp) },
                  { label: 'Price', value: formatAdminMoney(selectedProduct.price) },
                  { label: 'Stock', value: selectedProduct.stock },
                ]}
              />
            </DetailSection>

            <DetailSection title="Edit">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="text-xs text-slate-500">
                  Price (₹)
                  <input
                    type="number"
                    min={0}
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className={`${brandInputClass} mt-1`}
                  />
                </label>
                <label className="text-xs text-slate-500">
                  Stock
                  <input
                    type="number"
                    min={0}
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className={`${brandInputClass} mt-1`}
                  />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveEdits}
                  className={`${brandPrimaryCtaClass} disabled:opacity-60`}
                  style={{ backgroundColor: BRAND_GREEN }}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                {(selectedProduct.status || 'approved') === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => updateProduct(selectedProduct.id, { status: 'approved' }, 'Product approved')}
                      className={brandPrimaryCtaClass}
                      style={{ backgroundColor: BRAND_GREEN }}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => updateProduct(selectedProduct.id, { status: 'rejected' }, 'Product rejected')}
                      className={brandDangerCtaClass}
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setDeleting(selectedProduct)}
                  className={brandDangerCtaClass}
                >
                  Delete
                </button>
              </div>
            </DetailSection>
          </>
        )}
      </DetailSlideOver>

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        danger
        eyebrow="Catalog"
        title="Delete this product?"
        description={deleting ? `"${deleting.name}" will be removed from the catalog.` : ''}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  )
}
