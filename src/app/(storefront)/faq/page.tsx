import type { Metadata } from "next";
import { PageHero } from "@/components/layout/page-hero";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getSetting } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Shipping, returns, care and payment questions answered.",
};

export default async function FaqPage() {
  const { groups } = await getSetting("pages.faq");

  return (
    <>
      <PageHero eyebrow="Help" title="Frequently asked questions" />
      <section className="mx-auto max-w-3xl px-4 pb-14 sm:px-6">
        {groups.map((g) => (
          <div key={g.id} id={g.id} className="scroll-mt-28 py-5">
            <h2 className="mb-2 font-heading text-xl">{g.title}</h2>
            <Accordion>
              {g.qas.map((qa, i) => (
                <AccordionItem key={i} value={`${g.id}-${i}`}>
                  <AccordionTrigger>{qa.q}</AccordionTrigger>
                  <AccordionContent>{qa.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </section>
    </>
  );
}
