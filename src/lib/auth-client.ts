"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { env } from "@/lib/env";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SITE_URL,
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
