import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your bag",
  description: "Review the pieces in your bag before checkout.",
  robots: { index: false },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
