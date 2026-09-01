'use client'
import Image from 'next/image'

function isRemoteOptimized(src) {
    if (!src || typeof src !== 'string') return false
    if (src.startsWith('data:') || src.startsWith('blob:')) return false
    return true
}

/** Product/property/service photos — lazy by default, Next optimizer when the URL allows. */
export default function CatalogImage({
    src,
    alt = '',
    width,
    height,
    className,
    sizes,
    priority = false,
    fill = false,
}) {
    if (!src) return <div className={className} aria-hidden />

    if (!isRemoteOptimized(src)) {
        return (
            <img
                src={src}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                className={className}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? 'high' : 'low'}
                draggable={false}
            />
        )
    }

    const common = {
        src,
        alt,
        className,
        sizes,
        priority,
        quality: 70,
        draggable: false,
    }

    if (fill) {
        return <Image {...common} fill />
    }

    return (
        <Image
            {...common}
            width={width}
            height={height}
            loading={priority ? undefined : 'lazy'}
        />
    )
}
