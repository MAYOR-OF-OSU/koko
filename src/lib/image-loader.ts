import { features } from "@/lib/env";

/**
 * Single choke-point for image URLs. Today it passes local/placeholder URLs
 * through untouched. When Cloudflare Images is configured, swap the body of
 * `resolveImage` to emit `imagedelivery.net` URLs with a named variant — no
 * call sites change.
 */
export function resolveImage(src: string): string {
  if (!features.cloudflareImages) return src;
  // TODO(cloudflare): map an internal image id -> delivery URL + variant.
  return src;
}

/** A tiny neutral blur placeholder so hero/product images never cause CLS. */
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI4IiBoZWlnaHQ9IjgiIGZpbGw9IiNlOWUxZjIiLz48L3N2Zz4=";
