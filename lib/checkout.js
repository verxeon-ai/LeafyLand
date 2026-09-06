import { prisma } from '@/lib/prisma'
import { resolveCoupon } from '@/lib/coupons'
import { applyDiscountPaise, lineTotalPaise, paiseToRupees, sumLinesPaise } from '@/lib/money'

/**
 * Build authoritative checkout from DB cart — never trust client prices/totals.
 * @returns {Promise<{ ok: true, address, byStore: Map, totalPaise, coupon, couponRaw, storeIds } | { ok: false, error, status? }>}
 */
export async function buildCheckoutFromCart(userId, { addressId, cartItems, couponCode }) {
    if (!addressId) {
        return { ok: false, error: 'Delivery address is required', status: 400 }
    }

    const address = await prisma.address.findFirst({
        where: { id: addressId, userId },
    })
    if (!address) {
        return { ok: false, error: 'Address not found', status: 404 }
    }

    const dbUser = await prisma.user.findUnique({ where: { id: userId } })
    let cart = dbUser?.cart && typeof dbUser.cart === 'object' ? { ...dbUser.cart } : {}
    if (cartItems && typeof cartItems === 'object' && !Array.isArray(cartItems)) {
        cart = { ...cartItems }
        await prisma.user.update({ where: { id: userId }, data: { cart } })
    }

    const productIds = Object.keys(cart).filter((id) => Number(cart[id]) > 0)
    if (!productIds.length) {
        return { ok: false, error: 'Cart is empty', status: 400 }
    }

    const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        include: { store: true },
    })

    /** @type {Map<string, { product, qty, price, linePaise }[]>} */
    const byStore = new Map()
    for (const product of products) {
        const qty = Math.floor(Number(cart[product.id] || 0))
        if (qty < 1) continue
        if (!product.inStock || product.stock < qty) {
            return { ok: false, error: `${product.name} does not have enough stock`, status: 400 }
        }
        if ((product.status && product.status !== 'approved') || product.store?.status !== 'approved' || !product.store?.isActive) {
            return { ok: false, error: `${product.name} is not available`, status: 400 }
        }
        const list = byStore.get(product.storeId) || []
        list.push({
            product,
            qty,
            price: product.price,
            linePaise: lineTotalPaise(product.price, qty),
        })
        byStore.set(product.storeId, list)
    }

    if (!byStore.size) {
        return { ok: false, error: 'Cart is empty', status: 400 }
    }

    const storeIds = [...byStore.keys()]
    let coupon = null
    let couponRaw = null
    if (couponCode) {
        const result = await resolveCoupon(couponCode, { userId, storeIds })
        if (!result.ok) return { ok: false, error: result.error, status: result.status || 400 }
        coupon = result.coupon
        couponRaw = result.raw
    }

    let totalPaise = 0
    let platformCouponUsed = false
    const storeTotals = []

    for (const [storeId, items] of byStore.entries()) {
        let storePaise = sumLinesPaise(items)
        let applyCoupon = false
        if (coupon) {
            if (coupon.storeId) {
                applyCoupon = coupon.storeId === storeId
            } else if (!platformCouponUsed) {
                applyCoupon = true
                platformCouponUsed = true
            }
        }
        if (applyCoupon) {
            storePaise = applyDiscountPaise(storePaise, coupon.discount)
        }
        storeTotals.push({ storeId, items, storePaise, applyCoupon })
        totalPaise += storePaise
    }

    if (totalPaise < 100) {
        return { ok: false, error: 'Order total is below minimum payment amount', status: 400 }
    }

    return {
        ok: true,
        address,
        byStore,
        storeTotals,
        totalPaise,
        coupon,
        couponRaw,
        platformCouponUsed,
        storeIds,
    }
}

export function storeTotalRupees(storePaise) {
    return paiseToRupees(storePaise)
}
