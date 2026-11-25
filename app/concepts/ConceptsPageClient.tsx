"use client";

import Link from "next/link";
import { useEffect } from "react";
import ConceptsLab, { conceptStats } from "@/app/components/home/ConceptsLab";
import { initSiteMotion } from "@/app/lib/siteMotion";
import s from "@/app/components/home/home.module.css";

export default function ConceptsPageClient() {
  const { sites, brands } = conceptStats();

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
    <main className={`${s.home} ${s.pageTop}`}>
      <section className={s.sectionLab} style={{ paddingBottom: 120 }}>
        <div className={s.wrap}>
          <header className={s.sh}>
            <p className={s.shKicker}>
              <span>[Lab]</span> Concepts · {sites} live sites · {brands} brands
            </p>
            <h1 className={s.shTitle}>
              Homepages I&apos;d <span className={s.lime}>pitch.</span>
            </h1>
            <div className={s.shAside}>
              <p>
                Each one is an unsolicited homepage I designed and coded end to end for a company I admire: real 3D, motion and interaction, not mockups. Not
                affiliated with the brands.
              </p>
              <Link href="/book" className={s.btnLime} data-cursor="hover">
                Book a call
              </Link>
            </div>
          </header>
          <ConceptsLab showNextDrop />
        </div>
      </section>
    </main>
  );
}
