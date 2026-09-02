'use client'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import { uploadImages } from '@/components/store/StoreLogo'
import { brandCardClass, brandInputClass, brandSelectClass, brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

const serviceCategories = [
    'Landscaping', 'Irrigation', 'Garden Maintenance', 'Tree Care',
    'Lawn Care', 'Pest Control', 'Hardscaping', 'Garden Design',
]

export default function StoreAddService() {
    const [images, setImages] = useState([])
    const [form, setForm] = useState({
        name: '',
        description: '',
        category: '',
        startingPrice: '',
        duration: '',
        location: '',
    })
    const [loading, setLoading] = useState(false)

    const onChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
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
            if (!images.length) throw new Error('Upload at least one service photo')
            const imageUrls = await uploadImages(images)
            const res = await fetch('/api/vendor/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    startingPrice: Number(form.startingPrice),
                    images: imageUrls,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not add service')
            toast.success('Service submitted for approval!')
            setForm({ name: '', description: '', category: '', startingPrice: '', duration: '', location: '' })
            setImages([])
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Add New Service" description="Create a bookable service listing for your store" eyebrow="Vendor" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={onSubmit} className={`${brandCardClass} p-6 space-y-5`}>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Service Name</label>
                            <input
                                type="text" name="name" value={form.name} onChange={onChange}
                                placeholder="e.g. Full Garden Makeover"
                                required
                                className={brandInputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
                            <textarea
                                name="description" value={form.description} onChange={onChange}
                                placeholder="Describe your service..."
                                rows={4} required
                                className={`${brandInputClass} resize-none`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
                                <select
                                    name="category" value={form.category} onChange={onChange} required
                                    className={`w-full ${brandSelectClass}`}
                                >
                                    <option value="">Select category</option>
                                    {serviceCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Starting Price (₹)</label>
                                <input
                                    type="number" name="startingPrice" value={form.startingPrice} onChange={onChange}
                                    placeholder="0" min={0} required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Duration</label>
                                <input
                                    type="text" name="duration" value={form.duration} onChange={onChange}
                                    placeholder="e.g. 2-3 hours"
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Location</label>
                                <input
                                    type="text" name="location" value={form.location} onChange={onChange}
                                    placeholder="Service area" required
                                    className={brandInputClass}
                                />
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full ${brandPrimaryCtaClass} py-3 disabled:opacity-60`} style={{ backgroundColor: BRAND_GREEN }}>
                            {loading ? 'Submitting…' : 'Add Service'}
                        </button>
                    </form>
                </div>

                <div className={`${brandCardClass} p-6`}>
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Service Images</h2>
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
