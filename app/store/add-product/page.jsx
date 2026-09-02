'use client'
import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import PageHeader from '@/components/admin/PageHeader'
import { uploadImages } from '@/components/store/StoreLogo'
import { LEAFY_CATEGORIES, MARKETPLACE_CATEGORIES } from '@/lib/categories'
import { brandCardClass, brandInputClass, brandSelectClass, brandPrimaryCtaClass, BRAND_GREEN } from '@/lib/brand-ui'

export default function StoreAddProduct() {
    const [images, setImages] = useState([])
    const [productInfo, setProductInfo] = useState({
        name: '', description: '', mrp: '', price: '', category: '', stock: '10',
    })
    const [loading, setLoading] = useState(false)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files)
        setImages([...images, ...files].slice(0, 5))
    }

    const removeImage = (index) => {
        setImages(images.filter((_, i) => i !== index))
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (!images.length) throw new Error('Upload at least one product photo')
            const imageUrls = await uploadImages(images)
            const res = await fetch('/api/vendor/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...productInfo,
                    stock: Number(productInfo.stock || 0),
                    images: imageUrls,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not add product')
            toast.success('Product added successfully!')
            setProductInfo({ name: '', description: '', mrp: '', price: '', category: '', stock: '10' })
            setImages([])
        } catch (err) {
            toast.error(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <PageHeader title="Add New Product" description="Create a new product listing for your store" eyebrow="Vendor" />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Form */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={onSubmitHandler} className={`${brandCardClass} p-6 space-y-5`}>
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Product Name</label>
                            <input
                                type="text" name="name" value={productInfo.name} onChange={onChangeHandler}
                                placeholder="e.g. Areca Palm Giant"
                                required
                                className={brandInputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Description</label>
                            <textarea
                                name="description" value={productInfo.description} onChange={onChangeHandler}
                                placeholder="Describe your product..."
                                rows={4} required
                                className={`${brandInputClass} resize-none`}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">MRP (₹)</label>
                                <input
                                    type="number" name="mrp" value={productInfo.mrp} onChange={onChangeHandler}
                                    placeholder="0" min={0} required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Sale Price (₹)</label>
                                <input
                                    type="number" name="price" value={productInfo.price} onChange={onChangeHandler}
                                    placeholder="0" min={0} required
                                    className={brandInputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1.5">Stock</label>
                                <input
                                    type="number" name="stock" value={productInfo.stock} onChange={onChangeHandler}
                                    placeholder="0" min={0} required
                                    className={brandInputClass}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1.5">Category</label>
                            <select
                                onChange={(e) => setProductInfo({ ...productInfo, category: e.target.value })}
                                value={productInfo.category}
                                required
                                className={`w-full ${brandSelectClass}`}
                            >
                                <option value="">Select a category</option>
                                <optgroup label="🌿 LeafyLand Categories">
                                    {LEAFY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </optgroup>
                                <optgroup label="🛒 Marketplace">
                                    {MARKETPLACE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </optgroup>
                            </select>
                        </div>

                        <button type="submit" disabled={loading} className={`w-full ${brandPrimaryCtaClass} py-3`} style={{ backgroundColor: BRAND_GREEN }}>
                            Add Product
                        </button>
                    </form>
                </div>

                {/* Image Upload */}
                <div className={`${brandCardClass} p-6`}>
                    <h2 className="text-sm font-semibold text-slate-800 mb-4">Product Images</h2>
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
