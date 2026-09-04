'use client'

import { Suspense } from 'react'
import StoreAddProductForm from './StoreAddProductForm'

export default function StoreAddProductPage() {
    return (
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-slate-100" />}>
            <StoreAddProductForm />
        </Suspense>
    )
}
