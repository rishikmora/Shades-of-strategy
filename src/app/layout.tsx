import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/content/siteConfig";
import { contact } from "@/content/contact";
import { services } from "@/content/services";
import { packages, currency } from "@/content/packages";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { Nav } from "@/components/layout/Nav";
import { MobileCta } from "@/components/layout/MobileCta";

const sans = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.seo.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.seo.description,
  keywords: [...siteConfig.seo.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: siteConfig.name,
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.seo.title,
    description: siteConfig.seo.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

function jsonLd() {
  const url = siteConfig.url;
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: siteConfig.name,
        alternateName: siteConfig.shortName,
        url,
        email: `mailto:${contact.email}`,
        logo: `${url}/icon.svg`,
        description: siteConfig.seo.description,
        slogan: siteConfig.tagline,
        knowsAbout: services.map((s) => s.name),
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          email: contact.email,
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Packages",
          itemListElement: packages.map((p) => ({
            "@type": "Offer",
            name: p.name,
            price: p.price,
            priceCurrency: currency.code,
            description: p.includes.join(", "),
          })),
        },
      },
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: siteConfig.name,
        description: siteConfig.seo.description,
        publisher: { "@id": `${url}/#organization` },
        inLanguage: "en",
      },
    ],
  };
  return JSON.stringify(data).replace(/</g, "\u003c");
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
        <a
          href="#main"
          className="sr-only-focusable fixed top-3 left-3 z-[100] label bg-bone px-4 py-3 text-void"
        >
          Skip to content
        </a>
        <SmoothScroll>
          <Nav />
          <main id="main">{children}</main>
          <MobileCta />
        </SmoothScroll>
        <div className="grain" aria-hidden />
      </body>
    </html>
  );
}
