'use client'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { prefetchCatalog } from '@/lib/cachedJson'

export default function PublicLayout({ children }) {
    const pathname = usePathname()
    const hideChrome = pathname === '/login' || pathname === '/forgot-password' || pathname === '/reset-password'

    useEffect(() => {
        if (hideChrome) return
        prefetchCatalog()
    }, [hideChrome])

    return (
        <div className={`${hideChrome ? 'min-h-dvh' : 'min-h-screen'} flex min-w-0 flex-col overflow-x-hidden`}>
            {!hideChrome && <Navbar />}
            <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">{children}</main>
            {!hideChrome && <Footer />}
        </div>
    );
}
