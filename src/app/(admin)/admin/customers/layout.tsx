import type { ReactNode } from "react";
import { guardPage } from "@/lib/admin-guard";

export default async function Layout({ children }: { children: ReactNode }) {
  await guardPage("customers:read");
  return <>{children}</>;
}
