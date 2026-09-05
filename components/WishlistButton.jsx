'use client'
import { Heart } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlist } from '@/lib/features/wishlist/wishlistSlice'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const TYPE_MAP = {
    product: 'PRODUCT',
    property: 'PROPERTY',
    service: 'SERVICE',
    PRODUCT: 'PRODUCT',
    PROPERTY: 'PROPERTY',
    SERVICE: 'SERVICE',
}

const UI_TYPE = {
    PRODUCT: 'product',
    PROPERTY: 'property',
    SERVICE: 'service',
}

export function normalizeWishlistType(itemType) {
    return TYPE_MAP[itemType] || null
}

const WishlistButton = ({ itemId, itemType, className = '', activeClassName = 'text-red-500 fill-red-500' }) => {
    const dispatch = useDispatch()
    const router = useRouter()
    const { data: session } = useSession()
    const wishlist = useSelector((state) => state.wishlist?.items) || []
    const apiType = normalizeWishlistType(itemType)
    const uiType = UI_TYPE[apiType] || itemType
    const isWishlisted = wishlist.some((item) => item.id === itemId && item.type === uiType)
    const [busy, setBusy] = useState(false)

    const onClick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!apiType) return
        if (!session?.user) {
            toast.error('Sign in to save items')
            router.push('/login')
            return
        }
        if (busy) return
        setBusy(true)
        const nextOn = !isWishlisted
        dispatch(toggleWishlist({ id: itemId, type: uiType }))
        try {
            const res = await fetch('/api/wishlist', {
                method: nextOn ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ itemId, itemType: apiType }),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) throw new Error(data.error || 'Wishlist update failed')
        } catch (err) {
            dispatch(toggleWishlist({ id: itemId, type: uiType }))
            toast.error(err.message)
        } finally {
            setBusy(false)
        }
    }

    return (
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition size-9 ${className}`}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart size={18} strokeWidth={1.75} className={`block shrink-0 ${isWishlisted ? activeClassName : 'text-slate-500'}`} />
        </button>
    )
}

export default WishlistButton
