'use client'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const ScheduleVisitModal = ({ property, setShowVisitModal }) => {
    const { data: session } = useSession()
    const router = useRouter()
    const [visit, setVisit] = useState({
        name: session?.user?.name || '',
        phone: '',
        date: '',
        time: '',
        notes: '',
    })

    const handleChange = (e) => {
        setVisit({ ...visit, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!session?.user) {
            toast.error('Please sign in to schedule a visit')
            router.push(`/login?callbackUrl=/properties/${property.id}`)
            return
        }
        try {
            const res = await fetch('/api/visits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property.id,
                    name: visit.name,
                    phone: visit.phone,
                    date: visit.date,
                    time: visit.time,
                    notes: visit.notes,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Visit request failed')
            toast.success('Visit requested')
            setShowVisitModal(false)
        } catch (err) {
            toast.error(err.message)
            throw err
        }
    }

    return (
        <form
            onSubmit={(e) => toast.promise(handleSubmit(e), { loading: 'Requesting visit...' })}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm h-screen flex items-center justify-center p-4"
        >
            <div className="relative bg-white p-6 md:p-8 rounded-xl shadow-2xl flex flex-col gap-5 text-slate-700 w-full max-w-md">
                <XIcon size={24} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => setShowVisitModal(false)} />
                <h2 className="text-2xl pr-6">
                    Schedule a visit to <span className="font-semibold">{property.title}</span>
                </h2>
                <input name="name" onChange={handleChange} value={visit.name} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Your name" required />
                <input name="phone" onChange={handleChange} value={visit.phone} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Phone number" required />
                <div className="flex flex-col sm:flex-row gap-4">
                    <input name="date" onChange={handleChange} value={visit.date} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="date" required />
                    <input name="time" onChange={handleChange} value={visit.time} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="time" required />
                </div>
                <textarea name="notes" onChange={handleChange} value={visit.notes} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" rows={3} placeholder="Any notes for the seller (optional)" />
                <button className="bg-emerald-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-emerald-950 active:scale-95 transition-all mt-2">
                    REQUEST VISIT
                </button>
            </div>
        </form>
    )
}

export default ScheduleVisitModal
