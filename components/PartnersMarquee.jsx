import { BRAND_GREEN, BRAND_MINT } from '@/lib/brand-ui'

function LeafMark({ className = 'w-3.5 h-3.5' }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 21c0-6 4.5-11 11-13-1 7-5.5 12-11 13Z" fill={BRAND_GREEN} />
            <path d="M12 21C12 15 7.5 10 1 8c1 7 5.5 12 11 13Z" fill="#7dae7a" />
        </svg>
    )
}

function LogoOla() {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="relative w-6 h-6 rounded-full bg-black shrink-0">
                <span className="absolute inset-[5px] rounded-full bg-[#f5c518]" />
            </span>
            <span className="text-[15px] font-bold tracking-tight text-slate-900">ola</span>
        </span>
    )
}

function LogoDlf() {
    return (
        <span className="inline-flex items-center gap-1">
            <span className="text-[15px] font-extrabold tracking-tight text-slate-900">DLF</span>
            <svg viewBox="0 0 16 16" className="w-4 h-4" aria-hidden>
                <path d="M8 1.5 14.5 14H1.5L8 1.5Z" fill="#111" />
            </svg>
        </span>
    )
}

function LogoTata() {
    return (
        <span className="flex flex-col items-center leading-none">
            <span className="text-[13px] font-extrabold tracking-[0.18em] text-[#0b5cab]">TATA</span>
            <span className="text-[9px] font-medium text-slate-500 mt-0.5">Tata Group</span>
        </span>
    )
}

function LogoMicrosoft() {
    return (
        <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
                <rect x="1" y="1" width="10" height="10" fill="#f25022" />
                <rect x="13" y="1" width="10" height="10" fill="#7fba00" />
                <rect x="1" y="13" width="10" height="10" fill="#00a4ef" />
                <rect x="13" y="13" width="10" height="10" fill="#ffb900" />
            </svg>
            <span className="text-[13px] font-semibold text-slate-800">Microsoft</span>
        </span>
    )
}

function LogoPepsi() {
    return (
        <span className="inline-flex items-center gap-1.5">
            <svg viewBox="0 0 32 32" className="w-6 h-6" aria-hidden>
                <circle cx="16" cy="16" r="15" fill="#004B93" />
                <path d="M3 18c6-8 20-8 26 0" fill="#E32934" />
                <path d="M4 16c5-3 19-3 24 0" stroke="#fff" strokeWidth="3" fill="none" />
            </svg>
            <span className="text-[13px] font-bold italic text-[#004B93]">pepsi</span>
        </span>
    )
}

function LogoCoke() {
    return (
        <span className="text-[15px] font-bold italic text-[#e31c23] tracking-tight" style={{ fontFamily: 'Georgia, serif' }}>
            Coca-Cola
        </span>
    )
}

const PARTNERS = [
    { id: 'ola', node: <LogoOla /> },
    { id: 'dlf', node: <LogoDlf /> },
    { id: 'copy', node: null },
    { id: 'tata', node: <LogoTata /> },
    { id: 'ms', node: <LogoMicrosoft /> },
    { id: 'pepsi', node: <LogoPepsi /> },
    { id: 'coke', node: <LogoCoke /> },
    { id: 'dlf-2', node: <LogoDlf /> },
]

function LogoCard({ children }) {
    return (
        <span className="inline-flex items-center justify-center h-12 sm:h-[52px] px-4 sm:px-5 rounded-xl bg-white shrink-0 shadow-[0_2px_10px_rgba(15,23,42,0.06)] border border-white">
            {children}
        </span>
    )
}

function WorkedWithCopy() {
    return (
        <span className="flex flex-col items-center justify-center px-2 sm:px-3 shrink-0 text-center leading-tight">
            <span className="inline-flex items-center gap-1.5 text-[13px] sm:text-sm font-semibold" style={{ color: BRAND_GREEN }}>
                LeafyLand has
                <LeafMark />
            </span>
            <span className="text-[13px] sm:text-sm font-semibold" style={{ color: BRAND_GREEN }}>
                already worked with
            </span>
        </span>
    )
}

function Track() {
    return (
        <div className="flex items-center gap-3 sm:gap-3.5 pr-6 sm:pr-8 shrink-0">
            {PARTNERS.map((item) => (
                <span key={item.id} className="flex items-center gap-3 sm:gap-3.5 shrink-0">
                    {item.id === 'copy' ? <WorkedWithCopy /> : <LogoCard>{item.node}</LogoCard>}
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#b7d0bc' }} aria-hidden />
                </span>
            ))}
        </div>
    )
}

function Dots({ className }) {
    return (
        <div className={`grid grid-cols-4 gap-1 opacity-40 ${className}`} aria-hidden>
            {Array.from({ length: 12 }).map((_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-[#9cc89a]" />
            ))}
        </div>
    )
}

function CornerLeaves({ className }) {
    return (
        <svg className={className} viewBox="0 0 64 48" fill="none" aria-hidden>
            <path d="M8 40c8-14 18-16 24-8-8 4-14 10-24 8Z" fill="#7dae7a" opacity=".45" />
            <path d="M22 38c6-12 16-14 22-6-8 3-14 8-22 6Z" fill={BRAND_GREEN} opacity=".35" />
            <path d="M12 28c-2 6 2 12 8 10 1-6-2-10-8-10Z" fill="#9cc89a" opacity=".5" />
        </svg>
    )
}

export default function PartnersMarquee() {
    return (
        <section
            className="relative rounded-xl overflow-hidden min-h-[118px] sm:min-h-[132px] py-3 sm:py-3.5"
            style={{ backgroundColor: BRAND_MINT }}
            aria-label="Trusted by leading brands"
        >
            <Dots className="absolute top-3 left-5" />
            <Dots className="absolute bottom-3 right-8" />
            <CornerLeaves className="absolute -bottom-1 left-2 w-16 h-12 pointer-events-none" />
            <CornerLeaves className="absolute -bottom-2 right-16 w-14 h-10 pointer-events-none scale-x-[-1]" />
            <LeafMark className="absolute bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 opacity-50 pointer-events-none" />

            <p className="relative z-10 flex items-center justify-center gap-2 text-[11px] sm:text-xs font-semibold mb-2.5 sm:mb-3" style={{ color: BRAND_GREEN }}>
                <LeafMark className="w-3.5 h-3.5 rotate-[-20deg]" />
                Trusted by Leading Brands
                <LeafMark className="w-3.5 h-3.5 rotate-[20deg] scale-x-[-1]" />
            </p>

            <div className="relative z-10 overflow-hidden select-none group px-4 sm:px-6">
                <div className="flex w-max animate-[marqueeScroll_32s_linear_infinite] group-hover:[animation-play-state:paused] motion-reduce:animate-none">
                    <Track />
                    <Track />
                </div>
            </div>
        </section>
    )
}
