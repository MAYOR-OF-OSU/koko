import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/auth-forms";
import { features } from "@/lib/env";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm googleEnabled={features.google} />
    </Suspense>
  );
}
