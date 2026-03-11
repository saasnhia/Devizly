import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";

/**
 * POST /api/contact
 * Body: { email: string, message: string }
 * Sends a contact form message to the Devizly team via Resend.
 */
export async function POST(request: Request) {
  const body = await request.json();
  const { email, message } = body as { email: string; message: string };

  if (!email || !message) {
    return NextResponse.json({ error: "Email et message requis" }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Devizly Contact <noreply@devizly.fr>",
      to: "harounchikh71@gmail.com",
      replyTo: email,
      subject: `[Devizly] Question tarifs — ${email}`,
      html: `<p><strong>De :</strong> ${email}</p><p><strong>Message :</strong></p><p>${message.replace(/\n/g, "<br/>")}</p>`,
    });
  } catch {
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
