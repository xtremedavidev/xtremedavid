"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { geist, geistMono as mono } from "@/app/components/concepts/fonts";
import s from "./light.module.css";
import { RepsLogo } from "../logo";
import { RepsMenu } from "../menu";
import { A, BACKERS, CLIENTS, NAV } from "../data";
import { initRepsLightMotion } from "./motion";
import { BeliefsSection, CalculatorSection, CtaSection, FaqSection, FilmSection, FooterSection, GlanceSection, ImpactSection, LocationsSection, PressSection } from "./Sections";

const cx = (...n: (string | false | undefined)[]) => n.filter(Boolean).map((k) => s[k as string]).filter(Boolean).join(" ");

const Arrow = ({ c = "→" }: { c?: string }) => <i aria-hidden="true">{c}</i>;
const Eyebrow = ({ children }: { children: React.ReactNode }) => <div className={cx("eyebrow", "mono")} data-rise=""><i />{children}</div>;

const CALLOUTS: { n: string; t: string; d: string; pos: React.CSSProperties; m?: "mTL" | "mBR" }[] = [
  { n: "01", t: "27 trigger pairs", d: "feel every axle", pos: { left: "78.2%", top: "11.7%" }, m: "mTL" },
  { n: "02", t: "9 modular road slabs", d: "12 × 3 m, on a 12.5 cm foundation", pos: { left: "8%", top: "15.4%" } },
  { n: "03", t: "Sealed hydraulic lines", d: "closed loop, no electronics in the road", pos: { left: "63%", top: "63%" } },
  { n: "04", t: "Energy Converter Module", d: "magnetically levitated shaft", pos: { left: "2.3%", top: "80%" } },
  { n: "05", t: "On-site battery bank", d: "buffers traffic, feeds the grid", pos: { left: "70%", top: "86%" }, m: "mBR" },
];
// leader lines in the render's own 1304 × 820 space: [anchor on the render, path to its callout]
const LEADERS: [number, number, string][] = [
  [750, 280, "M750 280L900 125H1020"], [456, 209, "M456 209L400 158H324"], [619, 391, "M619 391L760 543H822"],
  [293, 365, "M293 365L270 688H250"], [704, 684, "M704 684L860 733H913"],
];

const STEPS = [
  { t: "Impulse capture", b: "Vehicles brake over 27 trigger pairs; hydraulic cylinders turn momentum into vertical force.", kv: ["12 × 3 m plate", "9 × 3 pairs"], icon: <g><path d="M4 44H66" /><path d="M10 44a6 6 0 0 1 12 0M42 44a6 6 0 0 1 12 0" /><path d="M26 44a6 3 0 0 1 12 0" fill="#8DD270" /><circle cx="32" cy="22" r="12" /><path d="M32 4v6" stroke="#E5484D" /></g> },
  { t: "Hydraulic transmission", b: "Sealed, closed-loop lines carry each impulse to the converter beside the road.", kv: ["closed loop", "off the carriageway"], icon: <g><path d="M4 18H40" /><rect x="12" y="18" width="6" height="12" /><rect x="26" y="18" width="6" height="12" /><path d="M15 30V46H64V14" stroke="#5DBB3A" strokeWidth="3" /><path d="M29 30V46" stroke="#5DBB3A" strokeWidth="3" /></g> },
  { t: "Frictionless conversion", b: "Permanent magnetic bearings levitate the shaft — no contact, no wear, 90%+ efficiency.", kv: ["254× dynamo", "13,000× piezo"], icon: <g><path d="M6 32H64" strokeWidth="2.5" /><ellipse cx="22" cy="32" rx="4" ry="13" fill="#8DD270" stroke="none" /><ellipse cx="32" cy="32" rx="4" ry="17" fill="#8DD270" stroke="none" /><ellipse cx="42" cy="32" rx="4" ry="17" fill="#8DD270" stroke="none" /><ellipse cx="52" cy="32" rx="4" ry="13" fill="#8DD270" stroke="none" /><rect x="3" y="26" width="6" height="12" /><rect x="61" y="26" width="6" height="12" /></g> },
  { t: "Energy storage", b: "On-site batteries buffer traffic peaks and condition power for feed-in.", kv: ["day & night", "weather independent"], icon: <g><rect x="10" y="12" width="14" height="44" /><rect x="28" y="12" width="14" height="44" /><rect x="46" y="12" width="14" height="44" /><rect x="12" y="30" width="10" height="24" fill="#8DD270" stroke="none" /><rect x="30" y="20" width="10" height="34" fill="#8DD270" stroke="none" /><rect x="48" y="40" width="10" height="14" fill="#8DD270" stroke="none" /></g> },
  { t: "On-demand usage", b: "EV charging, lighting, machinery and facilities — or revenue from the grid.", kv: ["0 m² extra land", "20–25 years"], icon: <g><path d="M4 58H66" /><path d="M16 58V14h14" /><rect x="28" y="11" width="14" height="5" fill="#8DD270" /><rect x="40" y="32" width="14" height="26" rx="3" /><rect x="44" y="37" width="6" height="8" fill="#8DD270" /><path d="M4 54H40" stroke="#5DBB3A" strokeWidth="2.5" /></g> },
];


export default function RepsLight() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled && root.current) cleanup = initRepsLightMotion(root.current); });
    return () => { cancelled = true; cleanup?.(); };
  }, { scope: root });

  return (
    <div ref={root} className={`${s.root} ${geist.variable} ${mono.variable}`}>
      <header className={cx("nav", "glass")} data-nav="">
        <a className={s.logo} href="#top" aria-label="REPS home"><RepsLogo /></a>
        <nav className={s.links} aria-label="Main">{NAV.map(([l, h]) => <a key={l} href={h} data-navlink={h}>{l}</a>)}<a href="#contact">Contact</a></nav>
        <div className={s.navR}>
          <span className={cx("mono", "mu", "lang")}>EN · DE</span>
          <a className={cx("btn", "bk")} href="#contact" data-magnetic="">REPS on my roads <Arrow /></a>
          <RepsMenu host={root} links={[...NAV, ["Contact", "#contact"]]} cta={<a className={cx("btn", "bk")} href="#contact">REPS on my roads <Arrow /></a>} cls={{ btn: s.burger, panel: s.menu, links: s.menuLinks, foot: s.menuFoot }} />
        </div>
      </header>

      <main id="top">
        {/* hero — live 3D city map, energy flowing out from Hamburg */}
        <section className={s.hero} data-hero="">
          <canvas className={s.gl} data-gl-hero="" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.fallback} src={`${A}r-L-city.webp`} alt="" aria-hidden="true" />
          <div className={s.fade} />
          <div className={cx("pinh", "glass")} data-intro=""><span className={s.pd} /><span className={s.mono}>Move to steer · click for a burst</span></div>
          <div className={s.copy}>
            <div className={cx("tag", "mono")} data-intro=""><span className={s.dot} />Road Energy Production System</div>
            <h1 className={s.h1} data-h1="">Turning roads<br />into power plants.</h1>
            <p className={s.lead} data-intro="">REPS recovers the energy every braking truck loses — inside the roads you already own. Clean electricity, generated on site, day and night.</p>
            <div className={s.ctas} data-intro="">
              <a className={cx("btn", "bk")} href="#contact" data-magnetic="">Request a free potential analysis <Arrow /></a>
              <a className={cx("btn", "wh")} href="#film" data-play="">Watch the film <Arrow c="▶" /></a>
            </div>
          </div>
          <aside className={cx("live", "glass")} data-intro="">
            <div className={s.liveTop}><span className={s.mono}>World’s first Road Power Plant</span><span className={s.dot} /></div>
            <p className={s.liveH}>Hamburg Container Service · in operation since Nov 2025</p>
            <div className={s.liveRow}>
              <div><span className={cx("mono", "mu")}>Full rollout</span><b><span data-count="229">229</span><small>plates</small></b></div>
              <div><span className={cx("mono", "mu")}>Projected</span><b>~<span data-count="10">10</span><small>GWh/yr</small></b></div>
            </div>
          </aside>
          <div className={s.scroll} data-intro=""><i /><span className={s.mono}>Scroll to explore</span></div>
        </section>

        {/* logos */}
        <section className={s.logoSec} aria-label="Partners">
          <div className={s.lrow}>
            <span className={cx("mono", "mu")}>Trusted by ports, utilities<br />and logistics leaders</span>
            <div className={s.logos}><div className={s.logoTrack}>{[0, 1].map((k) => CLIENTS.map(([n, f, h]) => <img key={n + k} src={A + f} alt={k ? "" : n} aria-hidden={k ? true : undefined} style={{ height: h * 0.82 }} className={cx(k === 1 && "dup")} />))}</div></div>
          </div>
          <div className={s.lrow}>
            <span className={cx("mono", "mu")}>Backed &amp; recognised by</span>
            <div className={cx("logos", "logosSm")}><div className={s.logoTrack}>{[0, 1].map((k) => BACKERS.map(([n, f]) => <img key={n + k} src={A + f} alt={k ? "" : n} aria-hidden={k ? true : undefined} className={cx(k === 1 && "dup")} />))}</div></div>
          </div>
        </section>

        {/* the plate */}
        <section className={s.sec} id="technology">
          <div className={s.sh}>
            <div><Eyebrow>The product</Eyebrow><h2 className={s.h2} data-split="">Meet the REPS plate.<br /><span className={s.mu}>A power plant you drive over.</span></h2></div>
            <p className={s.body} data-rise="">A 12 × 3 m module that sits flush in the road. Trucks brake across it as usual — 27 trigger pairs turn that braking into clean electricity, with the sensitive hardware safely beside the road.</p>
          </div>
          <div data-plate-zone="">
          <div className={s.plateIn} data-plate-in="">
          <div className={s.plate} data-plate="">
            <div className={s.scan} data-plate-scan="" aria-hidden="true" />
            <picture>
              <source media="(max-width: 760px)" srcSet={`${A}r-L-plate-m.webp`} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${A}r-L-plate.webp`} alt="The REPS system: plate, trigger pairs, hydraulic lines, maglev converter and battery bank" data-plate-img="" />
            </picture>
            <svg className={s.leaders} viewBox="0 0 1304 820" fill="none" preserveAspectRatio="none" aria-hidden="true">
              <g stroke="#111311" strokeWidth="1.2" vectorEffect="non-scaling-stroke">
                {LEADERS.map(([, , d]) => <path key={d} d={d} data-leader="" vectorEffect="non-scaling-stroke" />)}
              </g>
              <g fill="#111311">{LEADERS.map(([x, y]) => <g key={x}><circle cx={x} cy={y} r="11" fill="#8DD270" opacity=".35" data-node-ring="" /><circle cx={x} cy={y} r="5" data-node="" /></g>)}</g>
            </svg>
            <div className={s.glare} aria-hidden="true" />
            {CALLOUTS.map((c) => (
              <div key={c.n} className={cx("call", "glass", c.m || "callD")} style={c.pos} data-call="">
                <span className={cx("mono", "gr")}>{c.n}</span><b>{c.t}</b><span className={s.callD2}>{c.d}</span>
              </div>
            ))}
          </div>
          </div>
          </div>
          <div className={s.specs}>
            {[["Efficiency", "90", "%+"], ["vs piezo", "13000", "×"], ["Extra land", "0", "m²"], ["Design life", "20–25", "yrs"], ["Weather", "Independent", ""]].map(([k, v, u]) => (
              <div key={k} className={s.card} data-rise="">
                <span className={cx("mono", "mu")}>{k}</span>
                <b className={cx(v === "Independent" && "bWord")}>{/^\d+$/.test(v) ? <span data-count={v}>{(+v).toLocaleString("en-GB")}</span> : v}{u && <small>{u}</small>}</b>
              </div>
            ))}
          </div>
        </section>

        {/* how it works — the 3D view follows the active step */}
        <section className={s.sec} data-how="">
          <div className={s.sh}>
            <div><Eyebrow>How it works</Eyebrow><h2 className={s.h2} data-split="">From a brake<br />to a battery in five steps.</h2></div>
            <p className={s.body} data-rise="">The 3D view follows your scroll — the camera travels from the plate, along the hydraulic lines, into the converter and out to the chargers.</p>
          </div>
          <div className={s.how}>
            <div className={s.visWrap}>
              <div className={s.vis}>
                <canvas className={s.gl} data-gl-how="" aria-hidden="true" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img className={s.fallback} src={`${A}r-L-s3.webp`} alt="" aria-hidden="true" />
                <div className={s.cnt}><span data-cnt="">01</span><small> / 05</small></div>
                <div className={s.visName} data-visname="">Impulse capture</div>
                <div className={s.vbar}><i data-vbar="" /></div>
              </div>
            </div>
            <ol className={s.stps}>
              {STEPS.map((st, i) => (
                <li key={st.t} className={cx("stp", "card")} data-step={i}>
                  <div className={s.ic}><svg viewBox="0 0 70 64" fill="none" stroke="currentColor" strokeWidth="1.6">{st.icon}</svg></div>
                  <div>
                    <span className={cx("mono", "stpN")}>0{i + 1}<em> · Now viewing</em></span>
                    <h3 className={s.h3}>{st.t}</h3>
                    <p className={s.body}>{st.b}</p>
                    <div className={s.kv}>{st.kv.map((k) => <span key={k} className={s.mono}>{k}</span>)}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <FilmSection />
        <ImpactSection />
        <GlanceSection />
        <CalculatorSection />
        <LocationsSection />
        <BeliefsSection />
        <PressSection />
        <FaqSection />
        <CtaSection />
      </main>

      <FooterSection />
    </div>
  );
}

