"use client";

import { useEffect, useId, useState } from "react";
import { contact } from "@/content/contact";
import { selectedNeed, selectedPackage } from "@/lib/store";

type Status = "idle" | "sending" | "sent" | "mailto" | "error";

function mailtoHref(data: { name: string; reply: string; needs: string[]; idea: string }) {
  const subject = `New project — ${data.name || "Shades of Strategy"}`;
  const body = [
    `Name: ${data.name}`,
    `Reply to: ${data.reply}`,
    `Needs: ${data.needs.join(", ") || "—"}`,
    "",
    data.idea,
  ].join("\n");
  return `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const field =
  "peer w-full border-0 border-b border-bone/20 bg-transparent px-0 pt-2 pb-3 text-lg text-bone placeholder:text-bone/25 transition-colors duration-500 focus:border-bone focus:outline-none focus-visible:outline-none";

/**
 * Deliberately simple: four questions, one button.
 * Sends through /api/contact when an email provider is configured;
 * otherwise opens the visitor's email app with everything filled in.
 */
export function ContactForm() {
  const f = contact.form;
  const uid = useId();
  const [needs, setNeeds] = useState<string[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [idea, setIdea] = useState("");

  // Prefill from a chosen package or service
  useEffect(() => {
    const offPkg = selectedPackage.subscribe((pkg) => {
      if (!pkg) return;
      if (/complete/i.test(pkg)) setNeeds((n) => (n.includes("Complete Package") ? n : [...n, "Complete Package"]));
      setIdea((cur) => (cur.trim() ? cur : `I'm interested in the ${pkg} package.`));
    });
    const offNeed = selectedNeed.subscribe((need) => {
      if (need) setNeeds((n) => (n.includes(need) ? n : [...n, need]));
    });
    return () => {
      offPkg();
      offNeed();
    };
  }, []);

  const toggle = (n: string) => setNeeds((cur) => (cur.includes(n) ? cur.filter((x) => x !== n) : [...cur, n]));

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      reply: String(data.get("reply") ?? "").trim(),
      needs,
      idea: idea.trim(),
      company: String(data.get("company") ?? ""), // honeypot
    };
    if (!payload.name || !payload.reply) {
      setStatus("error");
      setMessage("Please add your name and a way to reach you.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setStatus("sent");
        setMessage(f.success);
        form.reset();
        setNeeds([]);
        setIdea("");
        return;
      }
      if (res.status === 501) {
        // No email provider configured: hand over to the visitor's email app.
        window.location.href = mailtoHref(payload);
        setStatus("mailto");
        setMessage(f.mailtoFallback);
        return;
      }
      throw new Error(String(res.status));
    } catch {
      setStatus("error");
      setMessage(f.error);
    }
  }

  const sent = status === "sent";

  return (
    <form
      id="contact-form"
      onSubmit={onSubmit}
      noValidate
      aria-describedby={`${uid}-status`}
      className="scroll-mt-28"
    >
      <fieldset disabled={status === "sending"} className="grid gap-12">
        <legend className="sr-only">{f.title}</legend>

        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="label text-bone/60">
              {f.nameLabel}
            </label>
            <input id="contact-name" name="name" type="text" autoComplete="name" required className={field} />
          </div>
          <div>
            <label htmlFor="contact-reply" className="label text-bone/60">
              {f.replyLabel}
            </label>
            <input
              id="contact-reply"
              name="reply"
              type="text"
              inputMode="email"
              autoComplete="email"
              required
              className={field}
            />
          </div>
        </div>

        <div role="group" aria-labelledby={`${uid}-needs`}>
          <p id={`${uid}-needs`} className="label mb-5 text-bone/60">
            {f.needsLabel}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {contact.needs.map((n) => {
              const on = needs.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(n)}
                  className={`flex items-center gap-2.5 rounded-full border px-4 py-2.5 text-sm transition-[background-color,border-color,color] duration-500 ease-[var(--ease-film)] ${
                    on ? "border-bone bg-bone text-void" : "border-bone/20 text-bone/75 hover:border-bone/60 hover:text-bone"
                  }`}
                >
                  <span
                    aria-hidden
                    className={`h-1.5 w-1.5 rounded-full transition-colors ${on ? "bg-red" : "bg-bone/25"}`}
                  />
                  {n}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label htmlFor="contact-idea" className="label text-bone/60">
            {f.ideaLabel}
          </label>
          <textarea
            id="contact-idea"
            name="idea"
            rows={4}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            className={`${field} resize-none`}
          />
        </div>

        {/* honeypot — hidden from people, visible to bots */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${uid}-company`}>Company</label>
          <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
          <button
            type="submit"
            className="group relative inline-flex items-center gap-5 overflow-hidden rounded-full bg-bone py-5 pr-5 pl-8 text-void transition-transform duration-500 ease-[var(--ease-film)] hover:scale-[1.02] disabled:opacity-60"
          >
            <span className="label text-[0.75rem]">{status === "sending" ? f.sending : f.submit}</span>
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-full bg-void text-bone transition-transform duration-500 group-hover:translate-x-1"
            >
              →
            </span>
          </button>
          <p
            id={`${uid}-status`}
            role="status"
            aria-live="polite"
            className={`max-w-sm text-sm ${status === "error" ? "text-[#ff6b7d]" : "text-bone/70"}`}
          >
            {sent || status === "mailto" || status === "error" ? message : ""}
          </p>
        </div>
      </fieldset>
    </form>
  );
}
