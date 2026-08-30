import { getSetting } from "@/lib/site-content";

export async function MarqueeBand() {
  const { items } = await getSetting("home.marquee");
  const list = items.length ? items : ["Handmade with care"];

  return (
    <div className="overflow-hidden border-y border-border bg-background py-4">
      <div className="flex w-max animate-marquee items-center gap-12 whitespace-nowrap text-[0.7rem] uppercase tracking-[0.24em] text-muted-foreground">
        {/* x4 so the -50% keyframe lands exactly on a copy boundary (seamless loop). */}
        {[...list, ...list, ...list, ...list].map((t, i) => (
          <span key={i} className="flex items-center gap-12">
            {t}
            <span className="text-accent-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
