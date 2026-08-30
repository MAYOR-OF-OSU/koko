"use client";

import * as React from "react";
import { toast } from "sonner";
import { Heart, Truck, RefreshCw, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import type { MockProduct } from "@/lib/mock-data";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { cn } from "@/lib/utils";

const LENGTHS = ['16"', '18"', '20"'];
const TONES = [
  { name: "Gold", swatch: "#C9A24B" },
  { name: "Rose gold", swatch: "#B76E79" },
  { name: "Silver", swatch: "#C4C4CC" },
];

export function AddToCart({ product }: { product: MockProduct }) {
  const add = useCart((s) => s.add);
  const needsLength = product.categorySlug.includes("chain");
  const [length, setLength] = React.useState(LENGTHS[1]);
  const [tone, setTone] = React.useState(TONES[0].name);
  const [showGuide, setShowGuide] = React.useState(false);

  const variant = [needsLength ? length : null, tone].filter(Boolean).join(" · ");

  return (
    <div className="space-y-6">
      {/* colour */}
      <div>
        <p className="text-sm">
          <span className="font-medium">Colour:</span>{" "}
          <span className="text-muted-foreground">{tone}</span>
        </p>
        <div className="mt-2 flex gap-2.5">
          {TONES.map((t) => (
            <button
              key={t.name}
              type="button"
              aria-label={t.name}
              onClick={() => setTone(t.name)}
              className={cn(
                "size-8 rounded-full ring-offset-2 transition",
                tone === t.name ? "ring-2 ring-primary" : "ring-1 ring-border hover:ring-foreground/40",
              )}
              style={{ background: t.swatch }}
            />
          ))}
        </div>
      </div>

      {/* size / length */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-sm">
            <span className="font-medium">Size:</span>{" "}
            <span className="text-muted-foreground">{needsLength ? length : "One size"}</span>
          </p>
          {needsLength && (
            <button
              type="button"
              onClick={() => setShowGuide((s) => !s)}
              className="text-[0.75rem] text-primary hover:underline"
            >
              Size Guide
            </button>
          )}
        </div>
        {needsLength && (
          <div className="mt-2 flex flex-wrap gap-2">
            {LENGTHS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLength(l)}
                className={cn(
                  "min-w-12 rounded-lg border px-3 py-2 text-sm transition",
                  l === length
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:border-foreground",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        )}
        {showGuide && (
          <div className="mt-2 rounded-lg border border-border bg-secondary/40 p-3 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Chain lengths</p>
            <p className="mt-1">16&quot; — sits at the base of the neck (choker).</p>
            <p>18&quot; — rests on the collarbone (most popular).</p>
            <p>20&quot; — falls just below the collarbone.</p>
          </div>
        )}
      </div>

      {/* actions */}
      <div className="flex items-stretch gap-3">
        <InteractiveHoverButton
          className="flex-1 justify-center"
          onClick={() => {
            add({
              productSlug: product.slug,
              name: product.name,
              image: product.image,
              priceKobo: product.priceKobo,
              variant,
            });
            toast.success("Added to your bag");
          }}
        >
          Add to Cart
        </InteractiveHoverButton>
        <button
          type="button"
          aria-label="Save to wishlist"
          onClick={() => toast.success("Saved to wishlist")}
          className="grid aspect-square place-items-center rounded-full border border-border transition hover:border-foreground"
        >
          <Heart className="size-5" />
        </button>
      </div>

      {/* trust */}
      <div className="grid grid-cols-3 gap-3 border-t border-border pt-5 text-center text-[0.68rem] text-muted-foreground">
        {[
          { icon: Truck, a: "Free Shipping", b: "on orders over ₦30,000" },
          { icon: RefreshCw, a: "Easy Returns", b: "7-day store credit" },
          { icon: ShieldCheck, a: "60-Day Sparkle", b: "or we replace it" },
        ].map((t) => (
          <div key={t.a} className="flex flex-col items-center gap-1">
            <t.icon className="size-4 text-primary" />
            <span className="font-medium text-foreground">{t.a}</span>
            <span>{t.b}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
