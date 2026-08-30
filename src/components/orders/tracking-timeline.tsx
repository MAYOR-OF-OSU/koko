import { Check } from "@/components/ui/icon";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const FULFILLMENT_STAGES = [
  "received",
  "packaged",
  "dispatched",
  "in_transit",
  "arriving",
  "ready_pickup",
  "delivered",
] as const;
export type FulfillmentStage = (typeof FULFILLMENT_STAGES)[number];
export type DeliveryMethod = "delivery" | "pickup";

const LABELS: Record<
  FulfillmentStage,
  { title: string; blurb: string; pickupTitle?: string; pickupBlurb?: string }
> = {
  received: { title: "Order received", blurb: "We have your order and details." },
  packaged: { title: "Packaged", blurb: "Your pieces are cleaned, wrapped and boxed." },
  dispatched: {
    title: "Sent out",
    blurb: "Handed to the courier.",
    pickupTitle: "Moving to the pickup point",
    pickupBlurb: "On its way to the collection point.",
  },
  in_transit: {
    title: "In transit",
    blurb: "On the way to your city.",
    pickupBlurb: "In transit to the pickup point.",
  },
  arriving: {
    title: "Almost at destination",
    blurb: "Out for delivery near you.",
    pickupTitle: "Arriving at the pickup point",
    pickupBlurb: "Nearly ready for you to collect.",
  },
  ready_pickup: {
    title: "Ready for pickup",
    blurb: "Waiting for you at the pickup point.",
  },
  delivered: {
    title: "Delivered",
    blurb: "Enjoy — thank you for shopping with us.",
    pickupTitle: "Picked up",
    pickupBlurb: "Collected. Thank you for shopping with us.",
  },
};

/** Which stages to show for each method (pickup skips the "at your door" steps). */
const FLOW: Record<DeliveryMethod, FulfillmentStage[]> = {
  delivery: ["received", "packaged", "dispatched", "in_transit", "arriving", "delivered"],
  pickup: ["received", "packaged", "dispatched", "in_transit", "ready_pickup", "delivered"],
};

export function TrackingTimeline({
  stage,
  method = "delivery",
  note,
  estimatedReadyAt,
  updatedAt,
  className,
}: {
  stage: FulfillmentStage;
  method?: DeliveryMethod;
  note?: string | null;
  estimatedReadyAt?: string | Date | null;
  updatedAt?: string | Date | null;
  className?: string;
}) {
  const flow = FLOW[method];
  // If the order somehow sits on a stage outside this flow, fall back to its position in the master list.
  const currentIdx = flow.includes(stage)
    ? flow.indexOf(stage)
    : Math.min(
        flow.length - 1,
        FULFILLMENT_STAGES.indexOf(stage) - (method === "pickup" ? 0 : 1),
      );

  return (
    <div className={cn("space-y-0", className)}>
      {flow.map((s, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const meta = LABELS[s];
        const title = (method === "pickup" && meta.pickupTitle) || meta.title;
        const blurb = (method === "pickup" && meta.pickupBlurb) || meta.blurb;
        return (
          <div key={s} className="flex gap-4">
            {/* rail */}
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-7 shrink-0 place-items-center rounded-full border text-background transition-colors",
                  done && "border-primary bg-primary",
                  active && "border-primary bg-primary",
                  !done && !active && "border-border bg-card",
                )}
              >
                {done || active ? (
                  <Check className="size-3.5" />
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/40" />
                )}
              </span>
              {i < flow.length - 1 && (
                <span
                  className={cn(
                    "w-px flex-1",
                    i < currentIdx ? "bg-primary" : "bg-border",
                  )}
                  style={{ minHeight: "2.25rem" }}
                />
              )}
            </div>

            {/* copy */}
            <div className={cn("pb-6", i === flow.length - 1 && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  active ? "text-foreground" : done ? "text-foreground/80" : "text-muted-foreground",
                )}
              >
                {title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{blurb}</p>

              {active && (
                <div className="mt-2 space-y-1 text-xs">
                  {estimatedReadyAt && (
                    <p className="text-foreground">
                      <span className="text-muted-foreground">
                        {method === "pickup" ? "Ready to collect by " : "Estimated by "}
                      </span>
                      {formatDate(estimatedReadyAt)}
                    </p>
                  )}
                  {note && <p className="text-muted-foreground">“{note}”</p>}
                  {updatedAt && (
                    <p className="text-muted-foreground/70">Updated {formatDate(updatedAt)}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
