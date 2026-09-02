'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import { cachedJson, peekCachedJson } from '@/lib/cachedJson'

/**
 * Poll a JSON endpoint while the tab is visible. Returns { data, error, loading, refresh }.
 */
export function useLiveData(url, intervalMs = 45000) {
    const cached = peekCachedJson(url)
    const [data, setData] = useState(() => cached ?? null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(() => cached == null)
    const mounted = useRef(true)

    const refresh = useCallback(async () => {
        try {
            const d = await cachedJson(url)
            if (!mounted.current) return
            if (d?.error) {
                setError(d.error)
                return
            }
            setData(d)
            setError(null)
        } catch (e) {
            if (mounted.current) setError(e.message)
        } finally {
            if (mounted.current) setLoading(false)
        }
    }, [url])

    useEffect(() => {
        mounted.current = true
        let timer
        const loop = async () => {
            if (!mounted.current) return
            if (document.visibilityState === 'visible') await refresh()
            if (!mounted.current) return
            timer = setTimeout(loop, intervalMs)
        }
        loop()
        return () => {
            mounted.current = false
            clearTimeout(timer)
        }
    }, [refresh, intervalMs])

    return { data, error, loading, refresh }
}
