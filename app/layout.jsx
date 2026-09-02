import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import AuthProvider from "@/components/AuthProvider";
import CartSync from "@/components/CartSync";
import WishlistSync from "@/components/WishlistSync";
import { auth } from "@/lib/auth";
import "./globals.css";

const outfit = Outfit({
    subsets: ["latin"],
    weight: ["400", "500", "600"],
    display: "swap",
    preload: true,
    adjustFontFallback: true,
    fallback: ["system-ui", "Segoe UI", "sans-serif"],
});

export const metadata = {
    title: "LeafyLand — Plants, Properties & Landscaping Services",
    description: "LeafyLand is your marketplace for plants, garden products, farmhouses, land, and professional landscaping services.",
    icons: {
        icon: "/favicon.svg",
    },
};

export const viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export default async function RootLayout({ children }) {
    const session = await auth()
    return (
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <AuthProvider session={session}>
                    <StoreProvider>
                        <Toaster />
                        <CartSync />
                        <WishlistSync />
                        {children}
                    </StoreProvider>
                </AuthProvider>
            </body>
        </html>
    );
}
