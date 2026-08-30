import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { sendMail } from "@/lib/mail";

const googleProvider =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
    : undefined;

// Accept requests from the configured site URL plus the Vercel-provided origins
// (this deployment, the production alias, and any *.vercel.app preview), so auth
// still works when BETTER_AUTH_URL / NEXT_PUBLIC_SITE_URL haven't been set — or
// have been set with a trailing slash / wrong casing — in the dashboard.
const trustedOrigins = [
  ...new Set(
    [
      env.NEXT_PUBLIC_SITE_URL,
      env.BETTER_AUTH_URL,
      process.env.VERCEL_PROJECT_PRODUCTION_URL &&
        `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`,
      process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
      process.env.VERCEL && "https://*.vercel.app",
    ].filter(Boolean) as string[],
  ),
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 3600, // 1 hour
    sendResetPassword: async ({ user, url }) => {
      // sendMail is a no-op (console log) until SMTP_* env vars are set.
      await sendMail({
        to: user.email,
        subject: "Reset your Timi's Jewels password",
        html: `<p>Hi ${user.name || "there"},</p>
          <p>We got a request to reset your Timi's Jewels password. This link expires in 1 hour:</p>
          <p><a href="${url}">Set a new password</a></p>
          <p>If you didn't ask for this, you can safely ignore this email.</p>`,
        text: `Reset your Timi's Jewels password (expires in 1 hour): ${url}`,
      }).catch(() => {});
    },
  },
  ...(googleProvider ? { socialProviders: googleProvider } : {}),
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "client", input: false },
    },
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          // Record every sign-in in the audit log (best-effort).
          try {
            const user = await prisma.user.findUnique({
              where: { id: session.userId },
              select: { email: true, role: true },
            });
            await prisma.auditEvent.create({
              data: {
                actorId: session.userId,
                actorEmail: user?.email ?? null,
                actorRole: user?.role ?? null,
                action: "auth.login",
                target: user?.email ?? null,
                ip: session.ipAddress || null,
                meta: session.userAgent ? { userAgent: session.userAgent } : undefined,
              },
            });
          } catch {
            /* never block sign-in on logging */
          }
        },
      },
    },
  },
  plugins: [
    admin({ defaultRole: "client", adminRoles: ["admin"] }),
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
