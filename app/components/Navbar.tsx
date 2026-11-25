"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PROFILE } from "@/app/lib/profile";
import s from "./site/site.module.css";

const NAV_LINKS = [
  { href: "/#work", label: "Work", match: (p: string) => p.startsWith("/work") },
  { href: "/concepts", label: "Concepts", match: (p: string) => p.startsWith("/concept") },
  { href: "/projects", label: "Projects", match: (p: string) => p === "/projects" },
  { href: "/about", label: "Experience", match: (p: string) => p === "/about" },
  { href: "/contact", label: "Contact", match: (p: string) => p === "/contact" },
];

export default function Navbar() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <>
      <header className={`${s.nav} ${scrolled ? s.navScrolled : ""}`}>
        <Link href="/" className={s.navBrand} data-cursor="hover" aria-label="David Adebayo, home">
          <span className={s.navMark}>DA</span>
          <span className={s.navName}>
            David Adebayo
            <small>
              <i /> {PROFILE.openTo}
            </small>
          </span>
        </Link>

        <nav className={s.navLinks} aria-label="Main">
          {NAV_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={l.match(pathname) ? s.navActive : ""} data-cursor="hover">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className={s.navRight}>
          <span className={s.navProgress} aria-hidden="true">
            {String(progress).padStart(2, "0")}%
          </span>
          <a href={PROFILE.resume} download className={s.navGhost} data-cursor="hover">
            Résumé <span aria-hidden="true">↓</span>
          </a>
          <Link href="/book" className={s.navCta} data-cursor="hover">
            Book a call
          </Link>
          <button className={`${s.burger} ${open ? s.burgerOpen : ""}`} onClick={() => setOpen((o) => !o)} aria-label="Menu" aria-expanded={open}>
            <span />
            <span />
          </button>
        </div>
      </header>

      <div className={`${s.sheet} ${open ? s.sheetOpen : ""}`} aria-hidden={!open}>
        <nav>
          {NAV_LINKS.map((l, i) => (
            <Link key={l.href} href={l.href} style={{ transitionDelay: open ? `${80 + i * 50}ms` : "0ms" }} onClick={() => setOpen(false)}>
              <span>0{i + 1}</span>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className={s.sheetCtas}>
          <Link href="/book" className={s.navCta} onClick={() => setOpen(false)}>
            Book a call
          </Link>
          <a href={PROFILE.resume} download className={s.navGhost}>
            Download résumé ↓
          </a>
        </div>
      </div>
    </>
  );
}
