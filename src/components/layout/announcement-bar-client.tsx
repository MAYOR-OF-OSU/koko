"use client";

import * as React from "react";
import { X } from "@/components/ui/icon";

/** Stable key for the current message set so a new promo re-shows the bar. */
function keyFor(messages: string[]) {
  let h = 0;
  const s = messages.join("|");
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return `tj-annc-${h}`;
}

export function AnnouncementBarClient({ messages }: { messages: string[] }) {
  const storageKey = keyFor(messages);
  // Start visible; a one-shot effect hides it if this exact set was dismissed before.
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot restore of a dismissed state
      if (localStorage.getItem(storageKey) === "1") setHidden(true);
    } catch {
      /* private mode / blocked storage — just show it */
    }
  }, [storageKey]);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative z-[60] bg-cocoa text-cocoa-foreground">
      <div className="mx-auto flex max-w-[100rem] items-center gap-4 px-4 py-2 sm:px-8">
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-16 whitespace-nowrap text-[0.68rem] uppercase tracking-[0.18em]">
            {/* x4 so the -50% keyframe lands exactly on a copy boundary (seamless loop). */}
            {[...messages, ...messages, ...messages, ...messages].map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={dismiss}
          className="shrink-0 rounded-full p-1 opacity-60 transition hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
