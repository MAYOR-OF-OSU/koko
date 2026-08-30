import { ShoppingCart, Inbox, Package, Newspaper, BellRing, ScrollText } from "lucide-react";
import { Panel, CardHeading } from "@/components/admin/ui";
import { timeAgo } from "@/lib/format";

export type ActivityItem = {
  kind: "order" | "message" | "product" | "journal" | "alert" | "audit";
  text: string;
  at: Date;
};

const ICONS = {
  order: ShoppingCart,
  message: Inbox,
  product: Package,
  journal: Newspaper,
  alert: BellRing,
  audit: ScrollText,
} as const;

export function OverviewRail({
  activity,
  team,
}: {
  activity: ActivityItem[];
  team: { name: string; email: string }[];
}) {
  return (
    <div className="space-y-6">
      <Panel>
        <CardHeading title="Activity" />
        {activity.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing recent.</p>
        ) : (
          <ul className="space-y-4">
            {activity.map((a, i) => {
              const Icon = ICONS[a.kind];
              return (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-rose-deep">
                    <Icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{timeAgo(a.at)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>

      <Panel>
        <CardHeading title="Admins" />
        <ul className="space-y-3">
          {team.map((m) => (
            <li key={m.email} className="flex items-center gap-3">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
                {(m.name || m.email).slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="truncate text-xs text-muted-foreground">{m.email}</p>
              </div>
            </li>
          ))}
          {team.length === 0 && <li className="text-sm text-muted-foreground">No admins.</li>}
        </ul>
      </Panel>
    </div>
  );
}
