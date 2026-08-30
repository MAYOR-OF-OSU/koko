"use client";

import { toast } from "sonner";

export function ReferButton() {
  return (
    <button
      onClick={() => toast.info("Referrals launch soon — check back.")}
      className="btn-fill shrink-0 rounded-md bg-cocoa-foreground px-5 py-2.5 text-[0.75rem] font-medium uppercase tracking-[0.14em] text-cocoa"
    >
      Refer a friend
    </button>
  );
}
