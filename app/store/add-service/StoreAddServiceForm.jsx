'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import { uploadImages } from '@/components/store/StoreLogo'
import { brandCardClass, brandInputClass, brandSelectClass, brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

const serviceCategories = [
    'Landscaping', 'Irrigation', 'Garden Maintenance', 'Tree Care',
    'Lawn Care', 'Pest Control', 'Hardscaping', 'Garden Design',
]

const emptyForm = {
    name: '',
    description: '',
    category: '',
    startingPrice: '',
    duration: '',
    location: '',
}

export default function StoreAddServiceForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('id')
    const isEdit = Boolean(editId)

    const [images, setImages] = useState([])
    const [existingImages, setExistingImages] = useState([])
    const [form, setForm] = useState(emptyForm)
    const [loading, setLoading] = useState(false)
    const [loadingService, setLoadingService] = useState(isEdit)

    useEffect(() => {
        if (!editId) return
        let cancelled = false
        setLoadingService(true)
        fetch(`/api/vendor/services/${editId}`)
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not load service')
                if (cancelled) return
                setForm({
                    name: data.name || '',
                    description: data.description || '',
                    category: data.category || '',
                    startingPrice: String(data.startingPrice ?? ''),
                    duration: data.duration || '',
                    location: data.location || '',
                })
                setExistingImages(Array.isArray(data.images) ? data.images : [])
                setImages([])
            })
            .catch((err) => {
                toast.error(err.message)
                router.replace('/store/services')
            })
            .finally(() => {
                if (!cancelled) setLoadingService(false)
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

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
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

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const uploaded = images.length ? await uploadImages(images) : []
            const imageUrls = [...existingImages, ...uploaded].slice(0, 5)
            if (!imageUrls.length) throw new Error('Upload at least one service photo')

            const payload = {
                ...form,
                startingPrice: Number(form.startingPrice),
                images: imageUrls,
            }

            const res = await fetch(isEdit ? `/api/vendor/services/${editId}` : '/api/vendor/services', {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || (isEdit ? 'Could not update service' : 'Could not add service'))

            if (isEdit) {
                toast.success('Service updated — pending approval')
                router.push('/store/services')
                return
            }
            toast.success('Service submitted for approval!')
            setForm(emptyForm)
            setImages([])
            setExistingImages([])
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loadingService) {
        return (
            <div className="space-y-6">
                <PageHeader title="Edit Service" description="Loading service…" eyebrow="Vendor" />
                <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isEdit ? 'Edit Service' : 'Add New Service'}
                description={isEdit ? 'Update your service listing' : 'Create a bookable service listing for your store'}
                eyebrow="Vendor"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <form onSubmit={onSubmit} className={`${brandCardClass} space-y-5 p-6`}>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Service Name</label>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                placeholder="e.g. Full Garden Makeover"
                                required
                                className={brandInputClass}
                            />
                        </div>

                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Description</label>
                            <textarea
                                name="description"
                                value={form.description}
                                onChange={onChange}
                                placeholder="Describe your service..."
                                rows={4}
                                required
                                className={`${brandInputClass} resize-none`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Category</label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={onChange}
                                    required
                                    className={`w-full ${brandSelectClass}`}
                                >
                                    <option value="">Select category</option>
                                    {serviceCategories.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Starting Price (₹)</label>
                                <input
                                    type="number"
                                    name="startingPrice"
                                    value={form.startingPrice}
                                    onChange={onChange}
                                    placeholder="0"
                                    min={0}
                                    required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Duration</label>
                                <input
                                    type="text"
                                    name="duration"
                                    value={form.duration}
                                    onChange={onChange}
                                    placeholder="e.g. 2-3 hours"
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={form.location}
                                    onChange={onChange}
                                    placeholder="Service area"
                                    required
                                    className={brandInputClass}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${brandPrimaryCtaClass} py-3 disabled:opacity-60`}
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Service'}
                        </button>
                    </form>
                </div>

                <div className={`${brandCardClass} p-6`}>
                    <h2 className="mb-4 text-sm font-semibold text-slate-800">Service Images</h2>
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
