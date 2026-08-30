import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";
import {
  AdminPage,
  Panel,
  CardHeading,
  StatCard,
  DbDown,
  Table,
  THead,
  TH,
  TR,
  TD,
} from "@/components/admin/ui";
import { RevenueChart, CategoryDonut, type ChartPoint } from "@/components/admin/mini-chart";
import { OverviewRail, type ActivityItem } from "@/components/admin/overview-rail";

export const dynamic = "force-dynamic";

const DAY = 86400000;
const pct = (now: number, prev: number) =>
  prev === 0 ? (now > 0 ? 100 : 0) : Math.round(((now - prev) / prev) * 100);

async function getData() {
  const now = Date.now();
  const d30 = new Date(now - 30 * DAY);
  const d60 = new Date(now - 60 * DAY);

  const [
    productCount,
    customerCount,
    subscriberCount,
    newClients30,
    newClients60,
    orders60,
    orderItems,
    clients,
    recentMessages,
    recentProducts,
    recentJournal,
    team,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.user.count({ where: { role: "client" } }),
    prisma.newsletterSubscriber.count(),
    prisma.user.count({ where: { role: "client", createdAt: { gte: d30 } } }),
    prisma.user.count({ where: { role: "client", createdAt: { gte: d60, lt: d30 } } }),
    prisma.order.findMany({
      where: { createdAt: { gte: d60 } },
      select: { createdAt: true, totalKobo: true, status: true, reference: true, id: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.orderItem.findMany({ select: { unitPriceKobo: true, qty: true, productId: true } }),
    prisma.user.findMany({
      where: { role: "client" },
      select: { id: true, name: true, orders: { select: { totalKobo: true, status: true } } },
    }),
    prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { name: true, createdAt: true } }),
    prisma.journalPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
      take: 2,
      select: { title: true, publishedAt: true },
    }),
    prisma.user.findMany({ where: { role: "admin" }, select: { name: true, email: true } }),
  ]);

  const [recentAlerts, recentAudit] = await Promise.all([
    prisma.stockAlert.findMany({ orderBy: { createdAt: "desc" }, take: 4 }),
    prisma.auditEvent.findMany({
      where: { action: { notIn: ["auth.login", "auth.logout"] } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const productCategory = new Map(
    (
      await prisma.product.findMany({ select: { id: true, category: { select: { name: true } } } })
    ).map((p) => [p.id, p.category.name]),
  );

  const paid = (s: string) => s === "paid" || s === "fulfilled";
  const revenue30 = orders60.filter((o) => o.createdAt >= d30 && paid(o.status)).reduce((n, o) => n + o.totalKobo, 0);
  const revenuePrev = orders60
    .filter((o) => o.createdAt < d30 && paid(o.status))
    .reduce((n, o) => n + o.totalKobo, 0);
  const orders30 = orders60.filter((o) => o.createdAt >= d30).length;
  const ordersPrev = orders60.filter((o) => o.createdAt < d30).length;

  // 30-day area series + 14-day spark
  const byDay = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const k = new Date(now - i * DAY).toISOString().slice(5, 10);
    byDay.set(k, { revenue: 0, orders: 0 });
  }
  for (const o of orders60) {
    if (o.createdAt < d30) continue;
    const k = o.createdAt.toISOString().slice(5, 10);
    const cur = byDay.get(k);
    if (cur) {
      cur.revenue += o.totalKobo;
      cur.orders += 1;
    }
  }
  const chart: ChartPoint[] = [...byDay.entries()].map(([label, v]) => ({ label, ...v }));
  const revSpark = chart.slice(-14).map((p) => p.revenue);
  const ordSpark = chart.slice(-14).map((p) => p.orders);

  // sales by category
  const catMap = new Map<string, number>();
  for (const it of orderItems) {
    const name = (it.productId && productCategory.get(it.productId)) || "Other";
    catMap.set(name, (catMap.get(name) ?? 0) + it.unitPriceKobo * it.qty);
  }
  const salesByCategory = [...catMap.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  // top customers
  const topCustomers = clients
    .map((c) => ({
      id: c.id,
      name: c.name,
      orders: c.orders.length,
      spend: c.orders.filter((o) => paid(o.status)).reduce((n, o) => n + o.totalKobo, 0),
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5);

  // activity feed
  const activity: ActivityItem[] = [
    ...orders60.slice(0, 5).map((o) => ({
      kind: "order" as const,
      text: `Order ${o.reference} — ${formatNaira(o.totalKobo)} (${o.status})`,
      at: o.createdAt,
    })),
    ...recentMessages.map((m) => ({ kind: "message" as const, text: `Message from ${m.name}`, at: m.createdAt })),
    ...recentProducts.map((p) => ({ kind: "product" as const, text: `Product added — ${p.name}`, at: p.createdAt })),
    ...recentJournal
      .filter((j) => j.publishedAt)
      .map((j) => ({ kind: "journal" as const, text: `Journal published — ${j.title}`, at: j.publishedAt! })),
    ...recentAlerts.map((a) => ({
      kind: "alert" as const,
      text: `Low stock — ${a.productName}${a.variantName ? ` (${a.variantName})` : ""}: ${a.stock} left`,
      at: a.createdAt,
    })),
    ...recentAudit.map((e) => ({
      kind: "audit" as const,
      text: `${e.actorEmail ?? "Someone"} — ${e.action.replace(/[._]/g, " ")}${e.target ? ` · ${e.target}` : ""}`,
      at: e.createdAt,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 10);

  return {
    ok: true as const,
    stats: {
      revenue: revenue30,
      revenueDelta: pct(revenue30, revenuePrev),
      orders: orders30,
      ordersDelta: pct(orders30, ordersPrev),
      customers: customerCount,
      customersDelta: pct(newClients30, newClients60),
      products: productCount,
      subscribers: subscriberCount,
      newOrders30: orders30,
      revSpark,
      ordSpark,
    },
    chart,
    salesByCategory,
    topCustomers,
    activity,
    team,
  };
}

export default async function AdminOverview() {
  let data: Awaited<ReturnType<typeof getData>> | { ok: false };
  try {
    data = await getData();
  } catch {
    data = { ok: false };
  }
  if (!data.ok) {
    return (
      <AdminPage title="Overview">
        <DbDown area="The dashboard" />
      </AdminPage>
    );
  }

  const { stats, chart, salesByCategory, topCustomers, activity, team } = data;

  return (
    <AdminPage title="Overview" description="Store health at a glance.">
      <div className="grid gap-6 lg:grid-cols-[1fr_19rem]">
        {/* main column */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Revenue"
              value={formatNaira(stats.revenue)}
              delta={stats.revenueDelta}
              hint="vs prev 30d"
              spark={stats.revSpark}
            />
            <StatCard
              label="Orders"
              value={String(stats.orders)}
              delta={stats.ordersDelta}
              hint="vs prev 30d"
              spark={stats.ordSpark}
            />
            <StatCard
              label="Customers"
              value={String(stats.customers)}
              delta={stats.customersDelta}
              hint="new vs prev 30d"
            />
            <StatCard
              label="New orders"
              value={String(stats.newOrders30)}
              hint={`${stats.subscribers} subscribers`}
              spark={stats.ordSpark}
            />
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-2">
            <Panel>
              <CardHeading title="Sales by category" />
              <CategoryDonut data={salesByCategory} />
            </Panel>
            <Panel>
              <CardHeading title="Revenue — last 30 days" />
              <RevenueChart data={chart} />
            </Panel>
          </div>

          <Panel>
            <CardHeading
              title="Top customers"
              action={
                <Link href="/admin/customers" className="text-xs text-muted-foreground hover:text-foreground">
                  View all
                </Link>
              }
            />
            {topCustomers.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No customers yet.</p>
            ) : (
              <Table bare>
                <THead>
                  <TR>
                    <TH>Name</TH>
                    <TH className="text-right">Orders</TH>
                    <TH className="text-right">Spend</TH>
                  </TR>
                </THead>
                <tbody>
                  {topCustomers.map((c) => (
                    <TR key={c.id}>
                      <TD>
                        <Link href={`/admin/customers/${c.id}`} className="hover:underline">
                          {c.name}
                        </Link>
                      </TD>
                      <TD className="text-right">{c.orders}</TD>
                      <TD className="text-right">{formatNaira(c.spend)}</TD>
                    </TR>
                  ))}
                </tbody>
              </Table>
            )}
          </Panel>
        </div>

        {/* right rail */}
        <OverviewRail activity={activity} team={team} />
      </div>
    </AdminPage>
  );
}
