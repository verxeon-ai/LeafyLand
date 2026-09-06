'use client'

import { Suspense } from 'react'
import StoreAddPropertyForm from './StoreAddPropertyForm'

export default function StoreAddPropertyPage() {
    return (
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}>
            <StoreAddPropertyForm />
        </Suspense>
    )
}
