import { contact } from "@/content/contact";

/**
 * Contact form endpoint.
 *
 * To receive enquiries by email, set RESEND_API_KEY (https://resend.com) and,
 * optionally, CONTACT_FROM (a verified sender, e.g. "SOS <hello@yourdomain.com>").
 * Without a key this returns 501 and the form falls back to the visitor's
 * email app, so nothing is ever lost.
 */

type Payload = {
  name?: unknown;
  reply?: unknown;
  needs?: unknown;
  idea?: unknown;
  company?: unknown;
};

const clean = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return Response.json({ ok: false, error: "Invalid request" }, { status: 400 });
  }

  // Bots fill the hidden field; pretend all is well.
  if (clean(body.company, 200)) return Response.json({ ok: true });

  const name = clean(body.name, 120);
  const reply = clean(body.reply, 200);
  const idea = clean(body.idea, 5000);
  const needs = Array.isArray(body.needs)
    ? body.needs.filter((n): n is string => typeof n === "string" && contact.needs.includes(n))
    : [];

  if (!name || !reply) {
    return Response.json({ ok: false, error: "Name and contact are required" }, { status: 422 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    return Response.json({ ok: false, error: "Email delivery is not configured" }, { status: 501 });
  }

  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply);
  const html = `
    <h2>New project enquiry</h2>
    <p><strong>Name:</strong> ${escape(name)}</p>
    <p><strong>Email / WhatsApp:</strong> ${escape(reply)}</p>
    <p><strong>Needs:</strong> ${escape(needs.join(", ") || "—")}</p>
    <p><strong>Idea:</strong><br/>${escape(idea).replace(/\n/g, "<br/>")}</p>
  `;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Shades of Strategy <onboarding@resend.dev>",
      to: [contact.email],
      subject: `New project — ${name}`,
      html,
      ...(isEmail ? { reply_to: reply } : {}),
    }),
  });

  if (!res.ok) {
    return Response.json({ ok: false, error: "Could not send" }, { status: 502 });
  }
  return Response.json({ ok: true });
}
