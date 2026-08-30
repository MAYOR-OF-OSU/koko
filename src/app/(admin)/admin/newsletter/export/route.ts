import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  let rows: { email: string; createdAt: Date }[] = [];
  try {
    rows = await prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" } });
  } catch {
    return new Response("Database unavailable", { status: 503 });
  }

  const csv = [
    "email,subscribed_at",
    ...rows.map((r) => `${r.email},${r.createdAt.toISOString()}`),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="timis-jewels-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
