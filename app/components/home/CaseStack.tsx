"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import s from "./home.module.css";

type Case = {
  name: string;
  url: string;
  host: string;
  image: string;
  /** "screen" = a straight website screenshot, shown inside a browser frame. "mockup" = device mockup, shown bare. */
  kind: "screen" | "mockup";
  /** image width / height */
  ratio: number;
  role: string;
  years: string;
  sector: string;
  summary: string;
  points: string[];
  stack: string[];
};

const CASES: Case[] = [
  {
    name: "CareBond",
    url: "https://www.carebond.ch/en",
    host: "carebond.ch",
    image: "/images/Carebond.png",
    kind: "mockup",
    ratio: 2880 / 2160,
    role: "Product Designer & Engineer",
    years: "2025 – 2026",
    sector: "Healthcare · Switzerland",
    summary: "A care platform for institutions and administrators, designed end to end and built with the team I led.",
    points: ["~200 screens across web platform and mobile app", "Branding, documentation, PDF pipelines and integration specs", "Fully operational in production"],
    stack: ["Figma", "React Native", "Expo", "Next.js", "Django"],
  },
  {
    name: "The Iris",
    url: "https://theiris.io",
    host: "theiris.io",
    image: "/images/Iris.png",
    kind: "mockup",
    ratio: 2880 / 2286,
    role: "Designer & Full-Stack Developer",
    years: "2025 – 2026",
    sector: "Agency · USA",
    summary: "The agency's website, designed and built end to end in Next.js.",
    points: ["Visual direction, UI and responsive layouts", "Built and shipped in Next.js", "Designed and developed solo"],
    stack: ["Figma", "Next.js", "React"],
  },
  {
    name: "AXY Digital",
    url: "https://www.axy.digital/",
    host: "axy.digital",
    image: "/images/axy.png",
    kind: "screen",
    ratio: 3326 / 2062,
    role: "UI/UX Designer & Developer",
    years: "2025 – 2026",
    sector: "Digital marketing",
    summary: "Brand-forward marketing site for an AI search-visibility studio.",
    points: ["Visual direction and UI", "Built and shipped to production"],
    stack: ["Figma", "Framer"],
  },
  {
    name: "Codarket",
    url: "https://www.codarket.com/",
    host: "codarket.com",
    image: "/images/codarket.png",
    kind: "screen",
    ratio: 3332 / 2028,
    role: "UI/UX Designer & Developer",
    years: "2025 – 2026",
    sector: "Marketplace",
    summary: "A digital agency and marketplace presence built around timeless, dark-mode visuals.",
    points: ["Design system and responsive UI", "Built and shipped to production"],
    stack: ["Figma", "Framer"],
  },
  {
    name: "Kevda Bioworks",
    url: "https://kevdabioworks.com",
    host: "kevdabioworks.com",
    image: "/images/kevda.png",
    kind: "screen",
    ratio: 3330 / 2062,
    role: "Website design",
    years: "Client work",
    sector: "Biotech",
    summary: "A clean, scientific site for an mRNA development company: science meets design.",
    points: ["Information architecture for complex science", "Responsive marketing site"],
    stack: ["Figma", "Web"],
  },
  {
    name: "Wonderphone",
    url: "https://www.wondersimple.com/",
    host: "wondersimple.com",
    image: "/images/wonderphone.png",
    kind: "screen",
    ratio: 3320 / 2052,
    role: "Website design",
    years: "Client work",
    sector: "Consumer tech",
    summary: "A bold product marketing site for a consumer phone.",
    points: ["Product storytelling", "Responsive marketing site"],
    stack: ["Figma", "Web"],
  },
];

/**
 * Sticky stacked case studies. Each panel pins, then gets pushed back and
 * dimmed as the next one slides over it. All facts are on the card, so
 * nobody has to click through to understand the work.
 */
export default function CaseStack() {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const cards = [...list.querySelectorAll<HTMLElement>("[data-case]")];
    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = innerHeight;
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        const nr = next.getBoundingClientRect();
        // progress of the next card covering this one: 0 when next is at bottom, 1 when it reaches the top
        const p = Math.min(1, Math.max(0, 1 - (nr.top - 100) / (vh - 100)));
        const inner = card.firstElementChild as HTMLElement;
        inner.style.transform = `scale(${1 - p * 0.06}) translateY(${-p * 24}px)`;
        inner.style.filter = `brightness(${1 - p * 0.45})`;
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={listRef} className={s.cases}>
      {CASES.map((c, i) => (
        <article key={c.name} className={s.caseSticky} data-case="" style={{ top: `${92 + i * 14}px` }}>
          <div className={s.case}>
            <div className={s.caseInfo}>
              <div className={s.caseTop}>
                <span className={s.caseIdx}>{String(i + 1).padStart(2, "0")}</span>
                <span>{c.sector}</span>
              </div>
              <h3>{c.name}</h3>
              <p className={s.caseRole}>
                {c.role} · {c.years}
              </p>
              <p className={s.caseSummary}>{c.summary}</p>
              <ul className={s.casePoints}>
                {c.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <div className={s.caseFoot}>
                <div className={s.chipsRow}>
                  {c.stack.map((t) => (
                    <span key={t}>{t}</span>
                  ))}
                </div>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className={s.caseLink} data-cursor="hover">
                  Visit live site ↗
                </a>
              </div>
            </div>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`${s.caseShot} ${c.kind === "mockup" ? s.caseMock : ""}`}
              data-cursor="hover"
              aria-label={`Open ${c.name}`}
            >
              {c.kind === "screen" && (
                <div className={s.browserBar}>
                  <i />
                  <i />
                  <i />
                  <span>{c.host}</span>
                </div>
              )}
              <div className={s.caseImg} style={{ aspectRatio: String(c.ratio) }}>
                <Image src={c.image} alt={`${c.name} website`} fill sizes="(max-width: 900px) 100vw, 760px" />
              </div>
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
