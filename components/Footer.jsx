import Link from 'next/link'
import Image from 'next/image'
import {
    ShoppingBag, Building2, Wrench, Tag, Store, Leaf, CircleHelp,
    Shield, FileText, Lock, Phone, Mail, MapPin, Headphones,
    ShieldCheck, Truck, BadgeCheck, Award, ArrowRight,
    Facebook, Instagram, Youtube,
} from 'lucide-react'
import { assets } from '@/assets/assets'
import { brandRadiusClass, BRAND_GREEN } from '@/lib/brand-ui'

const BRAND = {
    green: BRAND_GREEN,
    bottomBg: '#f4f8f5',
    text: '#1f2937',
    muted: '#6b7280',
}

const marketplaceLinks = [
    { text: 'Products', path: '/products', icon: ShoppingBag },
    { text: 'Properties', path: '/properties', icon: Building2 },
    { text: 'Services', path: '/services', icon: Wrench },
    { text: 'Classifieds', path: '/products', icon: Tag },
    { text: 'Become a Seller', path: '/become-seller', icon: Store },
]

const companyLinks = [
    { text: 'About LeafyLand', path: '/about', icon: Leaf },
    { text: 'How It Works', path: '/how-it-works', icon: CircleHelp },
    { text: 'Seller Policy', path: '/seller-policy', icon: Shield },
    { text: 'Terms & Conditions', path: '/terms', icon: FileText },
    { text: 'Privacy Policy', path: '/privacy', icon: Lock },
]

const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/share/1BhC6xSjTR/?mibextid=wwXIfr' },
    { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/leafyland_official?igsh=MXFvcjVxdGwyZXk2bw%3D%3D&utm_source=qr' },
    { icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@leafyland' },
]

const trustItems = [
    { icon: ShieldCheck, title: 'Secure & Safe', text: '100% secure payments and data protection' },
    { icon: Truck, title: 'Fast Delivery', text: 'Quick delivery and real-time tracking' },
    { icon: Award, title: 'Verified Vendors', text: 'Vetted sellers you can trust' },
    { icon: BadgeCheck, title: 'Trusted Platform', text: 'Verified sellers and quality services' },
]

function SectionTitle({ children }) {
    return (
        <div className="mb-4">
            <h3
                className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: BRAND.text }}
            >
                {children}
            </h3>
            <span
                className="mt-1.5 block h-0.5 w-7 rounded-full"
                style={{ backgroundColor: BRAND.green }}
            />
        </div>
    )
}

function FooterLink({ href, icon: Icon, children }) {
    return (
        <li>
            <Link
                href={href}
                className="group flex items-center gap-2.5 text-sm transition-colors"
                style={{ color: BRAND.muted }}
            >
                {Icon && (
                    <Icon
                        size={15}
                        strokeWidth={1.75}
                        className="shrink-0"
                        style={{ color: BRAND.green }}
                    />
                )}
                <span className="group-hover:underline" style={{ color: BRAND.text }}>
                    {children}
                </span>
            </Link>
        </li>
    )
}

function VisaLogo() {
    return (
        <svg viewBox="0 0 48 16" className="h-4 w-[42px]" aria-label="Visa">
            <rect width="48" height="16" rx="2" fill="white" />
            <text
                x="24"
                y="12.2"
                textAnchor="middle"
                fill="#1A1F71"
                fontFamily="Arial Black, Arial, sans-serif"
                fontStyle="italic"
                fontWeight="800"
                fontSize="11"
                letterSpacing="-0.4"
            >
                VISA
            </text>
        </svg>
    )
}

function MastercardLogo() {
    return (
        <svg viewBox="0 0 32 20" className="h-5 w-8" aria-label="Mastercard">
            <circle cx="12" cy="10" r="7.5" fill="#EB001B" />
            <circle cx="20" cy="10" r="7.5" fill="#F79E1B" />
            <path
                d="M16 4.6a7.5 7.5 0 0 1 0 10.8 7.5 7.5 0 0 1 0-10.8Z"
                fill="#FF5F00"
            />
        </svg>
    )
}

function UpiLogo() {
    return (
        <svg viewBox="0 0 48 16" className="h-4 w-[42px]" aria-label="UPI">
            <text
                x="0"
                y="12.5"
                fill="#097939"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="800"
                fontSize="12"
                letterSpacing="0.6"
            >
                UPI
            </text>
            <rect x="36.2" y="3" width="2.2" height="10" rx="0.4" fill="#097939" />
            <rect x="39.4" y="3" width="2.2" height="10" rx="0.4" fill="#ED752E" />
            <rect x="42.6" y="3" width="2.2" height="10" rx="0.4" fill="#F7C948" />
        </svg>
    )
}

const paymentLogos = [
    { name: 'Visa', Logo: VisaLogo },
    { name: 'Mastercard', Logo: MastercardLogo },
    { name: 'UPI', Logo: UpiLogo },
]

const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200">
            <div className="bg-white">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-8 lg:py-10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
                            <div>
                                <Link href="/" className="inline-flex items-center hover:opacity-90 transition-opacity">
                                    <Image
                                        src={assets.logo}
                                        alt="LeafyLand"
                                        width={150}
                                        height={38}
                                        className="h-9 w-auto object-contain"
                                    />
                                </Link>
                                <p className="mt-5 max-w-[280px] text-sm leading-relaxed" style={{ color: BRAND.muted }}>
                                    LeafyLand is your trusted marketplace for plants, gardening, properties, services, and more — everything you need to buy, sell, book, or hire, all in one place.
                                </p>
                                <div className="flex items-center gap-2 mt-5">
                                    {socialLinks.map((item) => (
                                        <Link
                                            key={item.label}
                                            href={item.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={item.label}
                                            className={`flex items-center justify-center w-10 h-10 ${brandRadiusClass} border border-gray-200 bg-white hover:bg-[#eef4ef] transition-colors`}
                                            style={{ color: BRAND.green }}
                                        >
                                            <item.icon size={16} strokeWidth={1.75} />
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <SectionTitle>Marketplace</SectionTitle>
                                <ul className="space-y-3">
                                    {marketplaceLinks.map((link) => (
                                        <FooterLink key={link.text} href={link.path} icon={link.icon}>
                                            {link.text}
                                        </FooterLink>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <SectionTitle>Company</SectionTitle>
                                <ul className="space-y-3">
                                    {companyLinks.map((link) => (
                                        <FooterLink key={link.text} href={link.path} icon={link.icon}>
                                            {link.text}
                                        </FooterLink>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <SectionTitle>Contact Us</SectionTitle>
                                <ul className="space-y-3">
                                    <FooterLink href="tel:+919867909355" icon={Phone}>
                                        +91 98679 09355
                                    </FooterLink>
                                    <FooterLink href="mailto:hello@leafyland.com" icon={Mail}>
                                        hello@leafyland.com
                                    </FooterLink>
                                    <FooterLink href="/contact" icon={MapPin}>
                                        Worli, Mumbai 400030
                                    </FooterLink>
                                </ul>
                                <Link
                                    href="/contact"
                                    className={`mt-5 flex items-start gap-3 p-4 ${brandRadiusClass} transition-colors hover:opacity-95`}
                                    style={{ backgroundColor: BRAND.bottomBg }}
                                >
                                    <span
                                        className={`flex items-center justify-center w-9 h-9 ${brandRadiusClass} bg-white shrink-0`}
                                        style={{ color: BRAND.green }}
                                    >
                                        <Headphones size={16} strokeWidth={1.75} />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold" style={{ color: BRAND.text }}>
                                            Need Help?
                                        </span>
                                        <span className="block text-xs mt-0.5" style={{ color: BRAND.muted }}>
                                            We&apos;re here for you!
                                        </span>
                                        <span
                                            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold"
                                            style={{ color: BRAND.green }}
                                        >
                                            Contact Support
                                            <ArrowRight size={12} />
                                        </span>
                                    </span>
                                </Link>
                            </div>
                        </div>

                        <div
                            className={`mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px ${brandRadiusClass} overflow-hidden`}
                            style={{ backgroundColor: '#e5ebe6' }}
                        >
                            {trustItems.map((item) => (
                                <div
                                    key={item.title}
                                    className="flex items-center gap-3 px-5 py-4"
                                    style={{ backgroundColor: BRAND.bottomBg }}
                                >
                                    <span
                                        className="flex items-center justify-center w-10 h-10 rounded-full border shrink-0"
                                        style={{ color: BRAND.green, borderColor: '#c5d6c9', backgroundColor: 'white' }}
                                    >
                                        <item.icon size={18} strokeWidth={1.75} />
                                    </span>
                                    <span>
                                        <span className="block text-sm font-semibold" style={{ color: BRAND.text }}>
                                            {item.title}
                                        </span>
                                        <span className="block text-xs mt-0.5 leading-snug" style={{ color: BRAND.muted }}>
                                            {item.text}
                                        </span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="border-t border-gray-200 px-5 py-4 sm:px-8 lg:px-10"
                        style={{ backgroundColor: BRAND.bottomBg }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 text-xs" style={{ color: BRAND.muted }}>
                            <p className="md:flex-1">© 2026 LeafyLand. All rights reserved.</p>
                            <div className="flex flex-wrap items-center gap-2">
                                <span>We accept:</span>
                                {paymentLogos.map(({ name, Logo }) => (
                                    <span
                                        key={name}
                                        title={name}
                                        className={`inline-flex items-center justify-center h-7 px-2.5 bg-white border border-gray-200 ${brandRadiusClass}`}
                                    >
                                        <Logo />
                                    </span>
                                ))}
                            </div>
                            <p className="md:ml-auto inline-flex items-center gap-1.5 font-medium" style={{ color: BRAND.green }}>
                                <Leaf size={13} strokeWidth={2} />
                                Go Green. Choose LeafyLand.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
