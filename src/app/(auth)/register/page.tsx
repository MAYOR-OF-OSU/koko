import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/auth-forms";
import { features } from "@/lib/env";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a Timi's Jewels account to track orders and save your favourites.",
  robots: { index: false },
};

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm googleEnabled={features.google} />
    </Suspense>
  );
}
