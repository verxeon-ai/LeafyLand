'use client'

import { useCallback, useEffect, useState } from 'react'
import { cachedJson, peekCachedJson, restoreCachedJson } from '@/lib/cachedJson'

export function useCachedJson(url, mode = 'list') {
    const isValid = useCallback((value) => {
        if (mode === 'list') return Array.isArray(value)
        return Boolean(value) && typeof value === 'object' && !value.error
    }, [mode])

    const cached = peekCachedJson(url)
    const [data, setData] = useState(() => (isValid(cached) ? cached : mode === 'list' ? [] : null))
    const [loading, setLoading] = useState(() => !isValid(cached))
    const [error, setError] = useState('')

    const reload = useCallback((options = {}) => {
        const { silent = false } = options
        const hit = restoreCachedJson(url)
        if (isValid(hit)) {
            setData(hit)
            setLoading(false)
        } else if (!silent) {
            setLoading(true)
        }

        return cachedJson(url)
            .then((json) => {
                if (!isValid(json)) {
                    throw new Error(json?.error || 'Failed to load')
                }
                setData(json)
                setError('')
                return json
            })
            .catch((e) => {
                setError(e.message || 'Something went wrong')
            })
            .finally(() => setLoading(false))
    }, [url, isValid])

    useEffect(() => {
        reload()
    }, [reload])

    return { data, setData, loading, error, reload }
}
