'use client'
import { useEffect, useState } from 'react'
import Carousel from "@/components/Carousel";
import ExploreCategories from "@/components/ExploreCategories";
import FeaturedSection from "@/components/FeaturedSection";
import ProductCard from "@/components/ProductCard";
import PropertyCard from "@/components/PropertyCard";
import { cachedJson, peekCachedJson } from '@/lib/cachedJson'
import { isMarketplaceCategory } from '@/lib/categories'
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import ServiceCategoryCard from "@/components/ServiceCategoryCard";
import { ProductGridSkeleton } from "@/components/CatalogSkeleton";

function asList(value) {
    return Array.isArray(value) ? value : []
}

export default function Home() {
    const [products, setProducts] = useState(() => asList(peekCachedJson('/api/products')))
    const [services, setServices] = useState(() => asList(peekCachedJson('/api/services')))
    const [properties, setProperties] = useState(() => asList(peekCachedJson('/api/properties')))
    const [catalogReady, setCatalogReady] = useState(() => peekCachedJson('/api/products') !== undefined)

    useEffect(() => {
        let cancelled = false
        cachedJson('/api/products').then((p) => {
            if (cancelled) return
            if (Array.isArray(p)) setProducts(p)
            setCatalogReady(true)
        }).catch(() => { if (!cancelled) setCatalogReady(true) })
        cachedJson('/api/services').then((s) => { if (!cancelled && Array.isArray(s)) setServices(s) }).catch(() => {})
        cachedJson('/api/properties').then((pr) => { if (!cancelled && Array.isArray(pr)) setProperties(pr) }).catch(() => {})
        return () => { cancelled = true }
    }, [])

    // LeafyLand core items (prioritized)
    const leafyProducts = products.filter(p => !isMarketplaceCategory(p.category))
    const leafyProperties = properties.filter(p => !p.marketplace)
    const leafyServices = services.filter(s => !s.marketplace)

    // General marketplace items
    const marketplaceProducts = products.filter(p => isMarketplaceCategory(p.category))
    const marketplaceProperties = properties.filter(p => p.marketplace)
    const marketplaceServices = services.filter(s => s.marketplace)

    const featuredProducts = leafyProducts.filter(p => p.featured).slice(0, 10)
    const allProducts = leafyProducts.slice(0, 10)
    const featuredProperties = leafyProperties.filter(p => p.featured).slice(0, 6)
    const dailyServices = leafyServices.filter(s => s.category === 'Daily Needs Services').slice(0, 6)
    const homeServices = leafyServices.filter(s => s.category === 'Home Services').slice(0, 6)

    // Marketplace sections
    const electronicsProducts = marketplaceProducts.filter(p => p.category === 'Electronics').slice(0, 6)
    const mobileProducts = marketplaceProducts.filter(p => p.category === 'Mobile Phones').slice(0, 6)
    const laptopProducts = marketplaceProducts.filter(p => p.category === 'Laptops').slice(0, 6)
    const fashionProducts = marketplaceProducts.filter(p => p.category === 'Fashion').slice(0, 6)
    const homeKitchenProducts = marketplaceProducts.filter(p => p.category === 'Home & Kitchen').slice(0, 6)
    const sportsProducts = marketplaceProducts.filter(p => p.category === 'Sports & Outdoors').slice(0, 6)
    const booksProducts = marketplaceProducts.filter(p => p.category === 'Books & Stationery').slice(0, 6)
    const toysProducts = marketplaceProducts.filter(p => p.category === 'Toys & Games').slice(0, 6)
    const beautyProducts = marketplaceProducts.filter(p => p.category === 'Beauty & Personal Care').slice(0, 6)

    const bigPlants = products.filter(p => p.category === 'Big Plant').slice(0, 8)
    const indoorGreenary = products.filter(p => p.category === 'Indoor Greenary').slice(0, 8)
    const fruitPlants = products.filter(p => p.category === 'Fruit Plant').slice(0, 8)
    const gardening = products.filter(p => p.category === 'Gardening').slice(0, 8)
    const planters = products.filter(p => p.category === 'Planters').slice(0, 8)
    const plants = products.filter(p => p.category === 'Plants').slice(0, 8)
    const seeds = products.filter(p => p.category === 'Seeds').slice(0, 8)
    const soilFertilizers = products.filter(p => p.category === 'Soil & Fertilizers').slice(0, 8)
    const bulbs = products.filter(p => p.category === 'Bulbs').slice(0, 8)

    return (
        <div className="bg-slate-50/50 flex-1 flex flex-col">
            {/* Carousel */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2 w-full">
                <Carousel />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 w-full">
                <ExploreCategories />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full flex-1">
                {!catalogReady && products.length === 0 && (
                    <div className="py-5">
                        <div className="h-5 w-36 bg-slate-100 rounded mb-3 animate-pulse" />
                        <ProductGridSkeleton count={5} />
                    </div>
                )}
                {catalogReady && (featuredProducts.length > 0 || allProducts.length > 0) && (
                <FeaturedSection
                    title="Popular Plants"
                    items={featuredProducts.length > 0 ? featuredProducts : allProducts}
                    viewAllLink="/products"
                    renderItem={(product) => <ProductCard product={product} />}
                />
                )}

                {/* Indoor Greenary */}
                {indoorGreenary.length > 0 && (
                    <FeaturedSection
                        title="Indoor Greenary"
                        items={indoorGreenary}
                        viewAllLink="/products?category=Indoor%20Greenary"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Big Plant */}
                {bigPlants.length > 0 && (
                    <FeaturedSection
                        title="Big Plants"
                        items={bigPlants}
                        viewAllLink="/products?category=Big+Plant"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Plants (Outdoor) */}
                {plants.length > 0 && (
                    <FeaturedSection
                        title="Outdoor Plants"
                        items={plants}
                        viewAllLink="/products?category=Plants"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Fruit Plant */}
                {fruitPlants.length > 0 && (
                    <FeaturedSection
                        title="Fruit Plants"
                        items={fruitPlants}
                        viewAllLink="/products?category=Fruit+Plant"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Bulbs */}
                {bulbs.length > 0 && (
                    <FeaturedSection
                        title="Bulbs"
                        items={bulbs}
                        viewAllLink="/products?category=Bulbs"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Seeds */}
                {seeds.length > 0 && (
                    <FeaturedSection
                        title="Seeds"
                        items={seeds}
                        viewAllLink="/products?category=Seeds"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Daily Needs Services */}
                {dailyServices.length > 0 && (
                    <section className="py-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800">Daily Needs Services</h2>
                                <p className="text-xs text-slate-500 mt-0.5">On-demand green & home services at your doorstep</p>
                            </div>
                            <Link href="/services" className="text-emerald-600 text-xs font-semibold hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
                                See All <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {dailyServices.map(service => (
                                <ServiceCategoryCard key={service.id} service={service} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Home Services */}
                {homeServices.length > 0 && (
                    <section className="py-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h2 className="text-base sm:text-lg font-bold text-slate-800">Home Services</h2>
                                <p className="text-xs text-slate-500 mt-0.5">Professional home maintenance and repair</p>
                            </div>
                            <Link href="/services" className="text-emerald-600 text-xs font-semibold hover:text-emerald-700 flex items-center gap-0.5 transition-colors">
                                See All <ChevronRight size={14} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {homeServices.map(service => (
                                <ServiceCategoryCard key={service.id} service={service} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Planters */}
                {planters.length > 0 && (
                    <FeaturedSection
                        title="Planters"
                        items={planters}
                        viewAllLink="/products?category=Planters"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Soil & Fertilizers */}
                {soilFertilizers.length > 0 && (
                    <FeaturedSection
                        title="Soil & Fertilizers"
                        items={soilFertilizers}
                        viewAllLink="/products?category=Soil+%26+Fertilizers"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Gardening Tools */}
                {gardening.length > 0 && (
                    <FeaturedSection
                        title="Gardening Tools"
                        items={gardening}
                        viewAllLink="/products?category=Gardening"
                        renderItem={(product) => <ProductCard product={product} />}
                    />
                )}

                {/* Farmhouses & Land */}
                {featuredProperties.length > 0 && (
                    <FeaturedSection
                        title="Farmhouses & Land"
                        items={featuredProperties}
                        viewAllLink="/properties"
                        renderItem={(property) => <PropertyCard property={property} />}
                    />
                )}

                {/* ═══ MARKETPLACE SECTIONS ═══ */}
                {(marketplaceProducts.length > 0 || marketplaceProperties.length > 0) && (
                <>
                        {/* Divider */}
                        <div className="flex items-center gap-4 my-6">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Marketplace</span>
                            <div className="flex-1 h-px bg-slate-200" />
                        </div>

                        {/* Electronics */}
                        {electronicsProducts.length > 0 && (
                            <FeaturedSection
                                title="Electronics"
                                items={electronicsProducts}
                                viewAllLink="/products?category=Electronics"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Mobile Phones */}
                        {mobileProducts.length > 0 && (
                            <FeaturedSection
                                title="Mobile Phones"
                                items={mobileProducts}
                                viewAllLink="/products?category=Mobile+Phones"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Laptops */}
                        {laptopProducts.length > 0 && (
                            <FeaturedSection
                                title="Laptops"
                                items={laptopProducts}
                                viewAllLink="/products?category=Laptops"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Fashion */}
                        {fashionProducts.length > 0 && (
                            <FeaturedSection
                                title="Fashion"
                                items={fashionProducts}
                                viewAllLink="/products?category=Fashion"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Home & Kitchen */}
                        {homeKitchenProducts.length > 0 && (
                            <FeaturedSection
                                title="Home & Kitchen"
                                items={homeKitchenProducts}
                                viewAllLink="/products?category=Home+%26+Kitchen"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Sports & Outdoors */}
                        {sportsProducts.length > 0 && (
                            <FeaturedSection
                                title="Sports & Outdoors"
                                items={sportsProducts}
                                viewAllLink="/products?category=Sports+%26+Outdoors"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Books & Stationery */}
                        {booksProducts.length > 0 && (
                            <FeaturedSection
                                title="Books & Stationery"
                                items={booksProducts}
                                viewAllLink="/products?category=Books+%26+Stationery"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Toys & Games */}
                        {toysProducts.length > 0 && (
                            <FeaturedSection
                                title="Toys & Games"
                                items={toysProducts}
                                viewAllLink="/products?category=Toys+%26+Games"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Beauty & Personal Care */}
                        {beautyProducts.length > 0 && (
                            <FeaturedSection
                                title="Beauty & Personal Care"
                                items={beautyProducts}
                                viewAllLink="/products?category=Beauty+%26+Personal+Care"
                                renderItem={(product) => <ProductCard product={product} />}
                            />
                        )}

                        {/* Properties — General */}
                        {marketplaceProperties.length > 0 && (
                            <FeaturedSection
                                title="Properties"
                                items={marketplaceProperties}
                                viewAllLink="/properties"
                                renderItem={(property) => <PropertyCard property={property} />}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
