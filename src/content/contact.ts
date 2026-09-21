/**
 * CONTACT — email, contact copy and the enquiry form.
 *
 * Editing guide
 * - Change `email` once; it updates the contact section, footer, form and SEO data.
 * - `needs` are the options under "What do you need?".
 * - Only add real contact details. Leave optional fields as `undefined`.
 */

export const contact = {
  email: "shadesofstrategy@gmail.com",

  /** Optional. International format without "+" or spaces, e.g. "919876543210". */
  whatsapp: undefined as string | undefined,

  headline: ["READY TO MAKE", "IT MEAN *SOMETHING?*"],
  close: "LET’S CREATE.",

  primaryCta: "Start a project",
  secondaryCta: "Email us",

  form: {
    title: "Start a project",
    nameLabel: "Name",
    replyLabel: "Email / WhatsApp",
    needsLabel: "What do you need?",
    ideaLabel: "Tell us about your idea",
    submit: "Let’s talk",
    sending: "Sending",
    success: "Received. We’ll be in touch shortly.",
    mailtoFallback: "Your email app is opening with your message.",
    error: "Something went wrong. Please email us directly.",
  },

  needs: [
    "Photography",
    "Videography",
    "Video Editing",
    "Event Coverage",
    "Web",
    "App",
    "Motion",
    "Complete Package",
  ],
};

export type Contact = typeof contact;
