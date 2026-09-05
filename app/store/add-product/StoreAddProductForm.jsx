'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import { uploadImages } from '@/components/store/StoreLogo'
import { LEAFY_CATEGORIES, MARKETPLACE_CATEGORIES } from '@/lib/categories'
import { brandCardClass, brandInputClass, brandSelectClass, brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

const emptyForm = {
    name: '',
    description: '',
    mrp: '',
    price: '',
    category: '',
    stock: '10',
}

export default function StoreAddProductForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('id')
    const isEdit = Boolean(editId)

    const [images, setImages] = useState([])
    const [existingImages, setExistingImages] = useState([])
    const [productInfo, setProductInfo] = useState(emptyForm)
    const [loading, setLoading] = useState(false)
    const [loadingProduct, setLoadingProduct] = useState(isEdit)

    useEffect(() => {
        if (!editId) return
        let cancelled = false
        setLoadingProduct(true)
        fetch(`/api/vendor/products/${editId}`)
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not load product')
                if (cancelled) return
                setProductInfo({
                    name: data.name || '',
                    description: data.description || '',
                    mrp: String(data.mrp ?? ''),
                    price: String(data.price ?? ''),
                    category: data.category || '',
                    stock: String(data.stock ?? 0),
                })
                setExistingImages(Array.isArray(data.images) ? data.images : [])
                setImages([])
            })
            .catch((err) => {
                toast.error(err.message)
                router.replace('/store/products')
            })
            .finally(() => {
                if (!cancelled) setLoadingProduct(false)
            })
        return () => {
            cancelled = true
        }
    }, [editId, router])

    const previewImages = useMemo(() => {
        const existing = existingImages.map((url) => ({ kind: 'url', src: url }))
        const files = images.map((file) => ({ kind: 'file', src: URL.createObjectURL(file), file }))
        return [...existing, ...files].slice(0, 5)
    }, [existingImages, images])

    useEffect(() => {
        return () => {
            previewImages.forEach((item) => {
                if (item.kind === 'file') URL.revokeObjectURL(item.src)
            })
        }
    }, [previewImages])

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files || [])
        const room = Math.max(0, 5 - existingImages.length - images.length)
        if (!room) return
        setImages([...images, ...files].slice(0, room))
        e.target.value = ''
    }

    const removePreview = (index) => {
        if (index < existingImages.length) {
            setExistingImages(existingImages.filter((_, i) => i !== index))
            return
        }
        const fileIndex = index - existingImages.length
        setImages(images.filter((_, i) => i !== fileIndex))
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const uploaded = images.length ? await uploadImages(images) : []
            const imageUrls = [...existingImages, ...uploaded].slice(0, 5)
            if (!imageUrls.length) throw new Error('Upload at least one product photo')

            const payload = {
                ...productInfo,
                stock: Number(productInfo.stock || 0),
                images: imageUrls,
            }

            const res = await fetch(isEdit ? `/api/vendor/products/${editId}` : '/api/vendor/products', {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || (isEdit ? 'Could not update product' : 'Could not add product'))

            toast.success(isEdit ? 'Product updated — pending re-approval' : 'Product submitted for approval!')
            if (isEdit) {
                router.push('/store/products')
                return
            }
            setProductInfo(emptyForm)
            setImages([])
            setExistingImages([])
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loadingProduct) {
        return (
            <div className="space-y-6">
                <PageHeader title="Edit Product" description="Loading product…" eyebrow="Vendor" />
                <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isEdit ? 'Edit Product' : 'Add New Product'}
                description={isEdit ? 'Update your product listing' : 'Create a new product listing for your store'}
                eyebrow="Vendor"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <form onSubmit={onSubmitHandler} className={`${brandCardClass} space-y-5 p-6`}>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                value={productInfo.name}
                                onChange={onChangeHandler}
                                placeholder="e.g. Areca Palm Giant"
                                required
                                className={brandInputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Description</label>
                            <textarea
                                name="description"
                                value={productInfo.description}
                                onChange={onChangeHandler}
                                placeholder="Describe your product..."
                                rows={4}
                                required
                                className={`${brandInputClass} resize-none`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">MRP (₹)</label>
                                <input
                                    type="number"
                                    name="mrp"
                                    value={productInfo.mrp}
                                    onChange={onChangeHandler}
                                    placeholder="0"
                                    min={0}
                                    required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Sale Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={productInfo.price}
                                    onChange={onChangeHandler}
                                    placeholder="0"
                                    min={0}
                                    required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Stock</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={productInfo.stock}
                                    onChange={onChangeHandler}
                                    placeholder="0"
                                    min={0}
                                    required
                                    className={brandInputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Category</label>
                            <select
                                onChange={(e) => setProductInfo({ ...productInfo, category: e.target.value })}
                                value={productInfo.category}
                                required
                                className={`w-full ${brandSelectClass}`}
                            >
                                <option value="">Select a category</option>
                                <optgroup label="LeafyLand Categories">
                                    {LEAFY_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </optgroup>
                                <optgroup label="Marketplace">
                                    {MARKETPLACE_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </optgroup>
                            </select>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${brandPrimaryCtaClass} py-3`}
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
                        </button>
                    </form>
                </div>

                <div className={`${brandCardClass} p-6`}>
                    <h2 className="mb-4 text-sm font-semibold text-slate-800">Product Images</h2>
                    <p className="mb-4 text-xs text-slate-500">Upload up to 5 images. First image will be the cover.</p>

                    <div className="grid grid-cols-2 gap-3">
                        {previewImages.map((item, i) => (
                            <div key={`${item.kind}-${i}-${item.src}`} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                                <img src={item.src} alt="" className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePreview(i)}
                                    className="absolute top-1.5 right-1.5 rounded-lg bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                                >
                                    <X size={12} />
                                </button>
                                {i === 0 && (
                                    <span className="absolute bottom-1.5 left-1.5 rounded bg-[#2f7d4a] px-1.5 py-0.5 text-[8px] font-bold text-white">
                                        COVER
                                    </span>
                                )}
                            </div>
                        ))}
                        {previewImages.length < 5 && (
                            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-[#2f7d4a] hover:bg-[#eef4ef]/50">
                                <Plus size={20} className="text-slate-400" />
                                <span className="mt-1 text-[10px] text-slate-400">Add Image</span>
                                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
