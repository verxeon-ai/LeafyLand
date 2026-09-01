/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 60 * 60 * 24 * 7,
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [32, 48, 64, 96, 128, 256, 384],
        remotePatterns: [
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'plus.unsplash.com' },
            { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
        ],
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'recharts', 'date-fns'],
    },
    serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'pg', 'sharp'],
};

export default nextConfig;
