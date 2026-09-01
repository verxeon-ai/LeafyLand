'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Poll a JSON endpoint while the tab is visible. Returns { data, error, loading, refresh }.
 */
export function useLiveData(url, intervalMs = 45000) {
    const [data, setData] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)
    const mounted = useRef(true)

    const refresh = useCallback(async () => {
        try {
            const r = await fetch(url, { cache: 'no-store' })
            const d = await r.json()
            if (!mounted.current) return
            if (!r.ok) throw new Error(d?.error || `Request failed (${r.status})`)
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
