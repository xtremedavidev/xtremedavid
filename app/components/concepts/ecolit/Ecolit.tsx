"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Michroma, Montserrat } from "next/font/google";
import s from "./ecolit.module.css";
import ConceptBadge from "../ConceptBadge";
import { initEcolitMotion } from "./motion";

const michroma = Michroma({ subsets: ["latin"], weight: "400", variable: "--font-michroma" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-montserrat" });
const cx = (...names: string[]) => names.map((n) => s[n]).filter(Boolean).join(" ");

export default function Ecolit() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled && root.current) cleanup = initEcolitMotion(root.current, s);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, { scope: root });

  return (
    <div ref={root} className={`${s.root} ${michroma.variable} ${montserrat.variable}`}>
      <div className={s.progress} aria-hidden="true" />

      <header className={s.nav} data-nav="">
        <a className={s.nav__logo} href="#top" aria-label="ECOLIT home">
          <img src="/concepts/ecolit/logo.svg" alt="ECOLIT — ECOLIT construction system" loading="eager" />
        </a>
        <span className={cx("nav__tag", "lab")}>Cold-formed steel · ECO-concrete</span>
        <nav className={s.nav__links}>
          <a href="#reality">Technologies</a>
          <a href="#portal">Partner portal</a>
          <a href="#network">Network</a>
          <a href="#partnership">Partnership</a>
        </nav>
        <a className={s.nav__cta} data-magnetic="" href="#partnership">Contact</a>
      </header>

      <main id="top">
        {/* 01 HERO */}
        <section className={cx("hero", "wrap")} data-section="hero">
          <i className={cx("hr", "hero__rule")} data-rule="" />
          <span className={s.lab}>(01) — Global construction system</span>
          <h1 className={s.statement} data-statement="">
            <span className={s.ln}>Heavy construction</span>
            <span className={cx("ln", "in1")}>is slow and wasteful.</span>
            <span className={s.ln}>We build homes from</span>
            <span className={cx("ln", "in2")}><span className={s.acc}>light steel</span> — anywhere.</span>
          </h1>
          <svg className={s.iso} data-iso="hero" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1117 1056" fill="none" strokeLinecap="round">
            <path data-layer="slab" d="M448.0 462.2L933.0 742.2M933.0 742.2L569.2 952.2M569.2 952.2L84.2 672.2M84.2 672.2L448.0 462.2M448.0 476.2L933.0 756.2M933.0 756.2L569.2 966.2M569.2 966.2L84.2 686.2M84.2 686.2L448.0 476.2M448.0 462.2L448.0 476.2M933.0 742.2L933.0 756.2M569.2 952.2L569.2 966.2M84.2 672.2L84.2 686.2" stroke="#0F1210" strokeWidth="1" />
            <path data-layer="gf" d="M448.0 462.2L933.0 742.2M448.0 266.2L933.0 546.2M448.0 462.2L448.0 266.2M484.4 483.2L484.4 287.2M520.7 504.2L520.7 308.2M557.1 525.2L557.1 329.2M593.5 546.2L593.5 350.2M629.8 567.2L629.8 371.2M666.2 588.2L666.2 392.2M702.6 609.2L702.6 413.2M739.0 630.2L739.0 434.2M775.3 651.2L775.3 455.2M811.7 672.2L811.7 476.2M848.1 693.2L848.1 497.2M884.5 714.2L884.5 518.2M920.8 735.2L920.8 539.2M448.0 378.2L933.0 658.2M933.0 742.2L569.2 952.2M933.0 546.2L569.2 756.2M933.0 742.2L933.0 546.2M896.6 763.2L896.6 567.2M860.2 784.2L860.2 588.2M823.8 805.2L823.8 609.2M787.5 826.2L787.5 763.2M787.5 679.2L787.5 630.2M751.1 847.2L751.1 784.2M751.1 700.2L751.1 651.2M714.7 868.2L714.7 805.2M714.7 721.2L714.7 672.2M678.3 889.2L678.3 693.2M642.0 910.2L642.0 714.2M605.6 931.2L605.6 735.2M569.2 952.2L569.2 756.2M805.6 752.7L696.5 815.7M805.6 668.7L696.5 731.7M805.6 815.7L805.6 619.7M696.5 878.7L696.5 682.7M569.2 952.2L84.2 672.2M569.2 756.2L84.2 476.2M569.2 952.2L569.2 756.2M532.8 931.2L532.8 735.2M496.5 910.2L496.5 714.2M460.1 742.2L460.1 693.2M423.7 868.2L423.7 672.2M387.4 847.2L387.4 651.2M351.0 826.2L351.0 630.2M314.6 805.2L314.6 742.2M314.6 658.2L314.6 609.2M278.2 784.2L278.2 721.2M278.2 637.2L278.2 588.2M241.9 763.2L241.9 700.2M241.9 616.2L241.9 567.2M205.5 742.2L205.5 546.2M169.1 721.2L169.1 525.2M132.7 700.2L132.7 504.2M96.4 679.2L96.4 483.2M496.5 763.2L435.9 728.2M496.5 910.2L496.5 714.2M435.9 875.2L435.9 679.2M351.0 763.2L229.7 693.2M351.0 679.2L229.7 609.2M351.0 826.2L351.0 630.2M229.7 756.2L229.7 560.2M84.2 672.2L448.0 462.2M84.2 476.2L448.0 266.2M84.2 672.2L84.2 476.2M120.6 651.2L120.6 455.2M157.0 630.2L157.0 434.2M193.4 609.2L193.4 413.2M229.7 588.2L229.7 392.2M266.1 567.2L266.1 371.2M302.5 546.2L302.5 350.2M338.9 525.2L338.9 329.2M375.2 504.2L375.2 308.2M411.6 483.2L411.6 287.2M448.0 462.2L448.0 266.2M84.2 588.2L448.0 378.2" stroke="#0F1210" strokeWidth="1" />
            <path data-layer="floor" d="M448.0 266.2L84.2 476.2M484.4 287.2L120.6 497.2M520.7 308.2L157.0 518.2M557.1 329.2L193.4 539.2M593.5 350.2L229.7 560.2M629.8 371.2L266.1 581.2M666.2 392.2L302.5 602.2M702.6 413.2L338.9 623.2M739.0 434.2L375.2 644.2M775.3 455.2L411.6 665.2M811.7 476.2L448.0 686.2M848.1 497.2L484.4 707.2M884.5 518.2L520.7 728.2M920.8 539.2L557.1 749.2M448.0 252.2L933.0 532.2M84.2 462.2L569.2 742.2M448.0 252.2L84.2 462.2" stroke="#0F1210" strokeWidth="1" />
            <path data-layer="ff" d="M448.0 252.2L933.0 532.2M448.0 56.2L933.0 336.2M448.0 252.2L448.0 56.2M484.4 273.2L484.4 77.2M520.7 294.2L520.7 98.2M557.1 315.2L557.1 119.2M593.5 336.2L593.5 140.2M629.8 357.2L629.8 161.2M666.2 378.2L666.2 182.2M702.6 399.2L702.6 203.2M739.0 420.2L739.0 224.2M775.3 441.2L775.3 245.2M811.7 462.2L811.7 266.2M848.1 483.2L848.1 287.2M884.5 504.2L884.5 308.2M920.8 525.2L920.8 329.2M448.0 168.2L933.0 448.2M933.0 532.2L569.2 742.2M933.0 336.2L569.2 546.2M933.0 532.2L933.0 336.2M896.6 553.2L896.6 357.2M860.2 574.2L860.2 378.2M823.8 595.2L823.8 399.2M787.5 616.2L787.5 560.2M787.5 469.2L787.5 420.2M751.1 637.2L751.1 581.2M751.1 490.2L751.1 441.2M714.7 658.2L714.7 602.2M714.7 511.2L714.7 462.2M678.3 679.2L678.3 483.2M642.0 700.2L642.0 504.2M605.6 721.2L605.6 525.2M569.2 742.2L569.2 546.2M805.6 549.7L696.5 612.7M805.6 458.7L696.5 521.7M805.6 605.7L805.6 409.7M696.5 668.7L696.5 472.7M569.2 742.2L84.2 462.2M569.2 546.2L84.2 266.2M569.2 742.2L569.2 546.2M532.8 721.2L532.8 525.2M496.5 700.2L496.5 644.2M496.5 553.2L496.5 504.2M460.1 679.2L460.1 623.2M460.1 532.2L460.1 483.2M423.7 658.2L423.7 602.2M423.7 511.2L423.7 462.2M387.4 637.2L387.4 441.2M351.0 616.2L351.0 420.2M314.6 595.2L314.6 399.2M278.2 574.2L278.2 518.2M278.2 427.2L278.2 378.2M241.9 553.2L241.9 497.2M241.9 406.2L241.9 357.2M205.5 532.2L205.5 476.2M205.5 385.2L205.5 336.2M169.1 511.2L169.1 315.2M132.7 490.2L132.7 294.2M96.4 469.2L96.4 273.2M508.6 651.2L387.4 581.2M508.6 560.2L387.4 490.2M508.6 707.2L508.6 511.2M387.4 637.2L387.4 441.2M290.4 525.2L169.1 455.2M290.4 434.2L169.1 364.2M290.4 581.2L290.4 385.2M169.1 511.2L169.1 315.2M84.2 462.2L448.0 252.2M84.2 266.2L448.0 56.2M84.2 462.2L84.2 266.2M120.6 441.2L120.6 245.2M157.0 420.2L157.0 224.2M193.4 399.2L193.4 203.2M229.7 378.2L229.7 182.2M266.1 357.2L266.1 161.2M302.5 336.2L302.5 140.2M338.9 315.2L338.9 119.2M375.2 294.2L375.2 98.2M411.6 273.2L411.6 77.2M448.0 252.2L448.0 56.2M84.2 378.2L448.0 168.2" stroke="#00CB14" strokeWidth="1.6" />
            <path data-layer="roof" d="M448.0 56.2L84.2 266.2M472.2 58.4L266.1 40.0M266.1 40.0L60.0 296.4M357.0 108.7L357.0 48.1M357.0 108.7L266.1 40.0M175.2 213.7L266.1 40.0M175.2 213.7L175.2 153.1M266.1 161.2L266.1 40.0M520.7 98.2L157.0 308.2M545.0 100.4L338.9 82.0M338.9 82.0L132.7 338.4M429.8 150.7L429.8 90.1M429.8 150.7L338.9 82.0M247.9 255.7L338.9 82.0M247.9 255.7L247.9 195.1M338.9 203.2L338.9 82.0M593.5 140.2L229.7 350.2M617.7 142.4L411.6 124.0M411.6 124.0L205.5 380.4M502.5 192.7L502.5 132.1M502.5 192.7L411.6 124.0M320.7 297.7L411.6 124.0M320.7 297.7L320.7 237.1M411.6 245.2L411.6 124.0M666.2 182.2L302.5 392.2M690.5 184.4L484.4 166.0M484.4 166.0L278.2 422.4M575.3 234.7L575.3 174.1M575.3 234.7L484.4 166.0M393.4 339.7L484.4 166.0M393.4 339.7L393.4 279.1M484.4 287.2L484.4 166.0M739.0 224.2L375.2 434.2M763.2 226.4L557.1 208.0M557.1 208.0L351.0 464.4M648.0 276.7L648.0 216.1M648.0 276.7L557.1 208.0M466.2 381.7L557.1 208.0M466.2 381.7L466.2 321.1M557.1 329.2L557.1 208.0M811.7 266.2L448.0 476.2M836.0 268.4L629.8 250.0M629.8 250.0L423.7 506.4M720.8 318.7L720.8 258.1M720.8 318.7L629.8 250.0M538.9 423.7L629.8 250.0M538.9 423.7L538.9 363.1M629.8 371.2L629.8 250.0M884.5 308.2L520.7 518.2M908.7 310.4L702.6 292.0M702.6 292.0L496.5 548.4M793.5 360.7L793.5 300.1M793.5 360.7L702.6 292.0M611.7 465.7L702.6 292.0M611.7 465.7L611.7 405.1M702.6 413.2L702.6 292.0M933.0 336.2L569.2 546.2M957.2 338.4L751.1 320.0M751.1 320.0L545.0 576.4M842.0 388.7L842.0 328.1M842.0 388.7L751.1 320.0M660.2 493.7L751.1 320.0M660.2 493.7L660.2 433.1M751.1 441.2L751.1 320.0M266.1 40.0L751.1 320.0M388.0 50.9L872.9 330.9M144.3 191.6L629.2 471.6M327.9 45.5L812.9 325.5M204.3 116.9L689.3 396.9" stroke="#0F1210" strokeWidth="1" />
            <path data-layer="dims" d="M78.2 689.8L49.7 706.9M563.2 969.8L534.7 986.9M54.2 704.2L539.2 984.2M51.2 707.2L57.2 701.2M536.2 987.2L542.2 981.2M939.0 759.8L967.5 776.9M575.2 969.8L603.7 986.9M963.0 774.2L599.2 984.2M960.0 777.2L966.0 771.2M596.2 987.2L602.2 981.2M560.4 952.2L518.6 952.2M560.4 546.2L518.6 546.2M525.2 952.2L525.2 546.2M522.2 955.2L528.2 949.2M522.2 549.2L528.2 543.2" stroke="#8E948F" strokeWidth="0.8" />
            <text data-layer="dimtext" x="296.7" y="838.2" transform="rotate(30.0 296.7 844.2)" fontFamily="Michroma, sans-serif" fontSize="11" fill="#8E948F" stroke="none" textAnchor="middle">8 000</text>
            <text data-layer="dimtext" x="781.1" y="873.2" transform="rotate(-30.0 781.1 879.2)" fontFamily="Michroma, sans-serif" fontSize="11" fill="#8E948F" stroke="none" textAnchor="middle">6 000</text>
            <text data-layer="dimtext" x="525.2" y="743.2" transform="rotate(-90.0 525.2 749.2)" fontFamily="Michroma, sans-serif" fontSize="11" fill="#8E948F" stroke="none" textAnchor="middle">5 800</text>
          </svg>
          <div className={s["neon-block"]} data-neon="" aria-hidden="true">
            <svg viewBox="0 0 52 44">
              <rect x="0" y="0" width="52" height="8" rx="4" fill="currentColor" />
              <rect x="0" y="18" width="40" height="8" rx="4" fill="currentColor" />
              <rect x="0" y="36" width="52" height="8" rx="4" fill="currentColor" />
              <rect x="0" y="0" width="8" height="44" rx="4" fill="currentColor" />
            </svg>
          </div>
          <div className={s.hero__cap} data-cap="">
            <span className={s.lab}>Frame · illustrative</span>
            <b>2-storey CFS house</b>
          </div>
          <div className={s.person} data-person="">
            <div className={s.person__top}><span className={s.lab}>Founder</span><span className={s.lab}>×</span></div>
            <img src="/concepts/ecolit/partner-denis-lozenko.jpg" alt="Denis Lozenko" loading="eager" />
            <b>Denis Lozenko</b><small>CEO &amp; Founder, ECOLIT</small>
          </div>
          <div className={s.hero__foot} data-hero-foot="">
            <i className={s.hr} data-rule="" />
            <div className={s.hero__stat}><b className={s.num} data-count="20">20</b><span className={s.lab}>Countries</span></div>
            <div className={s.hero__stat}><b className={s.num} data-count="25">25</b><span className={s.lab}>Factories</span></div>
            <div className={s.hero__stat}><b className={s.num}><span data-count="1500">1500</span>+</b><span className={s.lab}>Clients</span></div>
            <div className={s.hero__stat}><b className={s.num} data-count="17">17</b><span className={s.lab}>Years</span></div>
            <p className={s.note}>ECOLIT designs and manufactures cold-formed steel building systems, CNC equipment and ECO-concrete insulation — and helps partners build with them locally.</p>
          </div>
        </section>

        {/* 02 DRAWING → REALITY (pinned) */}
        <section className={cx("reality", "wrap")} id="reality" data-section="reality">
          <div className={s.reality__stage} data-reality="">
            <div className={s.reality__photo} data-reality-photo="">
              <img src="/concepts/ecolit/frame-6.jpg" alt="ECOLIT steel frame under construction" loading="lazy" />
            </div>
            <svg className={s.reality__iso} data-iso="reality" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1117 1056" fill="none" strokeLinecap="round">
              <path data-layer="slab" d="M448.0 462.2L933.0 742.2M933.0 742.2L569.2 952.2M569.2 952.2L84.2 672.2M84.2 672.2L448.0 462.2M448.0 476.2L933.0 756.2M933.0 756.2L569.2 966.2M569.2 966.2L84.2 686.2M84.2 686.2L448.0 476.2M448.0 462.2L448.0 476.2M933.0 742.2L933.0 756.2M569.2 952.2L569.2 966.2M84.2 672.2L84.2 686.2" stroke="#0F1210" strokeWidth="1" />
              <path data-layer="gf" d="M448.0 462.2L933.0 742.2M448.0 266.2L933.0 546.2M448.0 462.2L448.0 266.2M484.4 483.2L484.4 287.2M520.7 504.2L520.7 308.2M557.1 525.2L557.1 329.2M593.5 546.2L593.5 350.2M629.8 567.2L629.8 371.2M666.2 588.2L666.2 392.2M702.6 609.2L702.6 413.2M739.0 630.2L739.0 434.2M775.3 651.2L775.3 455.2M811.7 672.2L811.7 476.2M848.1 693.2L848.1 497.2M884.5 714.2L884.5 518.2M920.8 735.2L920.8 539.2M448.0 378.2L933.0 658.2M933.0 742.2L569.2 952.2M933.0 546.2L569.2 756.2M933.0 742.2L933.0 546.2M896.6 763.2L896.6 567.2M860.2 784.2L860.2 588.2M823.8 805.2L823.8 609.2M787.5 826.2L787.5 763.2M787.5 679.2L787.5 630.2M751.1 847.2L751.1 784.2M751.1 700.2L751.1 651.2M714.7 868.2L714.7 805.2M714.7 721.2L714.7 672.2M678.3 889.2L678.3 693.2M642.0 910.2L642.0 714.2M605.6 931.2L605.6 735.2M569.2 952.2L569.2 756.2M805.6 752.7L696.5 815.7M805.6 668.7L696.5 731.7M805.6 815.7L805.6 619.7M696.5 878.7L696.5 682.7M569.2 952.2L84.2 672.2M569.2 756.2L84.2 476.2M569.2 952.2L569.2 756.2M532.8 931.2L532.8 735.2M496.5 910.2L496.5 714.2M460.1 742.2L460.1 693.2M423.7 868.2L423.7 672.2M387.4 847.2L387.4 651.2M351.0 826.2L351.0 630.2M314.6 805.2L314.6 742.2M314.6 658.2L314.6 609.2M278.2 784.2L278.2 721.2M278.2 637.2L278.2 588.2M241.9 763.2L241.9 700.2M241.9 616.2L241.9 567.2M205.5 742.2L205.5 546.2M169.1 721.2L169.1 525.2M132.7 700.2L132.7 504.2M96.4 679.2L96.4 483.2M496.5 763.2L435.9 728.2M496.5 910.2L496.5 714.2M435.9 875.2L435.9 679.2M351.0 763.2L229.7 693.2M351.0 679.2L229.7 609.2M351.0 826.2L351.0 630.2M229.7 756.2L229.7 560.2M84.2 672.2L448.0 462.2M84.2 476.2L448.0 266.2M84.2 672.2L84.2 476.2M120.6 651.2L120.6 455.2M157.0 630.2L157.0 434.2M193.4 609.2L193.4 413.2M229.7 588.2L229.7 392.2M266.1 567.2L266.1 371.2M302.5 546.2L302.5 350.2M338.9 525.2L338.9 329.2M375.2 504.2L375.2 308.2M411.6 483.2L411.6 287.2M448.0 462.2L448.0 266.2M84.2 588.2L448.0 378.2" stroke="#0F1210" strokeWidth="1" />
              <path data-layer="floor" d="M448.0 266.2L84.2 476.2M484.4 287.2L120.6 497.2M520.7 308.2L157.0 518.2M557.1 329.2L193.4 539.2M593.5 350.2L229.7 560.2M629.8 371.2L266.1 581.2M666.2 392.2L302.5 602.2M702.6 413.2L338.9 623.2M739.0 434.2L375.2 644.2M775.3 455.2L411.6 665.2M811.7 476.2L448.0 686.2M848.1 497.2L484.4 707.2M884.5 518.2L520.7 728.2M920.8 539.2L557.1 749.2M448.0 252.2L933.0 532.2M84.2 462.2L569.2 742.2M448.0 252.2L84.2 462.2" stroke="#0F1210" strokeWidth="1" />
              <path data-layer="ff" d="M448.0 252.2L933.0 532.2M448.0 56.2L933.0 336.2M448.0 252.2L448.0 56.2M484.4 273.2L484.4 77.2M520.7 294.2L520.7 98.2M557.1 315.2L557.1 119.2M593.5 336.2L593.5 140.2M629.8 357.2L629.8 161.2M666.2 378.2L666.2 182.2M702.6 399.2L702.6 203.2M739.0 420.2L739.0 224.2M775.3 441.2L775.3 245.2M811.7 462.2L811.7 266.2M848.1 483.2L848.1 287.2M884.5 504.2L884.5 308.2M920.8 525.2L920.8 329.2M448.0 168.2L933.0 448.2M933.0 532.2L569.2 742.2M933.0 336.2L569.2 546.2M933.0 532.2L933.0 336.2M896.6 553.2L896.6 357.2M860.2 574.2L860.2 378.2M823.8 595.2L823.8 399.2M787.5 616.2L787.5 560.2M787.5 469.2L787.5 420.2M751.1 637.2L751.1 581.2M751.1 490.2L751.1 441.2M714.7 658.2L714.7 602.2M714.7 511.2L714.7 462.2M678.3 679.2L678.3 483.2M642.0 700.2L642.0 504.2M605.6 721.2L605.6 525.2M569.2 742.2L569.2 546.2M805.6 549.7L696.5 612.7M805.6 458.7L696.5 521.7M805.6 605.7L805.6 409.7M696.5 668.7L696.5 472.7M569.2 742.2L84.2 462.2M569.2 546.2L84.2 266.2M569.2 742.2L569.2 546.2M532.8 721.2L532.8 525.2M496.5 700.2L496.5 644.2M496.5 553.2L496.5 504.2M460.1 679.2L460.1 623.2M460.1 532.2L460.1 483.2M423.7 658.2L423.7 602.2M423.7 511.2L423.7 462.2M387.4 637.2L387.4 441.2M351.0 616.2L351.0 420.2M314.6 595.2L314.6 399.2M278.2 574.2L278.2 518.2M278.2 427.2L278.2 378.2M241.9 553.2L241.9 497.2M241.9 406.2L241.9 357.2M205.5 532.2L205.5 476.2M205.5 385.2L205.5 336.2M169.1 511.2L169.1 315.2M132.7 490.2L132.7 294.2M96.4 469.2L96.4 273.2M508.6 651.2L387.4 581.2M508.6 560.2L387.4 490.2M508.6 707.2L508.6 511.2M387.4 637.2L387.4 441.2M290.4 525.2L169.1 455.2M290.4 434.2L169.1 364.2M290.4 581.2L290.4 385.2M169.1 511.2L169.1 315.2M84.2 462.2L448.0 252.2M84.2 266.2L448.0 56.2M84.2 462.2L84.2 266.2M120.6 441.2L120.6 245.2M157.0 420.2L157.0 224.2M193.4 399.2L193.4 203.2M229.7 378.2L229.7 182.2M266.1 357.2L266.1 161.2M302.5 336.2L302.5 140.2M338.9 315.2L338.9 119.2M375.2 294.2L375.2 98.2M411.6 273.2L411.6 77.2M448.0 252.2L448.0 56.2M84.2 378.2L448.0 168.2" stroke="#00CB14" strokeWidth="1.6" />
              <path data-layer="roof" d="M448.0 56.2L84.2 266.2M472.2 58.4L266.1 40.0M266.1 40.0L60.0 296.4M357.0 108.7L357.0 48.1M357.0 108.7L266.1 40.0M175.2 213.7L266.1 40.0M175.2 213.7L175.2 153.1M266.1 161.2L266.1 40.0M520.7 98.2L157.0 308.2M545.0 100.4L338.9 82.0M338.9 82.0L132.7 338.4M429.8 150.7L429.8 90.1M429.8 150.7L338.9 82.0M247.9 255.7L338.9 82.0M247.9 255.7L247.9 195.1M338.9 203.2L338.9 82.0M593.5 140.2L229.7 350.2M617.7 142.4L411.6 124.0M411.6 124.0L205.5 380.4M502.5 192.7L502.5 132.1M502.5 192.7L411.6 124.0M320.7 297.7L411.6 124.0M320.7 297.7L320.7 237.1M411.6 245.2L411.6 124.0M666.2 182.2L302.5 392.2M690.5 184.4L484.4 166.0M484.4 166.0L278.2 422.4M575.3 234.7L575.3 174.1M575.3 234.7L484.4 166.0M393.4 339.7L484.4 166.0M393.4 339.7L393.4 279.1M484.4 287.2L484.4 166.0M739.0 224.2L375.2 434.2M763.2 226.4L557.1 208.0M557.1 208.0L351.0 464.4M648.0 276.7L648.0 216.1M648.0 276.7L557.1 208.0M466.2 381.7L557.1 208.0M466.2 381.7L466.2 321.1M557.1 329.2L557.1 208.0M811.7 266.2L448.0 476.2M836.0 268.4L629.8 250.0M629.8 250.0L423.7 506.4M720.8 318.7L720.8 258.1M720.8 318.7L629.8 250.0M538.9 423.7L629.8 250.0M538.9 423.7L538.9 363.1M629.8 371.2L629.8 250.0M884.5 308.2L520.7 518.2M908.7 310.4L702.6 292.0M702.6 292.0L496.5 548.4M793.5 360.7L793.5 300.1M793.5 360.7L702.6 292.0M611.7 465.7L702.6 292.0M611.7 465.7L611.7 405.1M702.6 413.2L702.6 292.0M933.0 336.2L569.2 546.2M957.2 338.4L751.1 320.0M751.1 320.0L545.0 576.4M842.0 388.7L842.0 328.1M842.0 388.7L751.1 320.0M660.2 493.7L751.1 320.0M660.2 493.7L660.2 433.1M751.1 441.2L751.1 320.0M266.1 40.0L751.1 320.0M388.0 50.9L872.9 330.9M144.3 191.6L629.2 471.6M327.9 45.5L812.9 325.5M204.3 116.9L689.3 396.9" stroke="#0F1210" strokeWidth="1" />
              <path data-layer="dims" d="M78.2 689.8L49.7 706.9M563.2 969.8L534.7 986.9M54.2 704.2L539.2 984.2M51.2 707.2L57.2 701.2M536.2 987.2L542.2 981.2M939.0 759.8L967.5 776.9M575.2 969.8L603.7 986.9M963.0 774.2L599.2 984.2M960.0 777.2L966.0 771.2M596.2 987.2L602.2 981.2M560.4 952.2L518.6 952.2M560.4 546.2L518.6 546.2M525.2 952.2L525.2 546.2M522.2 955.2L528.2 949.2M522.2 549.2L528.2 543.2" stroke="#8E948F" strokeWidth="0.8" />
            </svg>
            <div className={s.reality__txt}>
              <span className={s.lab}>(02) — Manufacturing</span>
              <p className={s.statement} data-reality-statement=""><span className={s.ln}>Every profile is</span><span className={cx("ln", "in1")}>cut, punched and marked</span><span className={s.ln}>by ECOLIT machines.</span></p>
            </div>
            <div className={s.machine} data-machine="">
              <span className={s.lab}>Roll-former · live</span>
              <div className={s.num}>Profile C-89</div>
              <p>Cut <b data-tick="">✓</b></p><p>Punched <b data-tick="">✓</b></p><p>Marked <b data-tick="">✓</b></p><p>Next <b data-next="">Stud 047</b></p>
            </div>
          </div>
        </section>

        {/* 03 NETWORK */}
        <section className={cx("sec", "wrap")} id="network" data-section="network">
          <div className={s.sec__top}>
            <div>
              <span className={s.lab}>(03) — Network</span>
              <h2 className={s.statement} data-statement=""><span className={s.ln}>25 factories.</span><span className={cx("ln", "in1")}>20 countries.</span><span className={s.ln}>One system.</span></h2>
            </div>
            <p className={s.note} data-note="">Partners build with ECOLIT equipment and the patented system in their own country — supported by the network.</p>
          </div>
          <div className={s.map} data-map="">
            <canvas data-map-canvas="" />
            <svg className={s.leaders} viewBox="0 0 1360 603" preserveAspectRatio="none" data-leaders=""></svg>
          </div>
          <div className={s.map__foot}><span className={s.lab}>● ECOLIT countries</span><span className={s.lab}>Partners &amp; locations: ecolit.tech</span></div>
        </section>

        {/* 04 PARTNER PORTAL */}
        <section className={cx("sec", "wrap")} id="portal" data-section="portal">
          <div className={s.sec__top}>
            <div>
              <span className={s.lab}>(04) — Partner portal · concept</span>
              <h2 className={s.statement} data-statement=""><span className={s.ln}>Spec a full house kit</span><span className={cx("ln", "in1")}>from one screen.</span></h2>
            </div>
            <p className={s.note} data-note="">A concept for ECOLIT partners: configure a building, check the kit and request it from the nearest factory.</p>
          </div>
          <div className={s.device} data-device="">
            <div className={s.screen}>
              <aside className={s.side}>
                <div className={s.side__logo}><span><img src="/concepts/ecolit/logo.svg" alt="" loading="lazy" /></span><em className={s.lab}>Partner</em></div>
                <div className={s.step}><span className={s.num}>01</span>Plot</div>
                <div className={`${s.step} ${s["is-on"]}`}><span className={s.num}>02</span>Structure</div>
                <div className={s.step}><span className={s.num}>03</span>Insulation</div>
                <div className={s.step}><span className={s.num}>04</span>Kit &amp; quote</div>
                <span className={s.lab}>Draft 03 · saved</span>
              </aside>
              <div className={s.cfg}>
                <span className={s.lab}>New house kit</span><h4>Structure</h4>
                <div className={s.cfg__row}>
                  <div><span className={s.lab}>Storeys</span><div className={s.seg} data-seg="storeys"><i /><span>1</span><span>2</span><span>3</span></div></div>
                  <div><span className={s.lab}>Seismic design</span><div className={s.seg} data-seg="seismic"><i /><span>Standard</span><span>High</span><span>M9</span></div></div>
                </div>
                <span className={s.lab}>Floor area</span><span className={`${s.num} ${s.area}`} data-area="">60 m²</span>
                <div className={s.slider} data-slider=""><i /><b /></div>
                <span className={s.lab}>Climate zone</span><div className={s.seg} data-seg="climate" style={{ marginBottom: "22px" }}><i /><span>Hot</span><span>Temperate</span><span>Cold</span></div>
                <div className={s.preview}><span className={s.lab}>Live preview</span>
                  <svg data-iso="preview" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1117 1056" fill="none" strokeLinecap="round">
                    <path data-layer="slab" d="M448.0 462.2L933.0 742.2M933.0 742.2L569.2 952.2M569.2 952.2L84.2 672.2M84.2 672.2L448.0 462.2M448.0 476.2L933.0 756.2M933.0 756.2L569.2 966.2M569.2 966.2L84.2 686.2M84.2 686.2L448.0 476.2M448.0 462.2L448.0 476.2M933.0 742.2L933.0 756.2M569.2 952.2L569.2 966.2M84.2 672.2L84.2 686.2" stroke="#0F1210" strokeWidth="1" />
                    <path data-layer="gf" d="M448.0 462.2L933.0 742.2M448.0 266.2L933.0 546.2M448.0 462.2L448.0 266.2M484.4 483.2L484.4 287.2M520.7 504.2L520.7 308.2M557.1 525.2L557.1 329.2M593.5 546.2L593.5 350.2M629.8 567.2L629.8 371.2M666.2 588.2L666.2 392.2M702.6 609.2L702.6 413.2M739.0 630.2L739.0 434.2M775.3 651.2L775.3 455.2M811.7 672.2L811.7 476.2M848.1 693.2L848.1 497.2M884.5 714.2L884.5 518.2M920.8 735.2L920.8 539.2M448.0 378.2L933.0 658.2M933.0 742.2L569.2 952.2M933.0 546.2L569.2 756.2M933.0 742.2L933.0 546.2M896.6 763.2L896.6 567.2M860.2 784.2L860.2 588.2M823.8 805.2L823.8 609.2M787.5 826.2L787.5 763.2M787.5 679.2L787.5 630.2M751.1 847.2L751.1 784.2M751.1 700.2L751.1 651.2M714.7 868.2L714.7 805.2M714.7 721.2L714.7 672.2M678.3 889.2L678.3 693.2M642.0 910.2L642.0 714.2M605.6 931.2L605.6 735.2M569.2 952.2L569.2 756.2M805.6 752.7L696.5 815.7M805.6 668.7L696.5 731.7M805.6 815.7L805.6 619.7M696.5 878.7L696.5 682.7M569.2 952.2L84.2 672.2M569.2 756.2L84.2 476.2M569.2 952.2L569.2 756.2M532.8 931.2L532.8 735.2M496.5 910.2L496.5 714.2M460.1 742.2L460.1 693.2M423.7 868.2L423.7 672.2M387.4 847.2L387.4 651.2M351.0 826.2L351.0 630.2M314.6 805.2L314.6 742.2M314.6 658.2L314.6 609.2M278.2 784.2L278.2 721.2M278.2 637.2L278.2 588.2M241.9 763.2L241.9 700.2M241.9 616.2L241.9 567.2M205.5 742.2L205.5 546.2M169.1 721.2L169.1 525.2M132.7 700.2L132.7 504.2M96.4 679.2L96.4 483.2M496.5 763.2L435.9 728.2M496.5 910.2L496.5 714.2M435.9 875.2L435.9 679.2M351.0 763.2L229.7 693.2M351.0 679.2L229.7 609.2M351.0 826.2L351.0 630.2M229.7 756.2L229.7 560.2M84.2 672.2L448.0 462.2M84.2 476.2L448.0 266.2M84.2 672.2L84.2 476.2M120.6 651.2L120.6 455.2M157.0 630.2L157.0 434.2M193.4 609.2L193.4 413.2M229.7 588.2L229.7 392.2M266.1 567.2L266.1 371.2M302.5 546.2L302.5 350.2M338.9 525.2L338.9 329.2M375.2 504.2L375.2 308.2M411.6 483.2L411.6 287.2M448.0 462.2L448.0 266.2M84.2 588.2L448.0 378.2" stroke="#0F1210" strokeWidth="1" />
                    <path data-layer="floor" d="M448.0 266.2L84.2 476.2M484.4 287.2L120.6 497.2M520.7 308.2L157.0 518.2M557.1 329.2L193.4 539.2M593.5 350.2L229.7 560.2M629.8 371.2L266.1 581.2M666.2 392.2L302.5 602.2M702.6 413.2L338.9 623.2M739.0 434.2L375.2 644.2M775.3 455.2L411.6 665.2M811.7 476.2L448.0 686.2M848.1 497.2L484.4 707.2M884.5 518.2L520.7 728.2M920.8 539.2L557.1 749.2M448.0 252.2L933.0 532.2M84.2 462.2L569.2 742.2M448.0 252.2L84.2 462.2" stroke="#0F1210" strokeWidth="1" />
                    <path data-layer="ff" d="M448.0 252.2L933.0 532.2M448.0 56.2L933.0 336.2M448.0 252.2L448.0 56.2M484.4 273.2L484.4 77.2M520.7 294.2L520.7 98.2M557.1 315.2L557.1 119.2M593.5 336.2L593.5 140.2M629.8 357.2L629.8 161.2M666.2 378.2L666.2 182.2M702.6 399.2L702.6 203.2M739.0 420.2L739.0 224.2M775.3 441.2L775.3 245.2M811.7 462.2L811.7 266.2M848.1 483.2L848.1 287.2M884.5 504.2L884.5 308.2M920.8 525.2L920.8 329.2M448.0 168.2L933.0 448.2M933.0 532.2L569.2 742.2M933.0 336.2L569.2 546.2M933.0 532.2L933.0 336.2M896.6 553.2L896.6 357.2M860.2 574.2L860.2 378.2M823.8 595.2L823.8 399.2M787.5 616.2L787.5 560.2M787.5 469.2L787.5 420.2M751.1 637.2L751.1 581.2M751.1 490.2L751.1 441.2M714.7 658.2L714.7 602.2M714.7 511.2L714.7 462.2M678.3 679.2L678.3 483.2M642.0 700.2L642.0 504.2M605.6 721.2L605.6 525.2M569.2 742.2L569.2 546.2M805.6 549.7L696.5 612.7M805.6 458.7L696.5 521.7M805.6 605.7L805.6 409.7M696.5 668.7L696.5 472.7M569.2 742.2L84.2 462.2M569.2 546.2L84.2 266.2M569.2 742.2L569.2 546.2M532.8 721.2L532.8 525.2M496.5 700.2L496.5 644.2M496.5 553.2L496.5 504.2M460.1 679.2L460.1 623.2M460.1 532.2L460.1 483.2M423.7 658.2L423.7 602.2M423.7 511.2L423.7 462.2M387.4 637.2L387.4 441.2M351.0 616.2L351.0 420.2M314.6 595.2L314.6 399.2M278.2 574.2L278.2 518.2M278.2 427.2L278.2 378.2M241.9 553.2L241.9 497.2M241.9 406.2L241.9 357.2M205.5 532.2L205.5 476.2M205.5 385.2L205.5 336.2M169.1 511.2L169.1 315.2M132.7 490.2L132.7 294.2M96.4 469.2L96.4 273.2M508.6 651.2L387.4 581.2M508.6 560.2L387.4 490.2M508.6 707.2L508.6 511.2M387.4 637.2L387.4 441.2M290.4 525.2L169.1 455.2M290.4 434.2L169.1 364.2M290.4 581.2L290.4 385.2M169.1 511.2L169.1 315.2M84.2 462.2L448.0 252.2M84.2 266.2L448.0 56.2M84.2 462.2L84.2 266.2M120.6 441.2L120.6 245.2M157.0 420.2L157.0 224.2M193.4 399.2L193.4 203.2M229.7 378.2L229.7 182.2M266.1 357.2L266.1 161.2M302.5 336.2L302.5 140.2M338.9 315.2L338.9 119.2M375.2 294.2L375.2 98.2M411.6 273.2L411.6 77.2M448.0 252.2L448.0 56.2M84.2 378.2L448.0 168.2" stroke="#00CB14" strokeWidth="1.6" />
                    <path data-layer="roof" d="M448.0 56.2L84.2 266.2M472.2 58.4L266.1 40.0M266.1 40.0L60.0 296.4M357.0 108.7L357.0 48.1M357.0 108.7L266.1 40.0M175.2 213.7L266.1 40.0M175.2 213.7L175.2 153.1M266.1 161.2L266.1 40.0M520.7 98.2L157.0 308.2M545.0 100.4L338.9 82.0M338.9 82.0L132.7 338.4M429.8 150.7L429.8 90.1M429.8 150.7L338.9 82.0M247.9 255.7L338.9 82.0M247.9 255.7L247.9 195.1M338.9 203.2L338.9 82.0M593.5 140.2L229.7 350.2M617.7 142.4L411.6 124.0M411.6 124.0L205.5 380.4M502.5 192.7L502.5 132.1M502.5 192.7L411.6 124.0M320.7 297.7L411.6 124.0M320.7 297.7L320.7 237.1M411.6 245.2L411.6 124.0M666.2 182.2L302.5 392.2M690.5 184.4L484.4 166.0M484.4 166.0L278.2 422.4M575.3 234.7L575.3 174.1M575.3 234.7L484.4 166.0M393.4 339.7L484.4 166.0M393.4 339.7L393.4 279.1M484.4 287.2L484.4 166.0M739.0 224.2L375.2 434.2M763.2 226.4L557.1 208.0M557.1 208.0L351.0 464.4M648.0 276.7L648.0 216.1M648.0 276.7L557.1 208.0M466.2 381.7L557.1 208.0M466.2 381.7L466.2 321.1M557.1 329.2L557.1 208.0M811.7 266.2L448.0 476.2M836.0 268.4L629.8 250.0M629.8 250.0L423.7 506.4M720.8 318.7L720.8 258.1M720.8 318.7L629.8 250.0M538.9 423.7L629.8 250.0M538.9 423.7L538.9 363.1M629.8 371.2L629.8 250.0M884.5 308.2L520.7 518.2M908.7 310.4L702.6 292.0M702.6 292.0L496.5 548.4M793.5 360.7L793.5 300.1M793.5 360.7L702.6 292.0M611.7 465.7L702.6 292.0M611.7 465.7L611.7 405.1M702.6 413.2L702.6 292.0M933.0 336.2L569.2 546.2M957.2 338.4L751.1 320.0M751.1 320.0L545.0 576.4M842.0 388.7L842.0 328.1M842.0 388.7L751.1 320.0M660.2 493.7L751.1 320.0M660.2 493.7L660.2 433.1M751.1 441.2L751.1 320.0M266.1 40.0L751.1 320.0M388.0 50.9L872.9 330.9M144.3 191.6L629.2 471.6M327.9 45.5L812.9 325.5M204.3 116.9L689.3 396.9" stroke="#0F1210" strokeWidth="1" />
                    <path data-layer="dims" d="M78.2 689.8L49.7 706.9M563.2 969.8L534.7 986.9M54.2 704.2L539.2 984.2M51.2 707.2L57.2 701.2M536.2 987.2L542.2 981.2M939.0 759.8L967.5 776.9M575.2 969.8L603.7 986.9M963.0 774.2L599.2 984.2M960.0 777.2L966.0 771.2M596.2 987.2L602.2 981.2M560.4 952.2L518.6 952.2M560.4 546.2L518.6 546.2M525.2 952.2L525.2 546.2M522.2 955.2L528.2 949.2M522.2 549.2L528.2 543.2" stroke="#8E948F" strokeWidth="0.8" />
                  </svg>
                </div>
              </div>
              <div className={s.sum}>
                <span className={s.lab}>Kit summary</span>
                <div className={s.kit} data-kit=""><p>Wall panels · CFS<i>✓</i></p><p>Floor joists<i>✓</i></p><p>Roof trusses<i>✓</i></p><p>Rivets, screws &amp; plates<i>✓</i></p><p>ECO-concrete mix<i>✓</i></p></div>
                <div className={s.fac}><span className={s.lab}>Nearest factories</span><p>Changzhou <span>China</span></p><p>New Jersey <span>USA</span></p><p>Dubai <span>UAE</span></p></div>
                <a className={cx("pill", "pill--neon")} href="#partnership">Request quote <i>↗</i></a>
              </div>
            </div>
            <div className={s.toast} data-toast=""><i>✓</i><div><b>Quote requested</b><small>Changzhou factory · draft 03</small></div></div>
          </div>
        </section>

        {/* 05 ENGINEERED */}
        <section className={cx("sec", "wrap")} data-section="engineered">
          <div className={s.sec__top}>
            <div><span className={s.lab}>(05) — System</span>
              <h2 className={s.statement} data-statement=""><span className={s.ln}>Engineered</span><span className={cx("ln", "in1")}>to the millimetre.</span></h2>
            </div>
          </div>
          <div className={s.eng}>
            <div data-profile="">
              <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 833 812" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path data-layer="profile" d="M70.0 362.0L70.0 400.4M70.0 400.4L183.6 334.8M183.6 334.8L183.6 50.0M183.6 50.0L70.0 115.6M70.0 115.6L70.0 154.0M679.7 714.0L679.7 752.4M679.7 752.4L793.3 686.8M793.3 686.8L793.3 402.0M793.3 402.0L679.7 467.6M679.7 467.6L679.7 506.0M70.0 362.0L679.7 714.0M70.0 400.4L679.7 752.4M183.6 334.8L793.3 686.8M183.6 50.0L793.3 402.0M70.0 115.6L679.7 467.6M70.0 154.0L679.7 506.0M183.6 238.8L793.3 590.8M183.6 146.0L793.3 498.0" stroke="#0F1210" strokeWidth="1.2" />
                <path data-layer="holes" d="M385.9 309.2L385.2 303.8L382.9 297.6L379.2 290.9L374.3 283.9L368.1 276.9L361.0 269.9L353.1 263.2L344.7 257.0L336.0 251.6L327.4 247.0L319.0 243.5L311.1 241.1L304.0 239.8L297.8 239.8L292.8 241.1L289.2 243.5L286.9 247.0L286.2 251.6L286.9 257.0L289.2 263.2L292.8 269.9L297.8 276.9L304.0 283.9L311.1 290.9L319.0 297.6L327.4 303.8L336.0 309.2L344.7 313.8L353.1 317.3L361.0 319.7L368.1 321.0L374.3 321.0L379.2 319.7L382.9 317.3L385.2 313.8L385.9 309.2ZM690.8 485.2L690.0 479.8L687.8 473.6L684.1 466.9L679.1 459.9L672.9 452.9L665.8 445.9L657.9 439.2L649.5 433.0L640.9 427.6L632.2 423.0L623.8 419.5L615.9 417.1L608.8 415.8L602.7 415.8L597.7 417.1L594.0 419.5L591.8 423.0L591.0 427.6L591.8 433.0L594.0 439.2L597.7 445.9L602.7 452.9L608.8 459.9L615.9 466.9L623.8 473.6L632.2 479.8L640.9 485.2L649.5 489.8L657.9 493.3L665.8 495.7L672.9 497.0L679.1 497.0L684.1 495.7L687.8 493.3L690.0 489.8L690.8 485.2Z" stroke="#00CB14" strokeWidth="1.4" />
                <path data-layer="dims" d="M183.6 334.8L143.6 334.8M183.6 50.0L143.6 50.0M143.6 334.8L143.6 50.0M183.6 50.0L165.6 26.0M70.0 115.6L52.0 91.6M165.6 26.0L52.0 91.6M183.6 334.8L197.6 364.8M793.3 686.8L807.3 716.8M197.6 364.8L807.3 716.8" stroke="#8E948F" strokeWidth="0.8" />
                <text x="143.6" y="186.4" transform="rotate(-90.0 143.6 192.4)" fontFamily="Michroma, sans-serif" fontSize="10" fill="#8E948F" textAnchor="middle">89</text>
                <text x="108.8" y="52.8" transform="rotate(-30.0 108.8 58.8)" fontFamily="Michroma, sans-serif" fontSize="10" fill="#8E948F" textAnchor="middle">41</text>
                <text x="502.5" y="534.8" transform="rotate(30.0 502.5 540.8)" fontFamily="Michroma, sans-serif" fontSize="10" fill="#8E948F" textAnchor="middle">1 punched stud · length to order</text>
              </svg>
              <span className={s.lab}>C-profile · punched stud · illustrative</span>
            </div>
            <div className={s.specs} data-specs="">
              <div className={s.row}><i className={s.hr} /><span className={s.lab}>01 · Material</span><p>Galvanised cold-formed steel (LGS / CFS)</p></div>
              <div className={s.row}><i className={s.hr} /><span className={s.lab}>02 · Connections</span><p>Rivets, self-tapping screws, seismic plates</p></div>
              <div className={s.row}><i className={s.hr} /><span className={s.lab}>03 · Seismic</span><p>Designed for up to magnitude 9*</p></div>
              <div className={s.row}><i className={s.hr} /><span className={s.lab}>04 · Sound</span><p>60+ dB with ECO-concrete walls*</p></div>
              <div className={s.row}><i className={s.hr} /><span className={s.lab}>05 · Moisture</span><p>Zinc-coated — no rot, no mould</p></div>
              <div className={s.row}><i className={s.hr} /><span className={s.lab}>06 · Metal use</span><p>1.5–2× less than traditional steel*</p></div>
              <div className={s.last}><i className={s.hr} style={{ position: "absolute", inset: 0 }} /></div>
              <div className={s.closeups}><img src="/concepts/ecolit/rivet.jpg" alt="ECOLIT rivet connection" loading="lazy" /><img src="/concepts/ecolit/frame-on-wall.jpg" alt="Steel frame with ECO-concrete blocks" loading="lazy" /></div>
              <div className={s.eng__foot}><span /><span className={s.lab}>* ECOLIT data</span></div>
            </div>
          </div>
        </section>

        {/* 06 ENERGY */}
        <section className={cx("sec", "wrap")} data-section="energy">
          <span className={s.lab} style={{ display: "block", marginBottom: "28px" }}>(06) — Energy</span>
          <div className={s.energy__top}>
            <div className={cx("big15", "num")} data-big15="">15</div>
            <div>
              <p className={s.statement} data-statement=""><span className={s.ln}>kWh/m² a year.</span><span className={cx("ln", "in2")}>A building from</span><span className={s.ln}>the 70s needs 280.</span></p>
              <p className={s.note}>Annual electricity demand for hot water, ventilation and heat loss. Source: ECOLIT.</p>
            </div>
          </div>
          <div className={s.chart} data-chart="">
            <div className={s.bar} data-bar=""><i className={s.hr} /><span className={s.lab}>01</span><span>1970s building</span><div className={s.bar__line}><i style={{ width: "100%" }} /></div><b className={s.num} data-count="280">280</b></div>
            <div className={s.bar} data-bar=""><i className={s.hr} /><span className={s.lab}>02</span><span>1980s building</span><div className={s.bar__line}><i style={{ width: "60.7%" }} /></div><b className={s.num} data-count="170">170</b></div>
            <div className={s.bar} data-bar=""><i className={s.hr} /><span className={s.lab}>03</span><span>1990s building</span><div className={s.bar__line}><i style={{ width: "46.4%" }} /></div><b className={s.num} data-count="130">130</b></div>
            <div className={s.bar} data-bar=""><i className={s.hr} /><span className={s.lab}>04</span><span>Modern building</span><div className={s.bar__line}><i style={{ width: "25%" }} /></div><b className={s.num} data-count="70">70</b></div>
            <div className={cx("bar", "is-us")} data-bar=""><i className={s.hr} /><span className={s.lab}>05</span><span>ECOLIT building</span><div className={s.bar__line}><i style={{ width: "5.4%" }} /></div><b className={s.num} data-count="15">15</b></div>
            <i className={s.hr} style={{ display: "block" }} />
          </div>
        </section>

        {/* 07 APPROVALS */}
        <section className={cx("sec", "wrap")} data-section="approvals">
          <div className={s.sec__top}><div><span className={s.lab}>(07) — Approvals</span>
            <h2 className={s.statement} data-statement=""><span className={s.ln}>Patented and approved</span><span className={cx("ln", "in1")}>on three continents.</span></h2>
          </div></div>
          <div className={s.approvals}>
            <div className={s.docs} data-docs="">
              <div className={s.doc} data-doc="" data-x="6%" data-y="2%" data-r="-6" data-blur="1"><img src="/concepts/ecolit/cert-us.jpg" alt="US patent" loading="lazy" /></div>
              <div className={s.doc} data-doc="" data-x="21%" data-y="7%" data-r="4" data-blur="0"><img src="/concepts/ecolit/cert-de.jpg" alt="German patent" loading="lazy" /></div>
              <div className={s.doc} data-doc="" data-x="37%" data-y="0%" data-r="-2" data-blur="0"><img src="/concepts/ecolit/cert-uae.jpg" alt="Dubai system approval" loading="lazy" /></div>
              <div className={s.doc} data-doc="" data-x="52%" data-y="9%" data-r="5" data-blur="0"><img src="/concepts/ecolit/cert-jamaica.jpg" alt="Jamaica system approval" loading="lazy" /></div>
              <div className={s.doc} data-doc="" data-x="66%" data-y="3%" data-r="-4" data-blur="0"><img src="/concepts/ecolit/cert-labc.jpg" alt="LABC Warranty" loading="lazy" /></div>
              <div className={s.doc} data-doc="" data-x="60%" data-y="30%" data-r="2" data-blur="4"><img src="/concepts/ecolit/cert-premier.jpg" alt="Premier Guarantee" loading="lazy" /></div>
            </div>
            <div className={s.list} data-list="">
              <div className={s.row}><i className={s.hr} /><span className={s.num}>US</span><span>US patent</span><i>↗</i></div>
              <div className={s.row}><i className={s.hr} /><span className={s.num}>DE</span><span>German patent</span><i>↗</i></div>
              <div className={cx("row", "is-on")}><i className={s.hr} /><span className={s.num}>AE</span><span>Dubai system approval</span><i>↗</i></div>
              <div className={s.row}><i className={s.hr} /><span className={s.num}>JM</span><span>Jamaica system approval</span><i>↗</i></div>
              <div className={s.row}><i className={s.hr} /><span className={s.num}>UK</span><span>LABC Warranty</span><i>↗</i></div>
              <div className={s.row}><i className={s.hr} /><span className={s.num}>UK</span><span>Premier Guarantee</span><i>↗</i></div>
              <i className={s.hr} style={{ display: "block" }} />
            </div>
          </div>
        </section>

        {/* 08 PARTNERSHIP */}
        <section className={cx("sec", "wrap")} id="partnership" data-section="partnership">
          <span className={s.lab} style={{ display: "block", marginBottom: "28px" }}>(08) — Partnership program</span>
          <div className={s.pship}>
            <figure className={s.pship__photo} data-pship-photo="">
              <img src="/concepts/ecolit/frame-3.jpg" alt="ECOLIT light-gauge steel frame project" data-pship-img="" loading="lazy" />
              <span className={s.pship__tag}>ECOLIT project · LGSF</span>
              <div className={s.pship__card} data-pship-card="">
                <img src="/concepts/ecolit/partner-paul-stephenson.jpg" alt="Paul Stephenson" loading="lazy" />
                <div><span className={s.lab}>ECOLIT partner</span><b>Paul Stephenson</b><small>Kingston, Jamaica</small></div>
              </div>
            </figure>
            <div className={s.pship__body}>
              <h2 className={s.pship__title} data-statement=""><span className={s.ln}>Open an ECOLIT</span><span className={s.ln}>construction business</span><span className={cx("ln", "acc")}>in your city.</span></h2>
              <p className={s.pship__lead} data-note="">Equipment, the patented system, training and a network of 25 factories — everything a builder needs to make energy-efficient steel-frame homes locally.</p>
              <div className={s.steps4} data-steps4="">
                <div className={s.s4} data-s4=""><i className={s.hr} /><b className={s.num}>01</b><div><h4>Apply</h4><p>Share your city, market and the homes you want to build.</p></div></div>
                <div className={s.s4} data-s4=""><i className={s.hr} /><b className={s.num}>02</b><div><h4>Equip</h4><p>ECOLIT CNC roll-forming lines, robotics and tooling.</p></div></div>
                <div className={s.s4} data-s4=""><i className={s.hr} /><b className={s.num}>03</b><div><h4>Train</h4><p>BIM design, engineering and on-site assembly training.</p></div></div>
                <div className={cx("s4", "is-last")} data-s4=""><i className={s.hr} /><b className={s.num}>04</b><div><h4>Build</h4><p>Certified, patented steel-frame homes — made locally.</p></div></div>
                <i className={s.hr} style={{ display: "block" }} />
              </div>
            </div>
          </div>
          <a className={s.ctabar} href="#partnership" data-ctabar="">
            <span className={s.faces} data-faces="">
              <img src="/concepts/ecolit/partner-denis-lozenko.jpg" alt="" loading="lazy" />
              <img src="/concepts/ecolit/partner-jamaal-marcano.jpg" alt="" loading="lazy" />
              <img src="/concepts/ecolit/partner-nii-kojo-biney.jpg" alt="" loading="lazy" />
              <img src="/concepts/ecolit/partner-tanaphak-krabat.jpg" alt="" loading="lazy" />
              <img src="/concepts/ecolit/partner-siril-george.jpg" alt="" loading="lazy" />
              <img src="/concepts/ecolit/partner-chris-rayson.jpg" alt="" loading="lazy" />
              <img src="/concepts/ecolit/partner-nikita-shumeiko.jpg" alt="" loading="lazy" />
              <img src="/concepts/ecolit/partner-mark-farrelly.jpg" alt="" loading="lazy" />
            </span>
            <span className={s.ctabar__txt}><small>Join partners in 20 countries</small><strong className={s.num} data-ctabar-text="">Become an ECOLIT partner</strong></span>
            <i className={s.ctabar__arrow} data-ctabar-arrow="">↗</i>
          </a>
          <div className={s.pship__foot}><a href="#partnership"><b>Or talk to us on WhatsApp →</b></a><span>Telegram · @DenisEcolit</span></div>
        </section>
      </main>

      <footer className={cx("foot", "wrap")} data-section="footer">
        <div className={s.foot__top}>
          <span className={s.lab}>(09) — ECOLIT global construction system</span>
          <div><h6>Company</h6><ul><li>About us</li><li>Technologies</li><li>Projects</li><li>News</li></ul></div>
          <div><h6>Contact</h6><ul><li>Telegram · @DenisEcolit</li><li>WhatsApp</li><li>LinkedIn</li><li>YouTube · Instagram</li></ul></div>
          <div><h6>Offices</h6><ul><li>USA · UK · UAE</li><li>China · Indonesia</li><li>Australia · Thailand</li></ul></div>
        </div>
        <div className={s.mark} data-mark="">
          <i className={`${s.c} ${s["c--v"]}`} style={{ left: 0 }} data-c="" />
          <i className={`${s.c} ${s["c--v"]}`} style={{ right: 0 }} data-c="" />
          <i className={`${s.c} ${s["c--h"]}`} style={{ top: 0 }} data-c="" />
          <i className={`${s.c} ${s["c--h"]}`} style={{ top: "38%" }} data-c="" />
          <span className={s.num}>1200</span>
          <img src="/concepts/ecolit/logo-ink.svg" alt="ECOLIT" data-mark-img="" loading="eager" />
        </div>
        <div className={s.foot__bottom}><span className={s.lab}>© 2026 ECOLIT</span><span className={s.lab}>Unsolicited concept by David Adebayo — not affiliated with ECOLIT</span></div>
      </footer>

      <ConceptBadge company="ECOLIT" className={s.badge} />
    </div>
  );
}
