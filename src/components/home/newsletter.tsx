"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion/reveal";

export function NewsletterForm({
  variant = "section",
}: {
  variant?: "section" | "footer" | "band";
}) {
  const [pending, setPending] = React.useState(false);
  const footer = variant === "footer";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    setPending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      toast.success("You're on the list. Watch your inbox.");
      form.reset();
    } catch {
      toast.error("Something went wrong. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (variant === "band") {
    return (
      <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          placeholder="Your email address"
          className="min-w-0 flex-1 rounded-md border border-border bg-background px-4 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
        />
        <button
          type="submit"
          disabled={pending}
          className="btn-fill shrink-0 rounded-md bg-primary px-6 py-3 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-primary-foreground transition disabled:opacity-60"
        >
          {pending ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "flex items-center gap-3 border-b pb-2",
        footer ? "border-cocoa-foreground/30" : "border-foreground/25",
      )}
    >
      <input
        type="email"
        name="email"
        required
        placeholder="you@email.com"
        className={cn(
          "min-w-0 flex-1 bg-transparent py-1 text-sm outline-none",
          footer
            ? "text-cocoa-foreground placeholder:text-cocoa-foreground/40"
            : "placeholder:text-muted-foreground",
        )}
      />
      <button
        type="submit"
        disabled={pending}
        aria-label="Subscribe"
        className={cn(
          "group inline-flex shrink-0 items-center gap-1.5 text-[0.7rem] font-medium uppercase tracking-[0.2em] transition disabled:opacity-60",
          footer ? "text-cocoa-foreground" : "text-foreground",
        )}
      >
        Subscribe
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}

export function NewsletterSection() {
  return (
    <section className="border-y border-border bg-secondary/50">
      <Reveal className="mx-auto flex max-w-xl flex-col items-center px-4 py-14 text-center sm:px-6 md:py-20">
        <span className="eyebrow">Newsletter</span>
        <h2 className="mt-4 font-heading text-3xl sm:text-4xl">Be first to the next drop</h2>
        <p className="mt-3 text-muted-foreground">
          New pieces, restocks and members-only sales — straight to your inbox. No spam, ever.
        </p>
        <div className="mt-10 w-full max-w-sm">
          <NewsletterForm />
        </div>
      </Reveal>
    </section>
  );
}
