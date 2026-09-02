'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StoreNavbar from './StoreNavbar'
import StoreSidebar from './StoreSidebar'
import { VendorStoreProvider, useVendorStore } from './VendorStoreContext'
import { VENDOR_ROUTES, prefetchVendor } from '@/lib/cachedJson'

const STORAGE_KEY = 'leafyland-vendor-sidebar-collapsed'

function StoreShell({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const { store } = useVendorStore()
    const router = useRouter()

    useEffect(() => {
        VENDOR_ROUTES.forEach((href) => router.prefetch(href))
        prefetchVendor()
        import('@/components/charts/VendorDashboardCharts').catch(() => {})
    }, [router])

    useEffect(() => {
        try {
            setCollapsed(localStorage.getItem(STORAGE_KEY) === '1')
        } catch {
            /* ignore */
        }
    }, [])

    const toggleCollapsed = () => {
        setCollapsed((current) => {
            const next = !current
            try {
                localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
            } catch {
                /* ignore */
            }
            return next
        })
    }

    return (
        <div className="flex h-screen flex-col bg-slate-50/50">
            <StoreNavbar
                onMenuToggle={() => setMobileOpen((open) => !open)}
                storeInfo={store}
            />
            <div className="flex min-h-0 flex-1 overflow-hidden">
                <StoreSidebar
                    mobileOpen={mobileOpen}
                    onMobileClose={() => setMobileOpen(false)}
                    collapsed={collapsed}
                    onToggleCollapsed={toggleCollapsed}
                />
                <main className="min-w-0 flex-1 overflow-y-auto p-4 lg:p-6">
                    <div className="mx-auto w-full max-w-7xl">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}

const StoreLayout = ({ children }) => (
    <VendorStoreProvider>
        <StoreShell>{children}</StoreShell>
    </VendorStoreProvider>
)

export default StoreLayout
