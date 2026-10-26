"use client";

import { useEffect, useState, type ReactNode, type RefObject } from "react";
import { createPortal } from "react-dom";

type Props = {
  host: RefObject<HTMLDivElement | null>;
  links: [string, string][];
  cta: ReactNode;
  cls: { btn: string; panel: string; links: string; foot: string };
  /** viewport width above which the desktop nav takes over */
  bp?: number;
};

/** Mobile-only menu: the toggle sits in the nav, the panel is portalled into the concept root
 *  (the nav uses backdrop-filter, which would otherwise trap a fixed panel inside it). */
export function MobileMenu({ host, links, cta, cls, bp = 760 }: Props) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const onResize = () => { if (window.innerWidth > bp) setOpen(false); };
    const html = document.documentElement, prev = html.style.overflow;
    html.style.overflow = "hidden";
    window.addEventListener("keydown", onKey); window.addEventListener("resize", onResize);
    return () => { html.style.overflow = prev; window.removeEventListener("keydown", onKey); window.removeEventListener("resize", onResize); };
  }, [open, bp]);

  return (
    <>
      <button type="button" className={cls.btn} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="tr-menu" data-open={open ? "" : undefined} onClick={() => setOpen((o) => !o)}>
        <i /><i />
      </button>
      {mounted && host.current && createPortal(
        <div id="tr-menu" className={cls.panel} data-open={open ? "" : undefined} aria-hidden={!open} onClick={(e) => { if ((e.target as HTMLElement).closest("a")) setOpen(false); }}>
          <nav className={cls.links} aria-label="Mobile">
            {links.map(([label, href], i) => <a key={label} href={href} tabIndex={open ? 0 : -1} style={{ transitionDelay: open ? `${0.08 + i * 0.05}s` : "0s" }}>{label}</a>)}
          </nav>
          <div className={cls.foot}>{cta}</div>
        </div>,
        host.current,
      )}
    </>
  );
}
