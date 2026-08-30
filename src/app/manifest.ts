import type { MetadataRoute } from "next";
import { getStoreSettings } from "@/lib/site-content";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getStoreSettings();
  return {
    name: s.name,
    short_name: s.name,
    description: s.tagline,
    start_url: "/",
    display: "standalone",
    background_color: "#FBF4F1",
    theme_color: "#6E3482",
    icons: [
      { src: "/icon.svg", type: "image/svg+xml", sizes: "any" },
      { src: "/icon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "any" },
      { src: "/icon-512.png", type: "image/png", sizes: "512x512", purpose: "maskable" },
    ],
  };
}
