"use client";

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";

// No baseURL on purpose: the client calls /api/auth on whatever origin the app is
// served from (localhost, a Vercel preview URL, the production alias, a custom
// domain). This avoids baking a wrong NEXT_PUBLIC_SITE_URL into the browser bundle
// at build time — the failure mode where the deployed site POSTs to localhost.
export const authClient = createAuthClient({
  plugins: [adminClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
