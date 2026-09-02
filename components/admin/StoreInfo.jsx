'use client'
import Image from "next/image"
import { MapPin, Mail, Phone } from "lucide-react"
import StatusBadge from "./StatusBadge"
import { brandCardClass } from "@/lib/brand-ui"

const StoreInfo = ({ store }) => {
    return (
        <div className={`${brandCardClass} flex-1 space-y-3 p-5 text-sm`}>
            <Image width={100} height={100} src={store.logo} alt={store.name} className="max-h-20 max-w-20 rounded-full object-contain shadow-sm max-sm:mx-auto" />
            <div className="flex flex-col items-center gap-3 sm:flex-row">
                <h3 className="text-xl font-semibold text-slate-800"> {store.name} </h3>
                <span className="text-sm text-slate-500">@{store.username}</span>
                <StatusBadge status={store.status} />
            </div>

            <p className="my-5 max-w-2xl text-slate-600">{store.description}</p>
            <p className="flex items-center gap-2 text-slate-700"> <MapPin size={16} /> {store.address}</p>
            <p className="flex items-center gap-2 text-slate-700"><Phone size={16} /> {store.contact}</p>
            <p className="flex items-center gap-2 text-slate-700"><Mail size={16} />  {store.email}</p>
            <p className="mt-5 text-slate-700">Applied on <span className="text-xs text-slate-500">{new Date(store.createdAt).toLocaleDateString()}</span> by</p>
            <div className="flex items-center gap-2 text-sm">
                <Image width={36} height={36} src={store.user.image} alt={store.user.name} className="h-9 w-9 rounded-full" />
                <div>
                    <p className="font-medium text-slate-600">{store.user.name}</p>
                    <p className="text-slate-400">{store.user.email}</p>
                </div>
            </div>
        </div>
    )
}

export default StoreInfo
