'use client'
import { XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const BookServiceModal = ({ service, setShowBookModal }) => {
    const { data: session } = useSession()
    const router = useRouter()
    const [booking, setBooking] = useState({
        name: session?.user?.name || '',
        phone: '',
        date: '',
        time: '',
        location: '',
        requirements: '',
    })
    const [submitting, setSubmitting] = useState(false)

    const handleChange = (e) => {
        setBooking({ ...booking, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!session?.user) {
            toast.error('Please sign in to book')
            router.push(`/login?callbackUrl=/services/${service.id}`)
            return
        }
        setSubmitting(true)
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceId: service.id,
                    date: booking.date,
                    time: booking.time,
                    location: booking.location,
                    requirements: booking.requirements,
                    name: booking.name,
                    phone: booking.phone,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Booking failed')
            toast.success('Booking requested')
            setShowBookModal(false)
        } catch (err) {
            toast.error(err.message)
            throw err
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form
            onSubmit={(e) => toast.promise(handleSubmit(e), { loading: 'Sending booking request...' })}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm h-screen flex items-center justify-center p-4"
        >
            <div className="relative bg-white p-6 md:p-8 rounded-xl shadow-2xl flex flex-col gap-5 text-slate-700 w-full max-w-md">
                <XIcon size={24} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer" onClick={() => setShowBookModal(false)} />
                <h2 className="text-2xl pr-6">
                    Book <span className="font-semibold">{service.name}</span>
                </h2>
                <input name="name" onChange={handleChange} value={booking.name} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Your name" required />
                <input name="phone" onChange={handleChange} value={booking.phone} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Phone number" required />
                <div className="flex flex-col sm:flex-row gap-4">
                    <input name="date" onChange={handleChange} value={booking.date} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="date" required />
                    <input name="time" onChange={handleChange} value={booking.time} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="time" required />
                </div>
                <input name="location" onChange={handleChange} value={booking.location} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" type="text" placeholder="Service location / address" required />
                <textarea name="requirements" onChange={handleChange} value={booking.requirements} className="p-2 px-4 outline-none border border-slate-200 rounded w-full" rows={3} placeholder="Describe what you need (optional)" />
                <button disabled={submitting} className="bg-emerald-900 text-white text-sm font-medium py-2.5 rounded-md hover:bg-emerald-950 active:scale-95 transition-all disabled:opacity-60 mt-2">
                    REQUEST BOOKING
                </button>
            </div>
        </form>
    )
}

export default BookServiceModal
