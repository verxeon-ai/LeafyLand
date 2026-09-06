'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import { uploadImages } from '@/components/store/StoreLogo'
import { brandCardClass, brandInputClass, brandSelectClass, brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

const propertyTypes = [
    'Farmhouse', 'Agricultural Land', 'Nursery', 'Farmland', 'Cottage', 'Garden Plot',
]

const featureOptions = [
    'Water Availability', 'Electricity', 'Garden', 'Parking', 'Boundary Wall', 'Irrigation',
]

const emptyForm = {
    title: '',
    description: '',
    propertyType: '',
    listingType: 'SALE',
    price: '',
    location: '',
    landSize: '',
    coveredArea: '',
    bedrooms: '',
    bathrooms: '',
    features: [],
}

export default function StoreAddPropertyForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const editId = searchParams.get('id')
    const isEdit = Boolean(editId)

    const [images, setImages] = useState([])
    const [existingImages, setExistingImages] = useState([])
    const [form, setForm] = useState(emptyForm)
    const [loading, setLoading] = useState(false)
    const [loadingProperty, setLoadingProperty] = useState(isEdit)

    useEffect(() => {
        if (!editId) return
        let cancelled = false
        setLoadingProperty(true)
        fetch(`/api/vendor/properties/${editId}`)
            .then(async (res) => {
                const data = await res.json()
                if (!res.ok) throw new Error(data.error || 'Could not load property')
                if (cancelled) return
                setForm({
                    title: data.title || '',
                    description: data.description || '',
                    propertyType: data.propertyType || '',
                    listingType: data.listingType || 'SALE',
                    price: String(data.price ?? ''),
                    location: data.location || '',
                    landSize: data.landSize || '',
                    coveredArea: data.coveredArea || '',
                    bedrooms: data.bedrooms == null ? '' : String(data.bedrooms),
                    bathrooms: data.bathrooms == null ? '' : String(data.bathrooms),
                    features: Array.isArray(data.features) ? data.features : [],
                })
                setExistingImages(Array.isArray(data.images) ? data.images : [])
                setImages([])
            })
            .catch((err) => {
                toast.error(err.message)
                router.replace('/store/properties')
            })
            .finally(() => {
                if (!cancelled) setLoadingProperty(false)
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

    const toggleFeature = (feature) => {
        setForm((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }))
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
            if (!imageUrls.length) throw new Error('Upload at least one property photo')

            const payload = {
                ...form,
                price: Number(form.price),
                bedrooms: form.bedrooms === '' ? null : Number(form.bedrooms),
                bathrooms: form.bathrooms === '' ? null : Number(form.bathrooms),
                images: imageUrls,
            }

            const res = await fetch(isEdit ? `/api/vendor/properties/${editId}` : '/api/vendor/properties', {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || (isEdit ? 'Could not update property' : 'Could not add property'))

            if (isEdit) {
                toast.success('Property updated — pending approval')
                router.push('/store/properties')
                return
            }
            toast.success('Property submitted for approval!')
            setForm(emptyForm)
            setImages([])
            setExistingImages([])
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (loadingProperty) {
        return (
            <div className="space-y-6">
                <PageHeader title="Edit Property" description="Loading property…" eyebrow="Vendor" />
                <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isEdit ? 'Edit Property' : 'Add New Property'}
                description={isEdit ? 'Update your property listing' : 'Create a property listing for sale or rent'}
                eyebrow="Vendor"
            />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="space-y-6 lg:col-span-2">
                    <form onSubmit={onSubmit} className={`${brandCardClass} space-y-5 p-6`}>
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-500">Title</label>
                            <input
                                type="text"
                                name="title"
                                value={form.title}
                                onChange={onChange}
                                placeholder="e.g. 2 Kanal Farmhouse in DHA"
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
                                placeholder="Describe the property..."
                                rows={4}
                                required
                                className={`${brandInputClass} resize-none`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Property Type</label>
                                <select
                                    name="propertyType"
                                    value={form.propertyType}
                                    onChange={onChange}
                                    required
                                    className={`w-full ${brandSelectClass}`}
                                >
                                    <option value="">Select type</option>
                                    {propertyTypes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Listing Type</label>
                                <select
                                    name="listingType"
                                    value={form.listingType}
                                    onChange={onChange}
                                    required
                                    className={`w-full ${brandSelectClass}`}
                                >
                                    <option value="SALE">Sale</option>
                                    <option value="RENT">Rent</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Price (₹)</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={form.price}
                                    onChange={onChange}
                                    placeholder="0"
                                    min={0}
                                    required
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
                                    placeholder="City / area"
                                    required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Land Size</label>
                                <input
                                    type="text"
                                    name="landSize"
                                    value={form.landSize}
                                    onChange={onChange}
                                    placeholder="e.g. 2 Kanal"
                                    required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Covered Area</label>
                                <input
                                    type="text"
                                    name="coveredArea"
                                    value={form.coveredArea}
                                    onChange={onChange}
                                    placeholder="e.g. 3500 sq ft"
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Bedrooms</label>
                                <input
                                    type="number"
                                    name="bedrooms"
                                    value={form.bedrooms}
                                    onChange={onChange}
                                    placeholder="0"
                                    min={0}
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-500">Bathrooms</label>
                                <input
                                    type="number"
                                    name="bathrooms"
                                    value={form.bathrooms}
                                    onChange={onChange}
                                    placeholder="0"
                                    min={0}
                                    className={brandInputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs font-medium text-slate-500">Features</label>
                            <div className="flex flex-wrap gap-2">
                                {featureOptions.map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => toggleFeature(f)}
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                                            form.features.includes(f)
                                                ? 'border-[#2f7d4a] bg-[#eef4ef] text-[#2f7d4a]'
                                                : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${brandPrimaryCtaClass} py-3 disabled:opacity-60`}
                            style={{ backgroundColor: BRAND_GREEN }}
                        >
                            {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Property'}
                        </button>
                    </form>
                </div>

                <div className={`${brandCardClass} p-6`}>
                    <h2 className="mb-4 text-sm font-semibold text-slate-800">Property Images</h2>
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
