"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { conceptGroups, concepts, posterOf, type ConceptGroup } from "@/app/lib/concepts";
import s from "./home.module.css";

export function conceptStats() {
  return { sites: concepts.length, brands: conceptGroups().length };
}

/** Grid of concept cards (used on /concepts). */
export default function ConceptsLab({ showNextDrop = false }: { showNextDrop?: boolean }) {
  const groups = conceptGroups();
  return (
    <div className={s.ccGrid}>
      {groups.map((g, i) => (
        <ConceptCard key={g.key} group={g} index={i + 1} featured={i === 0} />
      ))}
      {showNextDrop && (
        <div className={`${s.cc} ${s.ccNext}`}>
          <span className={s.ccNextPulse} />
          <p className={s.mono}>Concept {String(groups.length + 1).padStart(2, "0")} · in progress</p>
          <h3>
            Next drop is <span className={s.lime}>in the lab.</span>
          </h3>
          <p>A new concept site lands every few weeks. Want your brand to be next?</p>
          <Link href="/book" className={s.btnLime} data-cursor="hover">
            Book a call →
          </Link>
        </div>
      )}
    </div>
  );
}

function ConceptCard({ group, index, featured }: { group: ConceptGroup; index: number; featured: boolean }) {
  const [v, setV] = useState(0);
  const c = group.versions[v];
  const media = useRef<HTMLAnchorElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const href = `/concept/${c.id}`;

  return (
    <article
      className={`${s.cc} ${featured ? s.ccFeatured : ""}`}
      onMouseEnter={() => vid.current?.play().catch(() => {})}
      onMouseLeave={() => vid.current?.pause()}
      onMouseMove={(e) => {
        const el = media.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
    >
      <a ref={media} href={href} target="_blank" rel="noopener" className={s.ccMedia} data-cursor="hover" aria-label={`Open the ${group.brand} concept`}>
        {group.versions.map((ver, i) => (
          <Image
            key={ver.id}
            src={posterOf(ver)}
            alt={`${ver.showcase.brand} concept homepage`}
            fill
            sizes={featured ? "(max-width: 900px) 100vw, 1000px" : "(max-width: 900px) 100vw, 640px"}
            className={`${s.ccPoster} ${i === v ? s.ccPosterOn : ""}`}
            priority={featured && i === 0}
          />
        ))}
        {c.showcase.video && <video key={c.id} ref={vid} className={s.ccVideo} src={c.showcase.video} poster={posterOf(c)} muted loop playsInline preload="metadata" />}
        <span className={s.ccLaunch} aria-hidden="true">
          Open ↗
        </span>
        <span className={s.ccIndex}>{String(index).padStart(2, "0")}</span>
      </a>
      <div className={s.ccBody}>
        <p className={s.mono}>
          {c.showcase.industry} · {c.showcase.year}
        </p>
        <h3>{group.brand}</h3>
        <p className={s.ccPitch}>{c.showcase.pitch}</p>
        <div className={s.chipsRow}>
          {c.showcase.techniques.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <div className={s.ccActions}>
          {group.versions.length > 1 && (
            <div className={s.ccSwitch} role="tablist" aria-label="Version">
              {group.versions.map((ver, i) => (
                <button key={ver.id} role="tab" aria-selected={i === v} className={i === v ? s.ccSwitchOn : ""} onClick={() => setV(i)} data-cursor="hover">
                  {ver.variant ?? `V${i + 1}`}
                </button>
              ))}
            </div>
          )}
          <a href={href} target="_blank" rel="noopener" className={s.btnLime} data-cursor="hover">
            Launch site ↗
          </a>
        </div>
      </div>
    </article>
  );
}
