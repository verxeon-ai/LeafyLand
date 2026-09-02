'use client'

export function isVendorPhoto(src) {
    if (!src || typeof src !== 'string') return false
    const value = src.trim()
    if (!value) return false
    if (value === '/logo.png' || value.endsWith('/logo.png')) return false
    return (
        value.startsWith('/uploads/') ||
        value.startsWith('data:image/') ||
        value.startsWith('http://') ||
        value.startsWith('https://') ||
        value.startsWith('blob:')
    )
}

export default function StoreLogo({ src, name = 'Store', className = 'w-8 h-8 rounded-full' }) {
    if (isVendorPhoto(src)) {
        return (
            <img
                src={src}
                alt={name}
                className={`${className} object-cover bg-slate-100`}
            />
        )
    }

    return (
        <div className={`${className} flex items-center justify-center font-bold`} style={{ backgroundColor: '#eef4ef', color: '#2f7d4a' }}>
            {name?.charAt(0)?.toUpperCase() || 'S'}
        </div>
    )
}

/** Upload to /api/upload and return a public /uploads/... URL (not a data URL). */
export async function uploadImage(file) {
    if (!file) return ''
    if (!file.type?.startsWith('image/')) {
        throw new Error('Only image files are allowed')
    }
    if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be under 5 MB')
    }
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(data.error || 'Upload failed')
    if (!data.url) throw new Error('Upload failed')
    return data.url
}

/** Upload multiple images in parallel. */
export async function uploadImages(files) {
    return Promise.all(Array.from(files || []).map((file) => uploadImage(file)))
}

/** @deprecated Use uploadImage */
export function fileToDataUrl(file) {
    return uploadImage(file)
}
