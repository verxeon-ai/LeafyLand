'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Loading from '@/components/Loading'

/** Stock toggles live on Inventory; product edits use /store/add-product?id= */
export default function StoreManageProductsRedirect() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/store/inventory')
    }, [router])
    return <Loading />
}
