"use client";

import * as React from "react";
import { X } from "lucide-react";

export function AnnouncementBarClient({ messages }: { messages: string[] }) {
  const [hidden, setHidden] = React.useState(false);
  if (hidden) return null;

  return (
    <div className="relative z-[60] bg-cocoa text-cocoa-foreground">
      <div className="mx-auto flex max-w-[100rem] items-center gap-4 px-4 py-2 sm:px-8">
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee gap-16 whitespace-nowrap text-[0.68rem] uppercase tracking-[0.18em]">
            {[...messages, ...messages, ...messages].map((m, i) => (
              <span key={i}>{m}</span>
            ))}
          </div>
        </div>
        <button
          type="button"
          aria-label="Dismiss announcement"
          onClick={() => setHidden(true)}
          className="shrink-0 rounded-full p-1 opacity-60 transition hover:opacity-100"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
