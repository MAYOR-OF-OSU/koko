import type { Metadata } from "next";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressManager, type Address } from "@/components/account/address-manager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Manage addresses", robots: { index: false } };

export default async function AddressesPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  let addresses: Address[] = [];
  try {
    addresses = await prisma.address.findMany({
      where: { userId: session?.user.id ?? "" },
      orderBy: [{ isDefault: "desc" }, { id: "desc" }],
      select: {
        id: true,
        fullName: true,
        phone: true,
        street: true,
        city: true,
        state: true,
        country: true,
        isDefault: true,
      },
    });
  } catch {
    /* DB unreachable — render the manager with an empty list */
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Saved addresses fill in your checkout details automatically.
      </p>
      <AddressManager addresses={addresses} />
    </div>
  );
}
