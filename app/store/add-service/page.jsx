'use client'

import { Suspense } from 'react'
import StoreAddServiceForm from './StoreAddServiceForm'

export default function StoreAddServicePage() {
    return (
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}>
            <StoreAddServiceForm />
        </Suspense>
    )
}
