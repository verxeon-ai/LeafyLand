'use client'

import { useState, useMemo } from 'react'
import PageHeader from '@/components/admin/PageHeader'
import DataTable from '@/components/admin/DataTable'
import StatusBadge from '@/components/admin/StatusBadge'
import DetailSlideOver from '@/components/admin/DetailSlideOver'
import FilterChips from '@/components/admin/FilterChips'
import { AdminError, AdminTableSkeleton } from '@/components/admin/AdminStates'
import { useCachedJson } from '@/lib/useCachedJson'
import { brandLinkClass, BRAND_GREEN } from '@/lib/brand-ui'
import { DetailFields, DetailNote, DetailSection, displayValue, formatAdminMoney } from '@/components/admin/AdminDetail'

export default function ProductsPage() {
  const { data: products, loading, error, reload: load } = useCachedJson('/api/admin/products', 'list')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [selectedProduct, setSelectedProduct] = useState(null)

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return ['All', ...Array.from(set)]
  }, [products])

  const filteredData = useMemo(() => {
    if (categoryFilter === 'All') return products
    return products.filter((p) => p.category === categoryFilter)
  }, [categoryFilter, products])

  const columns = [
    {
      key: 'images',
      label: 'Image',
      render: (val, row) => (
        <img
          src={val?.[0] || 'https://via.placeholder.com/40'}
          alt={row.name || ''}
          className="h-12 w-12 rounded-xl object-cover"
        />
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
      key: 'stock',
      label: 'Stock',
      render: (val) => <StatusBadge status={val > 0 ? 'active' : 'inactive'} />,
    },
    {
      key: 'id',
      label: 'View',
      render: (_val, row) => (
        <button
          type="button"
          onClick={() => setSelectedProduct(row)}
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
      <PageHeader title="Products" description="Manage all products across stores" />

      <FilterChips
        options={categories}
        value={categoryFilter}
        onChange={setCategoryFilter}
        getLabel={(cat) => (cat === 'All' ? 'All Categories' : cat)}
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
            <img
              src={selectedProduct.images?.[0] || 'https://via.placeholder.com/400'}
              alt=""
              className="h-48 w-full rounded-xl object-cover"
            />

            <DetailSection title="About">
              <DetailNote>{displayValue(selectedProduct.description)}</DetailNote>
            </DetailSection>

            <DetailSection title="Details">
              <DetailFields
                items={[
                  { label: 'Category', value: selectedProduct.category },
                  { label: 'Store', value: selectedProduct.storeName },
                  { label: 'MRP', value: formatAdminMoney(selectedProduct.mrp) },
                  { label: 'Price', value: formatAdminMoney(selectedProduct.price) },
                  { label: 'Stock', value: selectedProduct.stock },
                ]}
              />
            </DetailSection>
          </>
        )}
      </DetailSlideOver>
    </div>
  )
}
