"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { siteConfig } from "@/content/siteConfig";
import { contact } from "@/content/contact";
import { scrollState, scrollToHash } from "@/lib/store";
import { SOSMark } from "@/components/ui/SOSMark";
import { SoundToggle } from "./SoundToggle";

const SPY_IDS = siteConfig.nav.map((n) => n.href.slice(1));

export function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll-spy: which section sits under the middle of the screen
  useEffect(() => {
    if (!isHome) return;
    const els = SPY_IDS.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
          else setActive((cur) => (cur === e.target.id ? null : cur));
        });
      },
      { rootMargin: "-48% 0px -48% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome]);

  const go = (e: React.MouseEvent, href: string) => {
    if (!isHome) return;
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-700 ease-[var(--ease-film)] ${
        scrolled ? "border-line bg-void/75 backdrop-blur-md" : "border-transparent bg-transparent"
      }`}
    >
      <nav aria-label="Primary" className="gutter flex h-[var(--nav-h)] items-center justify-between">
        <Link
          href="/"
          onClick={(e) => {
            if (!isHome) return;
            e.preventDefault();
            if (scrollState.lenis) scrollState.lenis.scrollTo(0, { duration: 1.8 });
            else window.scrollTo(0, 0);
          }}
          className="-m-2 p-2 text-bone"
          aria-label={`${siteConfig.name} — home`}
        >
          <SOSMark className="h-[13px] w-auto" />
        </Link>

        <div className="flex items-center gap-8 lg:gap-12">
          <ul className="hidden items-center gap-8 md:flex lg:gap-10">
            {siteConfig.nav.map((item) => {
              const isActive = active === item.href.slice(1);
              return (
                <li key={item.href}>
                  <Link
                    href={isHome ? item.href : `/${item.href}`}
                    onClick={(e) => go(e, item.href)}
                    aria-current={isActive ? "location" : undefined}
                    className={`group relative label py-2 transition-colors duration-500 ${
                      isActive ? "text-bone" : "text-bone/60 hover:text-bone"
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`absolute top-1/2 -left-3 h-1 w-1 -translate-y-1/2 rounded-full bg-red transition-transform duration-500 ease-[var(--ease-film)] ${
                        isActive ? "scale-100" : "scale-0 group-hover:scale-100 group-focus-visible:scale-100"
                      }`}
                    />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
          <SoundToggle className="hidden md:flex" />
          <button
            type="button"
            className="label -mr-2 p-2 text-bone md:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </nav>

      <MobileMenu open={open} onClose={() => setOpen(false)} go={go} isHome={isHome} />
    </header>
  );
}

function MobileMenu({
  open,
  onClose,
  go,
  isHome,
}: {
  open: boolean;
  onClose: () => void;
  go: (e: React.MouseEvent, href: string) => void;
  isHome: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    scrollState.lenis?.stop();
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const f = panel.current.querySelectorAll<HTMLElement>("a,button");
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      scrollState.lenis?.start();
      prev?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div
      id="mobile-menu"
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden={!open}
      className="fixed inset-0 z-[70] flex-col bg-void data-[open=true]:flex md:hidden"
      data-open={open}
    >
      <div className="gutter flex h-[var(--nav-h)] items-center justify-between">
        <SOSMark className="h-[13px] w-auto text-bone" />
        <button ref={closeBtn} type="button" className="label -mr-2 p-2" onClick={onClose}>
          Close
        </button>
      </div>
      <ul className="gutter mt-10 flex flex-1 flex-col gap-3">
        {siteConfig.nav.map((item, i) => (
          <li key={item.href} className="overflow-hidden">
            <Link
              href={isHome ? item.href : `/${item.href}`}
              onClick={(e) => {
                go(e, item.href);
                onClose();
              }}
              className="display flex items-baseline gap-4 text-[clamp(2.6rem,13vw,4.5rem)]"
            >
              <span className="mono text-[0.7rem] text-ash">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="gutter flex flex-col gap-6 pb-10">
        <SoundToggle />
        <a
          href={`mailto:${contact.email}`}
          className="text-sm text-bone/80 underline decoration-bone/20 underline-offset-4"
        >
          {contact.email}
        </a>
      </div>
    </div>
  );
}
