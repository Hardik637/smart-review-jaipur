import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#15803D",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://review.welurik.com"),
  title: {
    default: "Welurik Review — Turn Happy Customers into 5-Star Google Reviews",
    template: "%s | Welurik Review",
  },
  description:
    "AI-powered QR standees that eliminate customer writer's block and multiply your Google Maps reviews in 30 seconds. 100% Google policy compliant.",
  keywords: [
    "Google reviews",
    "GMB ranking booster",
    "Google Maps SEO",
    "QR code review standee",
    "AI review assistant",
    "local business reviews",
    "customer feedback system",
    "Welurik Review",
  ],
  authors: [{ name: "Welurik Review Team" }],
  creator: "Welurik Review",
  publisher: "Welurik Review",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://review.welurik.com",
    siteName: "Welurik Review",
    title: "Welurik Review — Turn Happy Customers into 5-Star Google Reviews",
    description:
      "AI-powered QR standees and 30-second review assistant to multiply your Google Maps 5-star reviews and dominate local search rankings.",
    images: [
      {
        url: "/welurik-review-light.png",
        width: 800,
        height: 600,
        alt: "Welurik Review",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Welurik Review — Turn Happy Customers into 5-Star Google Reviews",
    description:
      "AI-powered QR standees and 30-second review assistant to multiply your Google Maps reviews in 30 seconds.",
    images: ["/welurik-review-light.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.png", sizes: "64x64", type: "image/png" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-[#ECFDF5] text-slate-900 font-sans antialiased selection:bg-[#15803D] selection:text-white">
        {children}
      </body>
    </html>
  );
}
