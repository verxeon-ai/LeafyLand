'use client'

import { useEffect } from 'react'

export function useVendorPageSearch(setSearch) {
    useEffect(() => {
        const onSearch = (event) => {
            if (typeof event.detail === 'string') setSearch(event.detail)
        }
        window.addEventListener('leafyland-vendor-search', onSearch)
        return () => window.removeEventListener('leafyland-vendor-search', onSearch)
    }, [setSearch])
}
