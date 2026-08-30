import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Track your order",
  description:
    "Enter your order reference and email to see where your Timi's Jewels order is right now.",
};

export default function TrackOrderLayout({ children }: { children: React.ReactNode }) {
  return children;
}
