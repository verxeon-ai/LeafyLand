'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'

export default function useCartProducts() {
    const cartItems = useSelector((state) => state.cart?.cartItems) || {}
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)

    const idsKey = Object.keys(cartItems).sort().join(',')

    useEffect(() => {
        const ids = idsKey ? idsKey.split(',') : []
        if (!ids.length) {
            setProducts([])
            setLoading(false)
            return
        }
        let cancelled = false
        setLoading(true)
        fetch(`/api/products?ids=${ids.join(',')}`)
            .then((r) => r.json())
            .then((data) => {
                if (!cancelled && Array.isArray(data)) setProducts(data)
            })
            .catch(() => {
                if (!cancelled) setProducts([])
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [idsKey])

    const items = useMemo(() => {
        const list = []
        for (const [id, qty] of Object.entries(cartItems)) {
            const product = products.find((p) => p.id === id)
            if (product) list.push({ ...product, quantity: Number(qty) || 0 })
        }
        return list
    }, [cartItems, products])

    const subtotal = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 0), 0),
        [items],
    )

    return { cartItems, items, subtotal, loading, productCount: Object.keys(cartItems).length }
}
