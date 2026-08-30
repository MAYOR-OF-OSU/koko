import { Suspense } from "react";
import { LoginForm } from "@/components/auth/auth-forms";
import { features } from "@/lib/env";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm googleEnabled={features.google} />
    </Suspense>
  );
}
