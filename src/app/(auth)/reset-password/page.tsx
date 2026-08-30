import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/auth-forms";

export const metadata: Metadata = {
  title: "Set a new password",
  description: "Choose a new password for your Timi's Jewels account.",
  robots: { index: false },
};

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
