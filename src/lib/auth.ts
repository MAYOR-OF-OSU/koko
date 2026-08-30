import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

const googleProvider =
  env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
    ? { google: { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } }
    : undefined;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: [...new Set([env.NEXT_PUBLIC_SITE_URL, env.BETTER_AUTH_URL])],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
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
