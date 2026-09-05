/** Solid beauty glyph: lipstick, compact, lotion pump + sparkles (uses currentColor) */
export default function BeautyCareIcon({ size = 22, className = '', ...props }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="2 4 20 16.5"
            fill="currentColor"
            className={className}
            aria-hidden
            {...props}
        >
            {/* lipstick tip */}
            <path d="M5 8.6 6.7 6.5a.8.8 0 0 1 1.25 0L9.2 7.8V9.7H5V8.6Z" />
            {/* lipstick tube */}
            <rect x="5" y="9.7" width="4.2" height="2.4" rx="0.55" />
            <rect x="5.2" y="12.3" width="3.8" height="1.15" rx="0.35" />
            {/* small jar */}
            <rect x="9.45" y="11.15" width="3.2" height="5.5" rx="1" />
            {/* lotion bottle with label cutout */}
            <path
                fillRule="evenodd"
                d="M13.1 9.75h6.1a1.15 1.15 0 0 1 1.15 1.15v6.8a1.15 1.15 0 0 1-1.15 1.15h-6.1a1.15 1.15 0 0 1-1.15-1.15v-6.8a1.15 1.15 0 0 1 1.15-1.15Zm1.45 2.55h3.2a.35.35 0 0 1 .35.35v3.05a.35.35 0 0 1-.35.35h-3.2a.35.35 0 0 1-.35-.35v-3.05a.35.35 0 0 1 .35-.35Z"
            />
            {/* pump */}
            <rect x="15.65" y="8.2" width="1" height="1.6" rx="0.2" />
            <rect x="14.35" y="7.4" width="3.6" height="1" rx="0.4" />
            <rect x="13.25" y="7.2" width="1.35" height="0.7" rx="0.3" />
            {/* sparkles */}
            <path d="M3.35 7.55 3.7 8.45 4.6 8.8 3.7 9.15 3.35 10.05 3 9.15 2.1 8.8 3 8.45Z" />
            <path d="M11.2 6.9 11.45 7.55 12.1 7.8 11.45 8.05 11.2 8.7 10.95 8.05 10.3 7.8 10.95 7.55Z" />
            <path d="M20.75 10.6 21.1 11.45 21.95 11.8 21.1 12.15 20.75 13 20.4 12.15 19.55 11.8 20.4 11.45Z" />
            {/* plus accents */}
            <path d="M8.6 6.75v1.5M7.85 7.5h1.5" fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" />
            <path d="M12.4 9.2v1.15M11.8 9.75h1.2" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <path d="M20.4 14.4v1.4M19.7 15.1h1.4" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
        </svg>
    )
}
