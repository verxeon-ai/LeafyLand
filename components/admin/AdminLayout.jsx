'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AdminNavbar from './AdminNavbar'
import AdminSidebar from './AdminSidebar'
import { ADMIN_ROUTES, prefetchAdmin } from '@/lib/cachedJson'

const STORAGE_KEY = 'leafyland-admin-sidebar-collapsed'

const AdminLayout = ({ children }) => {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [collapsed, setCollapsed] = useState(false)
    const router = useRouter()

    useEffect(() => {
        ADMIN_ROUTES.forEach((href) => router.prefetch(href))
        prefetchAdmin()
        import('@/components/charts/AdminDashboardCharts').catch(() => {})
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
            <AdminNavbar onMenuToggle={() => setMobileOpen((open) => !open)} />
            <div className="flex min-h-0 flex-1 overflow-hidden">
                <AdminSidebar
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

export default AdminLayout
