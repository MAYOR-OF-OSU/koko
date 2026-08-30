import type { Metadata } from "next";
import { Fraunces, Outfit, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  title: {
    default: "Timi's Jewels — Elevating beauty to its finest",
    template: "%s · Timi's Jewels",
  },
  description:
    "Timi's Jewels — handpicked fashion jewelry. Neck chains, earrings, rings, bracelets, anklets and more, with nationwide delivery.",
  keywords: [
    "Timi's Jewels",
    "fashion jewelry",
    "fashion earrings",
    "neck chains",
    "knuckle rings",
    "anklets",
    "bracelets",
  ],
  openGraph: {
    type: "website",
    siteName: "Timi's Jewels",
    title: "Timi's Jewels — Elevating beauty to its finest",
    description:
      "Handpicked fashion jewelry. Neck chains, earrings, rings, bracelets and more — with nationwide delivery.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-svh flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
