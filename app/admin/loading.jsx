export default function AdminLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="h-3 w-16 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-100" />
                <div className="h-4 w-72 animate-pulse rounded-xl bg-slate-100" />
            </div>
            <div className="h-72 animate-pulse rounded-xl border border-slate-100 bg-white shadow-sm" />
        </div>
    )
}
