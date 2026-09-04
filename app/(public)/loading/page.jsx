'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'

function safeNextUrl(raw) {
    if (!raw || typeof raw !== 'string') return '/'
    if (!raw.startsWith('/') || raw.startsWith('//')) return '/'
    return raw
}

export default function LoadingPage() {
    const router = useRouter()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const next = safeNextUrl(params.get('nextUrl'))
        const timer = setTimeout(() => router.replace(next), 400)
        return () => clearTimeout(timer)
    }, [router])

    return <Loading />
}
