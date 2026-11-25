"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import Experience from "@/app/components/home/Experience";
import h from "@/app/components/home/home.module.css";
import { CLIENTS, PROFILE, SKILLS, STATS } from "@/app/lib/profile";
import { initSiteMotion } from "@/app/lib/siteMotion";
import s from "./about.module.css";

/** Portrait that tilts toward the cursor with a moving light. */
function Portrait() {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={s.portrait}
      onPointerMove={(e) => {
        const el = ref.current!;
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        el.style.setProperty("--rx", `${(0.5 - y) * 10}deg`);
        el.style.setProperty("--ry", `${(x - 0.5) * 12}deg`);
        el.style.setProperty("--lx", `${x * 100}%`);
        el.style.setProperty("--ly", `${y * 100}%`);
      }}
      onPointerLeave={() => {
        const el = ref.current!;
        el.style.setProperty("--rx", "0deg");
        el.style.setProperty("--ry", "0deg");
      }}
    >
      <div className={s.portraitInner}>
        <Image src="/images/image.jpeg" alt="David Adebayo" fill priority sizes="(max-width: 900px) 90vw, 460px" />
        <span className={s.portraitLight} />
        <span className={s.portraitTag}>
          <i /> {PROFILE.location} · works worldwide
        </span>
      </div>
    </div>
  );
}

export default function AboutClient() {
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

  return (
    <main className={`${h.home} ${s.page}`}>
      <section className={`${h.wrap} ${s.hero}`}>
        <div className={s.heroText}>
          <p className={h.shKicker}>
            <span>[About]</span> {PROFILE.title}
          </p>
          <h1>
            I design products people trust, <span>then I build them.</span>
          </h1>
          <div className={s.bio}>
            <p>
              I&apos;m David Adebayo, a product designer and full-stack engineer in Lagos with 8+ years taking products from research, UX and design systems to
              production web and mobile apps.
            </p>
            <p>
              I&apos;ve delivered work for 100+ brands across Africa, Europe, North America, Asia and Latin America, including TELUS, Breathe ESG, Tangible Markets,
              SavvyLoans, CareBond and AZULIK. I&apos;m the #1 UI/UX designer in Nigeria on Behance and have been featured 5× in Best of Behance.
            </p>
            <p>I studied Food Engineering at Obafemi Awolowo University and I&apos;m now finishing a B.Sc. in Software Engineering at Miva Open University.</p>
          </div>
          <div className={h.heroCtas}>
            <Link href="/book" className={h.btnLime} data-cursor="hover">
              Book a call
            </Link>
            <a href={PROFILE.resume} download className={h.btnLine} data-cursor="hover">
              Download résumé ↓
            </a>
            <a href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer" className={h.btnText} data-cursor="hover">
              LinkedIn ↗
            </a>
          </div>
        </div>
        <Portrait />
      </section>

      <section className={`${h.wrap} ${s.stats}`}>
        {STATS.map((st) => (
          <div key={st.l}>
            <strong>
              {st.prefix}
              {st.n}
              {st.suffix}
            </strong>
            <span>{st.l}</span>
          </div>
        ))}
      </section>

      <section className={h.section} id="experience">
        <div className={h.wrap}>
          <header className={h.sh}>
            <p className={h.shKicker}>
              <span>[01]</span> Experience
            </p>
            <h2 className={h.shTitle}>Where I&apos;ve worked.</h2>
            <div className={h.shAside}>
              <p>Client and contract engagements, most recent first.</p>
            </div>
          </header>
          <Experience />
        </div>
      </section>

      <section className={h.section}>
        <div className={h.wrap}>
          <header className={h.sh}>
            <p className={h.shKicker}>
              <span>[02]</span> Skills
            </p>
            <h2 className={h.shTitle}>One person, the whole stack.</h2>
            <div className={h.shAside}>
              <p>From research and design systems to the database. Fewer handoffs, faster shipping.</p>
            </div>
          </header>
          <div className={s.skills}>
            {Object.entries(SKILLS).map(([k, list], i) => (
              <div key={k} className={s.skillCol}>
                <p className={s.skillHead}>
                  <span>0{i + 1}</span> {k}
                </p>
                <div className={s.skillList}>
                  {list.map((x) => (
                    <span key={x} data-cursor="hover">
                      {x}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={h.clients} aria-label="Clients">
        <p className={h.clientsLabel}>Brands I&apos;ve worked with</p>
        <div className={h.marquee}>
          <div className={h.marqueeTrack}>
            {[...CLIENTS, ...CLIENTS].map((c, i) => (
              <span key={i} aria-hidden={i >= CLIENTS.length}>
                {c}
                <i>✦</i>
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
