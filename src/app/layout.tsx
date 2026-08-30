import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { env } from "@/lib/env";
import { getStoreSettings } from "@/lib/site-content";

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

export const viewport: Viewport = {
  themeColor: "#6E3482",
  colorScheme: "light",
};

export async function generateMetadata(): Promise<Metadata> {
  // getStoreSettings() already returns the static defaults if the DB is unreachable.
  const s = await getStoreSettings();
  const title = `${s.name} — ${s.tagline}`;
  const description =
    "Handpicked fashion jewelry — neck chains, earrings, rings, bracelets, anklets and more, finished by hand and delivered nationwide in days.";

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: { default: title, template: `%s · ${s.name}` },
    description,
    applicationName: s.name,
    keywords: [
      s.name,
      "fashion jewelry",
      "fashion earrings",
      "neck chains",
      "knuckle rings",
      "anklets",
      "bracelets",
      "Nigeria",
    ],
    alternates: { canonical: "./" },
    manifest: "/manifest.webmanifest",
    openGraph: {
      type: "website",
      siteName: s.name,
      url: env.NEXT_PUBLIC_SITE_URL,
      locale: "en_NG",
      title,
      description,
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${outfit.variable} ${geistMono.variable} antialiased`}
    >
      <body className="flex min-h-dvh flex-col">
        {children}
        <Toaster position="top-center" richColors />
        <SpeedInsights />
      </body>
    </html>
  );
}
