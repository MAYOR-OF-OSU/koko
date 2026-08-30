import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mail";
import { contact } from "@/lib/nav";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fill in every field." }, { status: 400 });
  }

  try {
    await prisma.contactMessage.create({ data: parsed.data });
  } catch {
    // DB optional locally.
  }

  await sendMail({
    to: contact.phones.length ? "hello@timisjewels.com" : parsed.data.email,
    subject: `New enquiry from ${parsed.data.name}`,
    html: `<p>${parsed.data.message}</p><p>— ${parsed.data.name} (${parsed.data.email})</p>`,
  });

  return NextResponse.json({ ok: true });
}
