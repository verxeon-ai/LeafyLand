import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&h=800&q=80&crop=entropy`

async function main() {
    const passwordHash = await bcrypt.hash('LeafyLand123!', 12)

    const verifiedAt = new Date()

    const admin = await prisma.user.upsert({
        where: { email: 'admin@leafyland.com' },
        update: { role: 'ADMIN', passwordHash, emailVerified: verifiedAt },
        create: {
            name: 'LeafyLand Admin',
            email: 'admin@leafyland.com',
            passwordHash,
            role: 'ADMIN',
            emailVerified: verifiedAt,
            image: '',
        },
    })

    const seller = await prisma.user.upsert({
        where: { email: 'seller@leafyland.com' },
        update: { passwordHash, emailVerified: verifiedAt },
        create: {
            name: 'Fresh Roots Owner',
            email: 'seller@leafyland.com',
            passwordHash,
            role: 'BUYER',
            emailVerified: verifiedAt,
            image: '',
        },
    })

    await prisma.user.upsert({
        where: { email: 'buyer@leafyland.com' },
        update: { passwordHash, emailVerified: verifiedAt },
        create: {
            name: 'Priya Sharma',
            email: 'buyer@leafyland.com',
            passwordHash,
            role: 'BUYER',
            emailVerified: verifiedAt,
            image: '',
        },
    })

    const existingStore = await prisma.store.findUnique({ where: { username: 'freshroots' } })
    const existingSettings = existingStore?.settings && typeof existingStore.settings === 'object' && !Array.isArray(existingStore.settings)
        ? existingStore.settings
        : {}

    const store = await prisma.store.upsert({
        where: { username: 'freshroots' },
        update: {
            status: 'approved',
            isActive: true,
            isVerified: true,
            userId: seller.id,
            address: '12 MG Road, Mumbai',
            settings: { ...existingSettings, city: 'Mumbai' },
        },
        create: {
            userId: seller.id,
            name: 'Fresh Roots Nursery',
            username: 'freshroots',
            description: 'Premium nursery for indoor plants, tools, and landscaping.',
            address: '12 MG Road, Mumbai',
            email: 'seller@leafyland.com',
            contact: '+91 98765 43210',
            logo: '/logo.png',
            status: 'approved',
            isActive: true,
            isVerified: true,
            settings: { city: 'Mumbai' },
        },
    })

    const existingProducts = await prisma.product.count({ where: { storeId: store.id } })
    if (existingProducts === 0) {
        await prisma.product.createMany({
            data: [
                { name: 'Areca Palm Giant', description: 'Tall, lush Areca Palm. Height 4-5 feet.', mrp: 2100, price: 1499, category: 'Big Plant', images: [img('1509423350716-97f9360b4e09')], stock: 15, inStock: true, featured: true, storeId: store.id },
                { name: 'Fiddle Leaf Fig', description: 'Statement fiddle leaf fig for living rooms.', mrp: 3200, price: 2499, category: 'Big Plant', images: [img('1545241047-6083a3684587')], stock: 10, inStock: true, featured: true, storeId: store.id },
                { name: 'Money Plant Golden', description: 'Low-maintenance golden money plant.', mrp: 450, price: 299, category: 'Indoor Greenary', images: [img('1485955900006-10f4d324d981')], stock: 40, inStock: true, featured: true, storeId: store.id },
                { name: 'Snake Plant Laurentii', description: 'Air-purifying snake plant.', mrp: 650, price: 449, category: 'Indoor Greenary', images: [img('1593691509543-c55fb32e5cee')], stock: 35, inStock: true, featured: false, storeId: store.id },
                { name: 'Garden Tool Set', description: 'Shovel, rake, trowel, weeder, cultivator.', mrp: 1800, price: 1299, category: 'Gardening', images: [img('1416879595882-3373a0480b5b')], stock: 20, inStock: true, featured: false, storeId: store.id },
                { name: 'Organic Potting Mix 5kg', description: 'Premium organic potting soil.', mrp: 550, price: 399, category: 'Soil & Fertilizers', images: [img('1466692476866-aef1dfb1e735')], stock: 50, inStock: true, featured: false, storeId: store.id },
            ],
        })
    }

    const catalogPhotos = {
        'Areca Palm Giant': [img('1509423350716-97f9360b4e09')],
        'Fiddle Leaf Fig': [img('1545241047-6083a3684587')],
        'Money Plant Golden': [img('1485955900006-10f4d324d981')],
        'Snake Plant Laurentii': [img('1593691509543-c55fb32e5cee')],
        'Garden Tool Set': [img('1416879595882-3373a0480b5b')],
        'Organic Potting Mix 5kg': [img('1466692476866-aef1dfb1e735')],
        'Airpods': [img('1505740420928-5e560c06d30e')],
    }
    for (const [name, images] of Object.entries(catalogPhotos)) {
        await prisma.product.updateMany({ where: { name }, data: { images } })
    }

    const existingServices = await prisma.service.count({ where: { storeId: store.id } })
    if (existingServices === 0) {
        await prisma.service.createMany({
            data: [
                { name: 'Garden Design', description: 'Custom garden layout and planting plan.', category: 'Landscaping', startingPrice: 4999, duration: '2-3 days', location: 'Bangalore', images: [img('1416879595882-3373a0480b5b')], status: 'approved', storeId: store.id },
                { name: 'Drip Irrigation Setup', description: 'Install a complete drip system.', category: 'Irrigation', startingPrice: 2499, duration: '1 day', location: 'Bangalore', images: [img('1416879595882-3373a0480b5b')], status: 'approved', storeId: store.id },
                { name: 'Monthly Garden Maintenance', description: 'Pruning, feeding, and pest care.', category: 'Garden Maintenance', startingPrice: 1499, duration: 'Monthly', location: 'Bangalore', images: [img('1416879595882-3373a0480b5b')], status: 'approved', storeId: store.id },
            ],
        })
    }

    const existingProps = await prisma.property.count({ where: { storeId: store.id } })
    if (existingProps === 0) {
        await prisma.property.createMany({
            data: [
                { title: '2 Acre Farmhouse', description: 'Ready farmhouse with well and trees.', propertyType: 'Farmhouse', listingType: 'SALE', price: 8500000, location: 'Nashik', landSize: '2 Acres', images: [img('1500382017468-9049fed747ef')], status: 'approved', storeId: store.id, features: ['Water', 'Electricity'] },
                { title: 'Agricultural Land', description: 'Fertile plot near highway.', propertyType: 'Agricultural Land', listingType: 'SALE', price: 3200000, location: 'Pune', landSize: '1 Acre', images: [img('1500382017468-9049fed747ef')], status: 'approved', storeId: store.id, features: ['Road Access'] },
            ],
        })
    }

    await prisma.coupon.upsert({
        where: { code: 'LEAFY10' },
        update: {},
        create: {
            code: 'LEAFY10',
            description: '10% off sitewide',
            discount: 10,
            forNewUser: false,
            isPublic: true,
            expiresAt: new Date('2027-12-31'),
        },
    })

    // Seed the navbar category list (LeafyLand + Marketplace) so the strip is
    // populated. Display labels differ from product category strings; they map
    // to product categories via the dropdown links in CategoriesStrip.
    const leafyCats = ['Plants', 'Garden Tools', 'Irrigation', 'Farmhouses', 'Landscaping', 'Fertilizers', 'Pots']
    const marketCats = ['Electronics', 'Mobile Phones', 'Laptops', 'Fashion', 'Home & Kitchen', 'Sports & Outdoors', 'Books & Stationery', 'Toys & Games', 'Beauty & Personal Care', 'Automotive']
    const catDefaults = [
        ...leafyCats.map((name, i) => ({ name, type: 'leafy', order: i })),
        ...marketCats.map((name, i) => ({ name, type: 'marketplace', order: leafyCats.length + i })),
    ]
    for (const c of catDefaults) {
        await prisma.category.upsert({ where: { name: c.name }, create: c, update: {} })
    }

    console.log('Seeded users:')
    console.log('  admin@leafyland.com / LeafyLand123!')
    console.log('  seller@leafyland.com / LeafyLand123!')
    console.log('  buyer@leafyland.com / LeafyLand123!')
    console.log('Admin id', admin.id, 'Store', store.username)
}

main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
