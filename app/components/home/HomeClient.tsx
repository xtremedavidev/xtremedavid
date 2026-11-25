/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import projectsData from "@/app/data/projects.cdn.json";
import { CLIENTS, PROFILE, STATS } from "@/app/lib/profile";
import { initSiteMotion } from "@/app/lib/siteMotion";
import CaseStack from "./CaseStack";
import Experience from "./Experience";
import Impact from "./Impact";
import MicroInteractions from "./MicroInteractions";
import { conceptStats } from "./ConceptsLab";
import s from "./home.module.css";

const HeroField = dynamic(() => import("./HeroField"), { ssr: false });
const ConceptRing = dynamic(() => import("./ConceptRing"), { ssr: false });

const FAQ = [
  {
    q: "Do you design, or do you build?",
    a: "Both. I take products from research and UI/UX through design systems to production code in Next.js, React Native and Django. At CareBond I designed ~200 screens and then led the team that built them.",
  },
  {
    q: "Are you open to full-time roles?",
    a: "Yes: product designer, senior UI/UX and design-engineer roles, remote or with relocation. I also take on freelance and contract projects.",
  },
  {
    q: "What time zone do you work in?",
    a: "Yours. I'm flexible on hours and work with teams anywhere, from the US West Coast to Australia. I've worked with teams in Canada, the UK, Switzerland, the US, Mexico and India.",
  },
  {
    q: "What are the concepts?",
    a: "Unsolicited homepages I design and code end to end for companies I admire. They're real, working sites with 3D, motion and interaction, not mockups.",
  },
  {
    q: "How do we get started?",
    a: "Book a 30-minute call or download my résumé. We'll talk through the role or product and agree on scope and a start date.",
  },
];

type BP = { slug: string; title: string; cover: string; appreciations: string };
const num = (v: string) => parseInt(v.replace(/,/g, ""), 10) || 0;

function SectionHead({ n, k, title, children }: { n: string; k: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className={s.sh}>
      <p className={s.shKicker}>
        <span>[{n}]</span> {k}
      </p>
      <h2 className={s.shTitle}>{title}</h2>
      {children && <div className={s.shAside}>{children}</div>}
    </header>
  );
}

export default function HomeClient() {
  const archive = (projectsData as BP[]).slice().sort((a, b) => num(b.appreciations) - num(a.appreciations));
  const rowA = archive.slice(0, 12);
  const rowB = archive.slice(12, 24);
  const { sites, brands } = conceptStats();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
    <main className={s.home}>
      {/* ================= HERO ================= */}
      <section className={s.hero}>
        <HeroField />
        <div className={s.heroGlow} aria-hidden="true" />
        <div className={`${s.wrap} ${s.heroBottom}`}>
          <div className={s.heroLeft}>
            <div className={s.heroBadges}>
              <span className={s.badgeLive}>
                <i /> {PROFILE.openTo}
              </span>
              <span>Remote · any time zone · open to relocation</span>
            </div>
            <h1 className={s.heroTitle}>
              Product designer <span>&amp; full-stack engineer.</span>
            </h1>
            <p className={s.heroSub}>
              I design products and ship the code. 8+ years with TELUS, Tangible Markets, CareBond, AZULIK and 100+ other brands, plus concept sites I build for
              fun.
            </p>
            <div className={s.heroCtas}>
              <Link href="/book" className={s.btnLime} data-cursor="hover">
                Book a call
              </Link>
              <a href={PROFILE.resume} download className={s.btnLine} data-cursor="hover">
                Download résumé ↓
              </a>
              <a href="#work" className={s.btnText} data-cursor="hover">
                See the work ↓
              </a>
            </div>
          </div>
          <div className={s.heroStats}>
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
          </div>
        </div>
        <p className={s.heroHint} aria-hidden="true">
          Move the cursor through the name · click for a shockwave
        </p>
      </section>

      {/* ================= CLIENTS ================= */}
      <section className={s.clients} aria-label="Clients">
        <p className={s.clientsLabel}>Trusted by teams at</p>
        <div className={s.marquee}>
          <div className={s.marqueeTrack}>
            {[...CLIENTS, ...CLIENTS].map((c, i) => (
              <span key={i} aria-hidden={i >= CLIENTS.length}>
                {c}
                <i>✦</i>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= IMPACT ================= */}
      <section className={s.section} id="impact">
        <div className={s.wrap}>
          <SectionHead n="01" k="Proof, not promises" title={<>Design that moved the numbers.</>}>
            <p>Outcomes from real client work, straight from my résumé.</p>
          </SectionHead>
          <Impact />
        </div>
      </section>

      {/* ================= CONCEPTS ================= */}
      <section className={`${s.section} ${s.sectionLab}`} id="concepts">
        <div className={s.wrap}>
          <SectionHead
            n="02"
            k="Concepts Lab"
            title={
              <>
                Homepages I&apos;d pitch, <span className={s.lime}>designed and coded.</span>
              </>
            }
          >
            <p>
              {sites} live concept sites for {brands} brands I admire: real 3D, motion and interaction. Drag the ring, or let it turn on its own.
            </p>
            <Link href="/concepts" className={s.btnLine} data-cursor="hover">
              All concepts →
            </Link>
          </SectionHead>
        </div>
        <ConceptRing />
      </section>

      {/* ================= WORK ================= */}
      <section className={s.section} id="work">
        <div className={s.wrap}>
          <SectionHead n="03" k="Shipped work" title={<>Live in production, today.</>}>
            <p>Client products I designed and built. Every card has the role, scope and stack, so you don&apos;t need to click through.</p>
          </SectionHead>
          <CaseStack />
        </div>

        <div className={s.archive}>
          <div className={`${s.wrap} ${s.archiveHead}`}>
            <h3>
              From the archive <span>· {archive.length} case studies</span>
            </h3>
            <Link href="/projects" className={s.btnLine} data-cursor="hover">
              Browse all projects →
            </Link>
          </div>
          {[rowA, rowB].map((row, r) => (
            <div key={r} className={s.rail}>
              <div className={`${s.railTrack} ${r ? s.railReverse : ""}`}>
                {[...row, ...row].map((p, i) => (
                  <Link key={`${p.slug}-${i}`} href={`/work/${p.slug}`} className={s.railItem} aria-hidden={i >= row.length} tabIndex={i >= row.length ? -1 : undefined} data-cursor="hover">
                    <img src={p.cover} alt={p.title} loading="lazy" />
                    <span>
                      {p.title}
                      <em>♥ {p.appreciations}</em>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= EXPERIENCE ================= */}
      <section className={s.section} id="experience">
        <div className={s.wrap}>
          <SectionHead n="04" k="Experience" title={<>8+ years, 100+ brands, five continents.</>}>
            <p>Most recent first. The full résumé is one click away.</p>
            <a href={PROFILE.resume} download className={s.btnLime} data-cursor="hover">
              Download résumé ↓
            </a>
          </SectionHead>
          <Experience />
        </div>
      </section>

      {/* ================= INTERACTION LAB ================= */}
      <section className={`${s.section} ${s.sectionLab}`} id="interactions">
        <div className={s.wrap}>
          <SectionHead
            n="05"
            k="Interaction lab"
            title={
              <>
                Details you can <span className={s.lime}>touch.</span>
              </>
            }
          >
            <p>Product UI built in code: physics, morphing, gestures, agents. Every card is live. Play with it.</p>
          </SectionHead>
          <MicroInteractions />
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className={s.section}>
        <div className={`${s.wrap} ${s.faqGrid}`}>
          <SectionHead n="06" k="FAQ" title={<>Before you reach out.</>} />
          <div className={s.faqList}>
            {FAQ.map((f, i) => (
              <div key={f.q} className={`${s.faqItem} ${openFaq === i ? s.faqOpen : ""}`}>
                <button className={s.faqQ} onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} data-cursor="hover">
                  <span>{f.q}</span>
                  <i aria-hidden="true" />
                </button>
                <div className={s.faqA}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BOOK ================= */}
      <section className={s.section} id="book">
        <div className={s.wrap}>
          <div className={s.book}>
            <div className={s.bookCopy}>
              <p className={s.shKicker}>
                <span>[07]</span> Book a call
              </p>
              <h2 className={s.shTitle}>30 minutes. Your role or product. My honest take.</h2>
              <p className={s.bookSub}>Any day, any hour, any time zone. Pick what suits you and I&apos;ll send a video link. No prep needed.</p>
              <div className={s.heroCtas}>
                <Link href="/book" className={s.btnLime} data-cursor="hover">
                  Pick a time →
                </Link>
                <a href={PROFILE.resume} download className={s.btnLine} data-cursor="hover">
                  Résumé ↓
                </a>
              </div>
            </div>
            <ul className={s.bookFacts}>
              <li>
                <b>30 min</b>
                <span>Free intro call, video link by email</span>
              </li>
              <li>
                <b>24 / 7</b>
                <span>Any day, any hour, in your own time zone</span>
              </li>
              <li>
                <b>Role or project</b>
                <span>Full-time, contract or a product idea</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
