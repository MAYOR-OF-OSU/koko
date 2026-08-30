import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/auth-forms";
import { features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Timi's Jewels account.",
  robots: { index: false },
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm googleEnabled={features.google} />
    </Suspense>
  );
}
