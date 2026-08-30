import nodemailer from "nodemailer";
import { env, features } from "@/lib/env";

/**
 * Dev: no SMTP configured -> log the message to the server console.
 * Prod: real SMTP transport from env.
 */
let transport: nodemailer.Transporter | null = null;

function getTransport() {
  if (!features.email) return null;
  transport ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return transport;
}

export async function sendMail(opts: { to: string; subject: string; html: string; text?: string }) {
  const t = getTransport();
  if (!t) {
    console.info("[mail:dev]", { from: env.SMTP_FROM, ...opts });
    return { queued: false as const };
  }
  await t.sendMail({ from: env.SMTP_FROM, ...opts });
  return { queued: true as const };
}
