"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PROFILE } from "@/app/lib/profile";
import s from "./site.module.css";

/** Giant wordmark whose letters lean and lift toward the cursor. */
function Wordmark() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const letters = [...el.querySelectorAll<HTMLSpanElement>("span")];
    let raf = 0;
    let mx = -9999;
    let my = -9999;
    const cur = letters.map(() => 0);
    const loop = () => {
      letters.forEach((l, i) => {
        const r = l.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(mx - cx, my - cy);
        const target = Math.max(0, 1 - d / 420);
        cur[i] += (target - cur[i]) * 0.12;
        const k = cur[i];
        l.style.transform = `translateY(${-k * 18}%) scaleY(${1 + k * 0.22})`;
        l.style.color = k > 0.05 ? `color-mix(in oklab, #c8ff00 ${Math.round(k * 100)}%, #f0ede6)` : "";
      });
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onLeave = () => {
      mx = my = -9999;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    const io = new IntersectionObserver(([en]) => {
      cancelAnimationFrame(raf);
      if (en.isIntersecting) raf = requestAnimationFrame(loop);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);
  return (
    <div ref={ref} className={s.wordmark} aria-hidden="true">
      {"ADEBAYO".split("").map((c, i) => (
        <span key={i}>{c}</span>
      ))}
    </div>
  );
}

export default function Footer() {
  const [copied, setCopied] = useState(false);

  return (
    <footer className={s.footer}>
      <div className={s.footInner}>
        <div className={s.footTop}>
          <div className={s.footPitch}>
            <p className={s.footKicker}>
              <i /> {PROFILE.openTo}
            </p>
            <h2>
              Have a role or a product in mind? <span>Let&apos;s talk.</span>
            </h2>
            <div className={s.footCtas}>
              <Link href="/book" className={s.btnLime} data-cursor="hover">
                Book a 30-min call
              </Link>
              <a href={PROFILE.resume} download className={s.btnLine} data-cursor="hover">
                Download résumé ↓
              </a>
              <button
                className={s.btnLine}
                data-cursor="hover"
                onClick={() => {
                  navigator.clipboard?.writeText(PROFILE.email).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1600);
                }}
              >
                {copied ? "Email copied ✓" : PROFILE.email}
              </button>
            </div>
          </div>

          <div className={s.footCols}>
            <div>
              <h5>Explore</h5>
              <Link href="/#work">Work</Link>
              <Link href="/concepts">Concepts</Link>
              <Link href="/projects">Projects</Link>
              <Link href="/about">Experience</Link>
            </div>
            <div>
              <h5>Connect</h5>
              <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
              <a href={PROFILE.behance} target="_blank" rel="noopener noreferrer">
                Behance ↗
              </a>
              <Link href="/book">Book a call</Link>
              <Link href="/contact">Project brief</Link>
            </div>
            <div>
              <h5>Availability</h5>
              <p className={s.clock}>24 / 7</p>
              <p className={s.footMuted}>Any time zone, any day. Remote or relocation.</p>
            </div>
          </div>
        </div>

        <Wordmark />

        <div className={s.footBottom}>
          <span>© {new Date().getFullYear()} {PROFILE.name}</span>
          <span>Designed in Figma, built in Next.js & Three.js</span>
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} data-cursor="hover">
            Back to top ↑
          </button>
        </div>
      </div>
    </footer>
  );
}
