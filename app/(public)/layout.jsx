'use client'
import { usePathname } from 'next/navigation'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }) {
    const pathname = usePathname()
    const hideChrome = pathname === '/login'

    return (
        <div className={`${hideChrome ? 'h-dvh overflow-hidden' : 'min-h-screen'} flex flex-col`}>
            {!hideChrome && <Navbar />}
            <main className={`flex-1 flex flex-col ${hideChrome ? 'min-h-0 overflow-hidden' : ''}`}>{children}</main>
            {!hideChrome && <Footer />}
        </div>
    );
}
