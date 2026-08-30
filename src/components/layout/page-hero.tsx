export function PageHero({
  eyebrow,
  title,
  subtitle,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  return (
    <section
      className={`mx-auto max-w-[100rem] px-4 pb-8 pt-12 sm:px-8 sm:pt-16 ${
        align === "center" ? "text-center" : ""
      }`}
    >
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h1 className="mt-4 font-heading text-4xl sm:text-5xl lg:text-6xl">{title}</h1>
      {subtitle && (
        <p
          className={`mt-4 max-w-2xl text-muted-foreground ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </section>
  );
}
