/** Money is stored everywhere as integer kobo (1 NGN = 100 kobo). */
const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(kobo: number): string {
  return nairaFormatter.format(Math.round(kobo) / 100);
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100);
}

/** kobo -> a plain naira string for form inputs, e.g. 850000 -> "8500". */
export function koboToNairaString(kobo: number): string {
  return String(Math.round(kobo) / 100);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
  }).format(typeof date === "string" ? new Date(date) : date);
}

/** Compact relative time, e.g. "just now", "4h ago", "3d ago". */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 45) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  if (s < 604800) return `${Math.round(s / 86400)}d ago`;
  return formatDate(d);
}
