import type { Metadata } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond, Caveat, Great_Vibes } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  variable: "--font-great-vibes",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BloomBox | Send a Digital Bouquet with Love",
  description: "Create heartfelt digital bouquets, write a handwritten letter, seal it in a beautiful envelope, and share an emotional unboxing experience — completely free.",
  metadataBase: new URL("https://bloombox-free.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "BloomBox | Send a Digital Bouquet with Love",
    description: "Create heartfelt digital bouquets, write a handwritten letter, seal it in a beautiful envelope, and share an emotional unboxing experience — completely free.",
    url: "https://bloombox-free.vercel.app",
    siteName: "BloomBox",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BloomBox — Digital Bouquet Gifting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BloomBox | Send a Digital Bouquet with Love",
    description: "Create heartfelt digital bouquets, write a handwritten letter, seal it in a beautiful envelope, and share an emotional unboxing experience — completely free.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "BloomBox",
    statusBarStyle: "default",
  },
};

export const viewport = {
  themeColor: "#faf6f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} ${cormorant.variable} ${caveat.variable} ${greatVibes.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground" suppressHydrationWarning>{children}</body>
    </html>
  );
}
