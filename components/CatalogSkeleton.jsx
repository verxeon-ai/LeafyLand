export function ProductGridSkeleton({ count = 10 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="rounded-xl border border-slate-100 bg-white overflow-hidden animate-pulse">
                    <div className="aspect-square bg-slate-100" />
                    <div className="p-2.5 space-y-2">
                        <div className="h-4 w-16 bg-slate-100 rounded" />
                        <div className="h-3 w-full bg-slate-100 rounded" />
                        <div className="h-3 w-2/3 bg-slate-100 rounded" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function PropertyGridSkeleton({ count = 4 }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="aspect-[4/3] rounded-2xl bg-slate-100" />
                    <div className="pt-2 space-y-2">
                        <div className="h-4 w-3/4 bg-slate-100 rounded" />
                        <div className="h-3 w-1/2 bg-slate-100 rounded" />
                    </div>
                </div>
            ))}
        </div>
    )
}

export function ServiceGridSkeleton({ count = 8 }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="rounded-2xl bg-[#f4f8f5] border border-[#e4eee6] px-3 pt-5 pb-4 animate-pulse">
                    <div className="mx-auto h-[72px] w-[72px] rounded-full bg-white" />
                    <div className="mt-3 h-3 w-3/4 mx-auto bg-slate-200/70 rounded" />
                    <div className="mt-2 h-3 w-1/2 mx-auto bg-slate-200/70 rounded" />
                </div>
            ))}
        </div>
    )
}

export function DetailSkeleton() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-pulse">
            <div className="h-4 w-40 bg-slate-100 rounded mb-6" />
            <div className="flex max-lg:flex-col gap-8 lg:gap-12">
                <div className="lg:w-1/2 aspect-[4/3] rounded-2xl bg-slate-100" />
                <div className="flex-1 space-y-3">
                    <div className="h-6 w-2/3 bg-slate-100 rounded" />
                    <div className="h-4 w-1/2 bg-slate-100 rounded" />
                    <div className="h-8 w-32 bg-slate-100 rounded mt-6" />
                    <div className="h-10 w-full max-w-xs bg-slate-100 rounded mt-4" />
                </div>
            </div>
        </div>
    )
}
