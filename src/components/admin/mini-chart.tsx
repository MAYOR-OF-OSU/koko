"use client";

import {
  Area,
  AreaChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNaira } from "@/lib/format";

export type ChartPoint = { label: string; revenue: number; orders: number };

/** 7-slice brand ramp: rose → gold → cocoa tints. */
export const CATEGORY_COLORS = [
  "var(--rose-deep)",
  "var(--rose)",
  "var(--accent-gold)",
  "oklch(0.8 0.09 60)",
  "oklch(0.62 0.06 350)",
  "oklch(0.45 0.05 350)",
  "oklch(0.72 0.05 20)",
];

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--rose)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--rose)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            width={54}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `₦${Math.round(v / 100000)}k`}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 8,
              border: "1px solid var(--border)",
              fontSize: 12,
              background: "var(--popover)",
            }}
            formatter={(value) => [formatNaira(Number(value)), "Revenue"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="var(--rose-deep)" strokeWidth={2} fill="url(#rev)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ data, up = true }: { data: number[]; up?: boolean }) {
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={up ? "var(--rose-deep)" : "var(--muted-foreground)"}
            strokeWidth={1.75}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryDonut({ data }: { data: { name: string; value: number }[] }) {
  const total = data.reduce((n, d) => n + d.value, 0);
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-6">
      <div className="relative h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data.length ? data : [{ name: "No sales", value: 1 }]}
              dataKey="value"
              nameKey="name"
              innerRadius={62}
              outerRadius={92}
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="var(--card)"
              strokeWidth={2}
              isAnimationActive={false}
            >
              {(data.length ? data : [{ name: "x", value: 1 }]).map((_, i) => (
                <Cell key={i} fill={data.length ? CATEGORY_COLORS[i % CATEGORY_COLORS.length] : "var(--muted)"} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid var(--border)", fontSize: 12, background: "var(--popover)" }}
              formatter={(value, name) => [formatNaira(Number(value)), String(name)]}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="font-heading text-xl leading-none">{formatNaira(total)}</p>
            <p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Total</p>
          </div>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center justify-between gap-4">
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
              />
              <span className="text-muted-foreground">{d.name}</span>
            </span>
            <span className="shrink-0 tabular-nums font-medium">{formatNaira(d.value)}</span>
          </li>
        ))}
        {data.length === 0 && <li className="text-muted-foreground">No sales yet.</li>}
        {data.length > 0 && (
          <li className="flex items-center justify-between gap-4 border-t border-border pt-2.5 text-xs text-muted-foreground">
            <span>{data.length} categories</span>
            <span className="tabular-nums">{formatNaira(total)} total</span>
          </li>
        )}
      </ul>
    </div>
  );
}
