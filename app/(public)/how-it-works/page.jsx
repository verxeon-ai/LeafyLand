import { Search, ShoppingCart, Truck, UserPlus, FileText, Star, Home, Phone } from 'lucide-react'
import Link from 'next/link'

const HowItWorksPage = () => {
    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
            <div className="text-center mb-12">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">How It Works</h1>
                <p className="text-slate-500 mt-2 text-sm">Three simple ways to use LeafyLand</p>
            </div>

            {/* For Buyers */}
            <section className="mb-12">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <ShoppingCart size={16} className="text-emerald-600" />
                    </div>
                    For Buyers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Search, title: "Browse & Search", desc: "Find plants, tools, services, or properties using our smart search and filters." },
                        { icon: ShoppingCart, title: "Add to Cart or Inquire", desc: "Add products to your cart, or request quotes for services and properties." },
                        { icon: Truck, title: "Get Delivered or Connected", desc: "Products ship to your door. For services and properties, we connect you directly." },
                    ].map((step, i) => (
                        <div key={i} className="relative p-5 bg-white border border-slate-100 rounded-2xl">
                            <span className="absolute -top-3 -left-1 w-7 h-7 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                            <step.icon size={20} className="text-emerald-600 mb-2" />
                            <h3 className="font-semibold text-slate-800 text-sm">{step.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4">
                    <Link href="/products" className="text-sm font-semibold text-emerald-600 hover:underline">Start Shopping →</Link>
                </div>
            </section>

            {/* For Vendors */}
            <section className="mb-12">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <UserPlus size={16} className="text-[#2f7d4a]" />
                    </div>
                    For Vendors & Service Providers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: UserPlus, title: "Apply to Sell", desc: "Sign up and submit your vendor application. We review every seller." },
                        { icon: FileText, title: "List Your Products", desc: "Add your plants, tools, or services with images, pricing, and descriptions." },
                        { icon: Star, title: "Get Orders & Grow", desc: "Manage orders, build your reputation with reviews, and grow your business." },
                    ].map((step, i) => (
                        <div key={i} className="relative p-5 bg-white border border-slate-100 rounded-2xl">
                            <span className="absolute -top-3 -left-1 w-7 h-7 bg-[#2f7d4a] text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                            <step.icon size={20} className="text-[#2f7d4a] mb-2" />
                            <h3 className="font-semibold text-slate-800 text-sm">{step.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4">
                    <Link href="/become-seller" className="text-sm font-semibold text-[#2f7d4a] hover:underline">Become a Seller →</Link>
                </div>
            </section>

            {/* For Property Listers */}
            <section className="mb-12">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <Home size={16} className="text-[#2f7d4a]" />
                    </div>
                    For Property Listers
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                        { icon: Home, title: "List Your Property", desc: "Add farmland, farmhouses, or land with photos, location, and details." },
                        { icon: Phone, title: "Get Inquiries", desc: "Interested buyers can contact you directly through the platform." },
                        { icon: Star, title: "Close the Deal", desc: "Meet, negotiate, and complete the transaction offline at your pace." },
                    ].map((step, i) => (
                        <div key={i} className="relative p-5 bg-white border border-slate-100 rounded-2xl">
                            <span className="absolute -top-3 -left-1 w-7 h-7 bg-[#2f7d4a] text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                            <step.icon size={20} className="text-[#2f7d4a] mb-2" />
                            <h3 className="font-semibold text-slate-800 text-sm">{step.title}</h3>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
                <div className="text-center mt-4">
                    <Link href="/properties" className="text-sm font-semibold text-[#2f7d4a] hover:underline">Browse Properties →</Link>
                </div>
            </section>
        </div>
    )
}

export default HowItWorksPage
