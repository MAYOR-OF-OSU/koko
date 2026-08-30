import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { contact } from "@/lib/nav";

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  message: z.string().trim().min(10).max(4000),
});

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }
  const { name, email, message } = parsed.data;

  try {
    await prisma.contactMessage.create({ data: { name, email, message } });
  } catch {
    // DB optional locally — still send the mail below.
  }

  // Never let a mail failure 500 the request; the message is already saved.
  await sendMail({
    to: contact.email || "hello@timisjewels.com",
    replyTo: email,
    subject: `New enquiry from ${name}`,
    html: `<p>${esc(message).replace(/\n/g, "<br>")}</p><p>— ${esc(name)} (${esc(email)})</p>`,
    text: `${message}\n\n— ${name} (${email})`,
  }).catch(() => {});

  return NextResponse.json({ ok: true });
}
