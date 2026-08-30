import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-4 text-center">
      <Logo variant="monogram" className="h-12" />
      <div>
        <h1 className="font-heading text-3xl font-semibold">Page not found</h1>
        <p className="mt-2 text-muted-foreground">
          The piece you&rsquo;re looking for may have sold out or moved.
        </p>
      </div>
      <Link
        href="/"
        className="btn-fill inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground"
      >
        Back home
      </Link>
    </div>
  );
}
