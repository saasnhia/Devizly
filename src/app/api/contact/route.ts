import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { checkRateLimit } from "@/lib/ratelimit";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * POST /api/contact
 * Body: { email: string, message: string }
 * Sends a contact form message to the Devizly team via Resend.
 */
export async function POST(request: Request) {
  // Rate limiting to prevent spam
  const rateLimitResult = await checkRateLimit(request);
  if (rateLimitResult) return rateLimitResult;

  const body = await request.json();
  const { email, message } = body as { email: string; message: string };

  if (!email || !message) {
    return NextResponse.json({ error: "Email et message requis" }, { status: 400 });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Email invalide" }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: "Message trop long (5000 caractères max)" }, { status: 400 });
  }

  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br/>");

  try {
    await resend.emails.send({
      from: "Devizly Contact <noreply@devizly.fr>",
      to: "contact@nbhc.fr",
      replyTo: email,
      subject: `[Devizly] Question tarifs — ${safeEmail}`,
      html: `<p><strong>De :</strong> ${safeEmail}</p><p><strong>Message :</strong></p><p>${safeMessage}</p>`,
    });
  } catch {
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
