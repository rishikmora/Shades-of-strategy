"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/content/siteConfig";
import { contact } from "@/content/contact";
import { scrollToHash } from "@/lib/store";

export function Footer() {
  const isHome = usePathname() === "/";
  return (
    <footer className="gutter relative border-t border-line pt-20 pb-28 md:pb-16">
      <div className="grid gap-14 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p className="display text-[clamp(2.4rem,6vw,6.4rem)]">{siteConfig.name}</p>
          <p className="eyebrow mt-5 pl-[0.1em]">{siteConfig.tagline}</p>
        </div>
        <div className="flex flex-col gap-10 md:items-end">
          <a
            href={`mailto:${contact.email}`}
            className="text-lg text-bone underline decoration-bone/25 underline-offset-[6px] transition-colors hover:decoration-bone"
          >
            {contact.email}
          </a>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={isHome ? item.href : `/${item.href}`}
                    onClick={(e) => {
                      if (!isHome) return;
                      e.preventDefault();
                      scrollToHash(item.href);
                    }}
                    className="label text-bone/60 transition-colors hover:text-bone"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="mt-20 border-t border-line pt-6">
        <span className="mono text-bone/45">{siteConfig.footer.copyright}</span>
      </div>
    </footer>
  );
}
