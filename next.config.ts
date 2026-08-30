import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow browsing the dev server from other devices on the LAN without
  // Next.js blocking its own dev chunk/HMR requests. Add your machine's LAN IP.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.185", "192.168.0.193"],
  images: {
    // Serve the smallest of AVIF/WebP the browser accepts.
    formats: ["image/avif", "image/webp"],
    // Trim the default breakpoint ladder to sizes this layout actually renders.
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Remote sources allowed today (placeholders) + storage targets.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "imagedelivery.net" }, // Cloudflare Images
      { protocol: "https", hostname: "**.r2.dev" }, // Cloudflare R2 public buckets
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" }, // Vercel Blob
    ],
  },
  // Prisma's client should not be bundled by the server compiler.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
