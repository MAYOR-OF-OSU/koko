import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow browsing the dev server from other devices on the LAN without
  // Next.js blocking its own dev chunk/HMR requests. Add your machine's LAN IP.
  allowedDevOrigins: ["localhost", "127.0.0.1", "192.168.0.185", "192.168.0.193"],
  images: {
    // Remote sources allowed today (placeholders) + Cloudflare targets for later.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "imagedelivery.net" }, // Cloudflare Images
      { protocol: "https", hostname: "**.r2.dev" }, // Cloudflare R2 public buckets
    ],
  },
  // Prisma's client should not be bundled by the server compiler.
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
