/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import projectsData from "@/app/data/projects.cdn.json";
import h from "@/app/components/home/home.module.css";
import { PROFILE } from "@/app/lib/profile";
import { initSiteMotion } from "@/app/lib/siteMotion";
import s from "./projects.module.css";

type Media = { type: string; src: string | null };
type Project = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  tools: string[];
  published: string;
  appreciations: string;
  views: string;
  cover: string;
  media: Media[];
  mediaCount: number;
};

const num = (v: string) => parseInt(v.replace(/,/g, ""), 10) || 0;
const year = (p: string) => p.match(/\d{4}/)?.[0] ?? "";
const time = (p: string) => Date.parse(p.replace(/(\d)(st|nd|rd|th)/, "$1")) || 0;

const FILTERS: { label: string; keys: string[] }[] = [
  { label: "All", keys: [] },
  { label: "Websites", keys: ["web", "website", "landing"] },
  { label: "SaaS", keys: ["saas"] },
  { label: "Mobile apps", keys: ["mobile", "app design", "ios", "android"] },
  { label: "Dashboards", keys: ["dashboard"] },
  { label: "Crypto & fintech", keys: ["crypto", "fintech", "bank", "nft", "web3"] },
  { label: "Branding", keys: ["brand", "logo", "identity"] },
];

export default function ProjectsPage() {
  const all = projectsData as Project[];
  const [filter, setFilter] = useState(0);
  const [sort, setSort] = useState<"top" | "new">("top");

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const w = window as unknown as Record<string, unknown>;
    const start = () => {
      if (!cleanup) cleanup = initSiteMotion();
    };
    if (w.gsap) start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      cleanup?.();
    };
  }, []);

  const totals = useMemo(() => ({ apps: all.reduce((t, p) => t + num(p.appreciations), 0), views: all.reduce((t, p) => t + num(p.views), 0) }), [all]);

  const list = useMemo(() => {
    const f = FILTERS[filter];
    const hay = (p: Project) => (p.tags.join(" ") + " " + p.title).toLowerCase();
    const out = f.keys.length ? all.filter((p) => f.keys.some((k) => hay(p).includes(k))) : all.slice();
    out.sort((a, b) => (sort === "top" ? num(b.appreciations) - num(a.appreciations) : time(b.published) - time(a.published)));
    return out;
  }, [all, filter, sort]);

  return (
    <main className={`${h.home} ${s.page}`}>
      <div className={h.wrap}>
        <header className={h.sh}>
          <p className={h.shKicker}>
            <span>[Archive]</span> {all.length} case studies · {totals.apps.toLocaleString()} appreciations · {Math.round(totals.views / 1000)}K views
          </p>
          <h1 className={h.shTitle}>
            Every project, <span className={h.lime}>at a glance.</span>
          </h1>
          <div className={h.shAside}>
            <p>The screens are right here: scroll sideways through each project. Open a case study only if you want the full story.</p>
            <a href={PROFILE.behance} target="_blank" rel="noopener noreferrer" className={h.btnLine} data-cursor="hover">
              Behance profile ↗
            </a>
          </div>
        </header>

        <div className={s.bar}>
          <div className={s.filters}>
            {FILTERS.map((f, i) => (
              <button key={f.label} className={filter === i ? s.on : ""} onClick={() => setFilter(i)} data-cursor="hover">
                {f.label}
              </button>
            ))}
          </div>
          <div className={s.sort}>
            <button className={sort === "top" ? s.on : ""} onClick={() => setSort("top")} data-cursor="hover">
              Most appreciated
            </button>
            <button className={sort === "new" ? s.on : ""} onClick={() => setSort("new")} data-cursor="hover">
              Newest
            </button>
          </div>
        </div>

        <ol className={s.list}>
          {list.map((p, i) => {
            const imgs = p.media.filter((m) => m.type === "image" && m.src).slice(0, 6);
            const shots = imgs.length ? imgs : [{ type: "image", src: p.cover }];
            return (
              <li key={p.slug} className={s.row}>
                <div className={s.meta}>
                  <span className={s.idx}>{String(i + 1).padStart(2, "0")}</span>
                  <h2>{p.title}</h2>
                  <p className={s.sub}>
                    {year(p.published)} · ♥ {p.appreciations} · {p.views} views
                  </p>
                  <div className={h.chipsRow}>
                    {p.tags.slice(0, 4).map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                  <Link href={`/work/${p.slug}`} className={s.open} data-cursor="hover">
                    Full case study · {p.mediaCount} frames →
                  </Link>
                </div>
                <div className={s.strip}>
                  {shots.map((m, k) => (
                    <Link key={k} href={`/work/${p.slug}`} className={`${s.shot} ${k === 0 ? s.shotFirst : ""}`} data-cursor="hover">
                      <img src={m.src!} alt={k === 0 ? p.title : ""} loading={i < 3 ? "eager" : "lazy"} />
                    </Link>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
