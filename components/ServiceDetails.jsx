'use client'
import { StarIcon, MapPinIcon, ClockIcon } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import BookServiceModal from "./BookServiceModal"

const ServiceDetails = ({ service }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$'
    const [mainImage, setMainImage] = useState(service.images[0])
    const [showBookModal, setShowBookModal] = useState(false)

    const averageRating = service.rating?.length
        ? service.rating.reduce((acc, item) => acc + item.rating, 0) / service.rating.length
        : 0

    return (
        <div className="flex max-lg:flex-col gap-8 lg:gap-12 min-w-0">
            <div className="flex max-sm:flex-col-reverse gap-3 min-w-0 w-full lg:w-auto">
                <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-visible no-scrollbar">
                    {service.images.map((image, index) => (
                        <div key={index} onClick={() => setMainImage(image)} className="bg-slate-100 flex items-center justify-center size-16 sm:size-20 rounded-lg group cursor-pointer overflow-hidden shrink-0">
                            <Image src={image} className="w-full h-full object-cover group-hover:scale-105 transition" alt="" width={100} height={100} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center w-full aspect-square max-h-72 sm:max-h-96 sm:max-w-md bg-slate-100 rounded-lg overflow-hidden">
                    <Image src={mainImage} alt="" width={500} height={500} className="w-full h-full object-cover" />
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">{service.name}</h1>
                <p className="flex items-center gap-1.5 text-slate-500 mt-2">
                    <MapPinIcon size={16} /> {service.location}
                </p>

                <div className='flex items-center mt-3'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{service.rating?.length || 0} Reviews</p>
                </div>

                <p className="text-2xl font-semibold text-slate-800 my-6">
                    From {currency}{service.startingPrice.toLocaleString()}
                </p>

                {/* SCHEMA: assumes service.duration is a display string, e.g. "2-3 hours" */}
                {service.duration && (
                    <p className="flex items-center gap-2 text-slate-500 mb-4">
                        <ClockIcon size={16} /> Typical duration: {service.duration}
                    </p>
                )}

                <p className="text-slate-600 max-w-xl">{service.description}</p>

                <button onClick={() => setShowBookModal(true)} className="w-full sm:w-auto bg-emerald-900 text-white px-8 sm:px-10 py-3 text-sm font-medium rounded-xl hover:bg-emerald-950 active:scale-95 transition mt-8">
                    Book Service
                </button>
            </div>

            {showBookModal && <BookServiceModal service={service} setShowBookModal={setShowBookModal} />}
        </div>
    )
}

export default ServiceDetails