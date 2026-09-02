'use client'
import { useState } from 'react'
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

export default function StoreAddProperty() {
    const [images, setImages] = useState([])
    const [form, setForm] = useState({
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
    })
    const [loading, setLoading] = useState(false)

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
        const files = Array.from(e.target.files)
        setImages([...images, ...files].slice(0, 5))
    }

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (!images.length) throw new Error('Upload at least one property photo')
            const imageUrls = await uploadImages(images)
            const res = await fetch('/api/vendor/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    price: Number(form.price),
                    bedrooms: form.bedrooms === '' ? null : Number(form.bedrooms),
                    bathrooms: form.bathrooms === '' ? null : Number(form.bathrooms),
                    images: imageUrls,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not add property')
            toast.success('Property submitted for approval!')
            setForm({
                title: '', description: '', propertyType: '', listingType: 'SALE',
                price: '', location: '', landSize: '', coveredArea: '',
                bedrooms: '', bathrooms: '', features: [],
            })
            setImages([])
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Add New Property" description="Create a property listing for sale or rent" eyebrow="Vendor" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={onSubmit} className={`${brandCardClass} p-6 space-y-5`}>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Title</label>
                            <input
                                type="text" name="title" value={form.title} onChange={onChange}
                                placeholder="e.g. 2 Kanal Farmhouse in DHA"
                                required
                                className={brandInputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
                            <textarea
                                name="description" value={form.description} onChange={onChange}
                                placeholder="Describe the property..."
                                rows={4} required
                                className={`${brandInputClass} resize-none`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Property Type</label>
                                <select
                                    name="propertyType" value={form.propertyType} onChange={onChange} required
                                    className={`w-full ${brandSelectClass}`}
                                >
                                    <option value="">Select type</option>
                                    {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Listing Type</label>
                                <select
                                    name="listingType" value={form.listingType} onChange={onChange} required
                                    className={`w-full ${brandSelectClass}`}
                                >
                                    <option value="SALE">Sale</option>
                                    <option value="RENT">Rent</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Price (₹)</label>
                                <input
                                    type="number" name="price" value={form.price} onChange={onChange}
                                    placeholder="0" min={0} required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Location</label>
                                <input
                                    type="text" name="location" value={form.location} onChange={onChange}
                                    placeholder="City / area" required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Land Size</label>
                                <input
                                    type="text" name="landSize" value={form.landSize} onChange={onChange}
                                    placeholder="e.g. 2 Kanal" required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Covered Area</label>
                                <input
                                    type="text" name="coveredArea" value={form.coveredArea} onChange={onChange}
                                    placeholder="e.g. 3500 sq ft"
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Bedrooms</label>
                                <input
                                    type="number" name="bedrooms" value={form.bedrooms} onChange={onChange}
                                    placeholder="0" min={0}
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Bathrooms</label>
                                <input
                                    type="number" name="bathrooms" value={form.bathrooms} onChange={onChange}
                                    placeholder="0" min={0}
                                    className={brandInputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-2">Features</label>
                            <div className="flex flex-wrap gap-2">
                                {featureOptions.map((f) => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => toggleFeature(f)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                                            form.features.includes(f)
                                                ? 'bg-[#eef4ef] border-[#2f7d4a] text-[#2f7d4a]'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full ${brandPrimaryCtaClass} py-3 disabled:opacity-60`} style={{ backgroundColor: BRAND_GREEN }}>
                            {loading ? 'Submitting…' : 'Add Property'}
                        </button>
                    </form>
                </div>

                <div className={`${brandCardClass} p-6`}>
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Property Images</h2>
                    <p className="text-xs text-slate-500 mb-4">Upload up to 5 images. First image will be the cover.</p>

                    <div className="grid grid-cols-2 gap-3">
                        {images.map((file, i) => (
                            <div key={i} className="relative aspect-square bg-slate-100 rounded-xl overflow-hidden group">
                                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(i)}
                                    className="absolute top-1.5 right-1.5 p-1 bg-black/50 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                                {i === 0 && (
                                    <span className="absolute bottom-1.5 left-1.5 bg-[#2f7d4a] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">COVER</span>
                                )}
                            </div>
                        ))}
                        {images.length < 5 && (
                            <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-[#2f7d4a] hover:bg-[#eef4ef]/50 transition-colors">
                                <Plus size={20} className="text-slate-400" />
                                <span className="text-[10px] text-slate-400 mt-1">Add Image</span>
                                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                            </label>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
