"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { conceptGroups } from "@/app/lib/concepts";
import s from "./conceptNav.module.css";

/**
 * Small floating bar on every concept page so visitors are never stranded:
 * back to the portfolio, all concepts, and the next concept.
 * Hides while scrolling down, comes back on scroll up.
 */
export default function ConceptNav({ id }: { id: string }) {
  const [hidden, setHidden] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const groups = conceptGroups();
  const gi = groups.findIndex((g) => g.versions.some((v) => v.id === id));
  const next = groups[(gi + 1) % groups.length];
  const nextId = next.versions[0].id;

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 200);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (collapsed) {
    return (
      <button className={`${s.pill} ${s.mini}`} onClick={() => setCollapsed(false)} aria-label="Show portfolio navigation">
        <span className={s.dot} /> DA
      </button>
    );
  }

  return (
    <nav className={`${s.pill} ${hidden ? s.hidden : ""}`} aria-label="Portfolio">
      <Link href="/" className={s.home}>
        <span className={s.dot} /> David Adebayo
      </Link>
      <span className={s.sep} />
      <Link href="/concepts" className={s.link}>
        All concepts
      </Link>
      <span className={s.count}>
        {String(gi + 1).padStart(2, "0")}/{String(groups.length).padStart(2, "0")}
      </span>
      <Link href={`/concept/${nextId}`} className={s.next}>
        Next: {next.brand} →
      </Link>
      <button className={s.close} onClick={() => setCollapsed(true)} aria-label="Minimise">
        ×
      </button>
    </nav>
  );
}
