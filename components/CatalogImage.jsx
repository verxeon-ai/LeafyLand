'use client'
import { useState } from 'react'
import Image from 'next/image'

function isLocalPath(src) {
    return typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')
}

function isInlineSrc(src) {
    return typeof src === 'string' && (src.startsWith('data:') || src.startsWith('blob:'))
}

/** Product/property/service photos. Remote URLs skip the optimizer so Unsplash (and uploads) actually paint. */
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
    const [failed, setFailed] = useState(false)

    if (!src || failed) {
        return <div className={fill ? `absolute inset-0 bg-slate-100 ${className || ''}` : className} aria-hidden />
    }

    const imgClass = fill
        ? `absolute inset-0 h-full w-full object-cover ${className || ''}`.trim()
        : className

    if (isInlineSrc(src) || !isLocalPath(src)) {
        return (
            <img
                src={src}
                alt={alt}
                width={fill ? undefined : width}
                height={fill ? undefined : height}
                className={imgClass}
                loading={priority ? 'eager' : 'lazy'}
                decoding="async"
                fetchPriority={priority ? 'high' : 'low'}
                draggable={false}
                onError={() => setFailed(true)}
            />
        )
    }

    const common = {
        src,
        alt,
        className: imgClass,
        sizes,
        priority,
        quality: 75,
        draggable: false,
        onError: () => setFailed(true),
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
