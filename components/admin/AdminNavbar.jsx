'use client'

import { useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import Image from "next/image"
import { ExternalLink, LogOut, Menu, Search, User } from "lucide-react"
import NotificationBell from "@/components/NotificationBell"
import ConfirmLogoutModal from "@/components/ConfirmLogoutModal"
import { assets } from "@/assets/assets"
import { BRAND_GREEN, BRAND_GREEN_LIGHT, BRAND_MUTED, BRAND_TEXT } from "@/lib/brand-ui"

const navBtnClass =
    "flex flex-col items-center gap-0.5 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-[#eef4ef] transition-colors"

const AdminNavbar = ({ onMenuToggle }) => {
    const [showLogout, setShowLogout] = useState(false)
    const [query, setQuery] = useState("")
    const pathname = usePathname()
    const { data: session } = useSession()
    const accountName = session?.user?.name?.trim() || "Admin"
    const accountEmail = session?.user?.email || ""
    const profileActive = pathname === "/admin/profile"

    const submitSearch = (e) => {
        e.preventDefault()
        window.dispatchEvent(new CustomEvent("leafyland-admin-search", { detail: query }))
    }

    return (
        <header className="sticky top-0 z-50 shrink-0 border-b border-gray-200 bg-white">
            <div className="flex h-14 min-w-0 items-center gap-2 px-3 sm:h-[4.25rem] sm:gap-3 sm:px-4 lg:px-6">
                <button
                    type="button"
                    onClick={onMenuToggle}
                    className="-ml-1 shrink-0 rounded-lg p-1.5 text-slate-700 transition-colors hover:bg-[#eef4ef] lg:hidden"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                <Link href="/admin" className="shrink-0 transition-opacity hover:opacity-90">
                    <Image
                        src={assets.logo}
                        alt="LeafyLand"
                        width={150}
                        height={38}
                        className="h-6 w-auto object-contain sm:h-7 md:h-9"
                        priority
                    />
                </Link>
                <span
                    className="hidden rounded-lg px-2 py-0.5 text-[10px] font-semibold sm:inline"
                    style={{ backgroundColor: BRAND_GREEN_LIGHT, color: BRAND_GREEN }}
                >
                    Admin
                </span>

                <form
                    onSubmit={submitSearch}
                    className="hidden h-11 min-w-0 max-w-xl flex-1 items-stretch overflow-hidden rounded-xl border border-gray-200 bg-white focus-within:border-[#2f7d4a] focus-within:ring-1 focus-within:ring-[#2f7d4a]/20 lg:flex"
                >
                    <input
                        className="min-w-0 flex-1 px-3 text-sm outline-none placeholder:text-gray-400"
                        style={{ color: BRAND_TEXT }}
                        type="text"
                        placeholder="Search this page..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="flex w-12 shrink-0 items-center justify-center text-white transition-colors hover:opacity-90"
                        style={{ backgroundColor: BRAND_GREEN }}
                        aria-label="Search"
                    >
                        <Search size={18} />
                    </button>
                </form>

                <div className="ml-auto flex shrink-0 items-center">
                    <Link
                        href="/"
                        className={navBtnClass}
                        style={{ color: BRAND_TEXT }}
                        title="Back to site"
                        aria-label="Back to site"
                    >
                        <ExternalLink size={20} strokeWidth={1.75} />
                        <span className="hidden whitespace-nowrap text-[10px] font-medium lg:block" style={{ color: BRAND_MUTED }}>
                            Back to site
                        </span>
                    </Link>

                    <NotificationBell nav />

                    <Link
                        href="/admin/profile"
                        className={`${navBtnClass} ${profileActive ? "bg-[#eef4ef]" : ""}`}
                        style={{ color: BRAND_TEXT }}
                        title={accountEmail ? `${accountName} · ${accountEmail}` : accountName}
                        aria-label="Open profile"
                    >
                        <User size={20} strokeWidth={1.75} />
                        <span className="hidden whitespace-nowrap text-[10px] font-medium lg:block" style={{ color: BRAND_MUTED }}>
                            {accountName}
                        </span>
                    </Link>

                    <button
                        type="button"
                        onClick={() => setShowLogout(true)}
                        className={navBtnClass}
                        style={{ color: BRAND_TEXT }}
                    >
                        <LogOut size={20} strokeWidth={1.75} />
                        <span className="hidden text-[10px] font-medium lg:block" style={{ color: BRAND_MUTED }}>
                            Logout
                        </span>
                    </button>
                </div>
            </div>

            <ConfirmLogoutModal open={showLogout} onClose={() => setShowLogout(false)} />
        </header>
    )
}

export default AdminNavbar
