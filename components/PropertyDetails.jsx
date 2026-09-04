'use client'
import { MapPinIcon, RulerIcon, BedDoubleIcon, BathIcon, CalendarIcon, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import ScheduleVisitModal from './ScheduleVisitModal'
import toast from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

const PropertyDetails = ({ property }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '₹'
    const [mainImage, setMainImage] = useState(property.images?.[0])
    const [showVisitModal, setShowVisitModal] = useState(false)
    const [showContact, setShowContact] = useState(false)
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)
    const { data: session } = useSession()
    const router = useRouter()

    const sendMessage = async (e) => {
        e.preventDefault()
        if (!session?.user) {
            toast.error('Please sign in')
            router.push(`/login?callbackUrl=/properties/${property.id}`)
            return
        }
        if (!property.storeId) {
            toast.error('Seller unavailable')
            return
        }
        setSending(true)
        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId: property.storeId, body: message.trim() }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Could not send')
            toast.success('Message sent to seller')
            setMessage('')
            setShowContact(false)
        } catch (err) {
            toast.error(err.message)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="flex max-lg:flex-col gap-8 lg:gap-12 min-w-0">
            <div className="flex max-sm:flex-col-reverse gap-3 min-w-0 w-full lg:w-auto">
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible no-scrollbar">
                    {(property.images || []).map((image, index) => (
                        <div
                            key={index}
                            onClick={() => setMainImage(image)}
                            className="bg-slate-100 flex items-center justify-center size-16 sm:size-20 rounded-lg group cursor-pointer overflow-hidden shrink-0"
                        >
                            <Image src={image} className="w-full h-full object-cover group-hover:scale-105 transition" alt="" width={100} height={100} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center w-full aspect-square max-h-72 sm:max-h-96 sm:max-w-md bg-slate-100 rounded-lg overflow-hidden">
                    {mainImage && (
                        <Image src={mainImage} alt="" width={500} height={500} className="w-full h-full object-cover" />
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{property.title}</h1>
                <p className="flex items-center gap-1.5 text-slate-500 mt-2">
                    <MapPinIcon size={16} /> {property.location}
                </p>

                <p className="text-2xl font-semibold text-slate-800 my-6">
                    {currency}
                    {property.price.toLocaleString()}
                    {property.listingType === 'RENT' && (
                        <span className="text-base font-normal text-slate-500"> / month</span>
                    )}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm text-slate-600 py-4 border-y border-slate-200">
                    <div className="flex items-center gap-2">
                        <RulerIcon size={16} className="text-slate-400" />
                        <span>{property.landSize}</span>
                    </div>
                    {property.bedrooms != null && (
                        <div className="flex items-center gap-2">
                            <BedDoubleIcon size={16} className="text-slate-400" />
                            <span>{property.bedrooms} Beds</span>
                        </div>
                    )}
                    {property.bathrooms != null && (
                        <div className="flex items-center gap-2">
                            <BathIcon size={16} className="text-slate-400" />
                            <span>{property.bathrooms} Baths</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">{property.propertyType}</span>
                    </div>
                </div>

                <p className="text-slate-600 mt-6 max-w-xl">{property.description}</p>

                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <button
                        onClick={() => setShowVisitModal(true)}
                        className="flex items-center justify-center gap-2 bg-emerald-900 text-white px-6 sm:px-8 py-3 text-sm font-medium rounded-xl hover:bg-emerald-950 active:scale-95 transition"
                    >
                        <CalendarIcon size={16} /> Schedule Visit
                    </button>
                    <button
                        onClick={() => setShowContact(true)}
                        className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 px-6 sm:px-8 py-3 text-sm font-medium rounded-xl hover:bg-slate-50 active:scale-95 transition"
                    >
                        <MessageSquare size={16} /> Contact Seller
                    </button>
                </div>
            </div>

            {showVisitModal && <ScheduleVisitModal property={property} setShowVisitModal={setShowVisitModal} />}

            {showContact && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setShowContact(false)} />
                    <form onSubmit={sendMessage} className="relative bg-white rounded-2xl p-6 w-full max-w-md mx-4 space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800">Message seller</h3>
                        <textarea
                            required
                            rows={4}
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Ask about availability, price, or visit details…"
                            className="w-full border border-slate-200 rounded-xl p-3 text-sm outline-none focus:border-emerald-500"
                        />
                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={() => setShowContact(false)} className="px-4 py-2 text-sm rounded-xl bg-slate-100">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={sending}
                                className="px-4 py-2 text-sm rounded-xl bg-emerald-700 text-white disabled:opacity-60"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default PropertyDetails
