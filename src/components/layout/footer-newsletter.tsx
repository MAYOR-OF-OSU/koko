import { NewsletterForm } from "@/components/home/newsletter";

/** The light "join the list" band that sits directly above the dark footer. */
export function FooterNewsletter() {
  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-10 text-center sm:px-6 sm:py-12">
        <span className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-muted-foreground">
          Newsletter
        </span>
        <h2 className="mt-3 font-heading text-2xl sm:text-3xl">Join the list</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          New pieces, restocks and members-only offers — straight to your inbox. No spam, ever.
        </p>
        <div className="mt-6 w-full">
          <NewsletterForm variant="band" />
        </div>
      </div>
    </section>
  );
}
