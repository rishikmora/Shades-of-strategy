"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { siteConfig } from "@/content/siteConfig";
import { scrollToHash } from "@/lib/store";

/** Persistent mobile call to action. Steps aside when the contact form is on screen. */
export function MobileCta() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const targets = ["contact", "ending"].map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    if (!targets.length) return;
    const visible = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)));
        setHidden(visible.size > 0);
      },
      { rootMargin: "0px 0px -20% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  return (
    <div
      className={`fixed inset-x-4 bottom-4 z-40 transition-[opacity,transform] duration-500 ease-[var(--ease-film)] md:hidden ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
      }`}
    >
      <Link
        href={isHome ? "#contact" : "/#contact"}
        onClick={(e) => {
          if (!isHome) return;
          e.preventDefault();
          scrollToHash("#contact", { focus: "#contact-name" });
        }}
        tabIndex={hidden ? -1 : 0}
        aria-hidden={hidden}
        className="flex h-13 items-center justify-between rounded-full border border-bone/15 bg-void/80 pr-2 pl-6 backdrop-blur-md"
      >
        <span className="label flex items-center gap-3 text-bone">
          <span className="h-1.5 w-1.5 rounded-full bg-red" aria-hidden />
          {siteConfig.cta.label}
        </span>
        <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-bone text-void">
          →
        </span>
      </Link>
    </div>
  );
}
