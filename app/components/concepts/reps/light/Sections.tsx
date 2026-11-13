"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import s from "./light.module.css";
import f from "./sections.module.css";
import { RepsLogo } from "../logo";
import { A, FACES, FAQ, LOCATIONS, PEOPLE, PRESS_WALL, potential } from "../data";

/** class helper across both modules: a name gets its class from light.module.css and sections.module.css */
const cx = (...n: (string | false | undefined)[]) => n.filter(Boolean).map((k) => [s[k as string], f[k as string]].filter(Boolean).join(" ")).filter(Boolean).join(" ");
const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");
const Arrow = ({ c = "→" }: { c?: string }) => <i aria-hidden="true">{c}</i>;
const Eyebrow = ({ children, dark }: { children: React.ReactNode; dark?: boolean }) => <div className={cx("eyebrow", "mono", dark && "eyebrowDk")} data-rise=""><i />{children}</div>;

/* ───────────────────────── film: the frame grows from a card to full-bleed as you scroll ───────────────────────── */
export function FilmSection() {
  const [open, setOpen] = useState(false);
  const modal = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const go = () => setOpen(true);
    window.addEventListener("reps:play", go);
    return () => window.removeEventListener("reps:play", go);
  }, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    modal.current?.play().catch(() => {});
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <section className={f.film} id="film" data-filmsec="">
      <div className={f.filmPin}>
        <h2 className={cx("filmWord", "filmL")} data-film-l="">One plate.</h2>
        <h2 className={cx("filmWord", "filmR")} data-film-r="">Every road.</h2>
        <div className={f.filmFrame} data-film-frame="" onClick={() => setOpen(true)} role="button" tabIndex={0} aria-label="Play the REPS film" onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(true); } }}>
          <video src={`${A}film.mp4`} poster={`${A}video-poster.webp`} muted loop playsInline preload="metadata" data-film-video="" />
          <div className={f.filmShade} />
          <div className={f.filmCursor} data-film-cursor="" aria-hidden="true"><span className={f.filmCursorDot}><i /></span><span>Play film</span></div>
          <div className={f.filmMeta}><span className={cx("mono")}>The REPS film · 0:36</span><span className={cx("mono")}>Sound on</span></div>
        </div>
      </div>
      {open && (
        <div className={f.modal} onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label="The REPS film">
          <video ref={modal} src={`${A}film.mp4`} controls playsInline autoPlay onClick={(e) => e.stopPropagation()} />
          <button type="button" className={f.modalX} onClick={() => setOpen(false)} aria-label="Close film">×</button>
        </div>
      )}
    </section>
  );
}

/* ───────────────────────── impact: a live diagram of the HCS gate ───────────────────────── */
export function ImpactSection() {
  return (
    <section className={s.sec} id="impact">
      <div className={s.sh}>
        <div><Eyebrow>Impact · Port of Hamburg</Eyebrow><h2 className={cx("h2")} data-split="">The world’s first<br />Road Power Plant <span className={s.mu}>is live.</span></h2></div>
        <p className={cx("body")} data-rise="">Installed at Hamburg Container Service — a 125,000 m² terminal with around 1,000 truck movements a day, working towards climate neutrality by 2040.</p>
      </div>
      <div className={f.impGrid}>
        <div className={cx("card", "gate")} data-gate="">
          <div className={f.gateHead}>
            <div><span className={cx("mono", "mu")}>HCS · Gate lane · simulation</span><p className={f.gateTitle}>Every truck through the gate feeds the terminal.</p></div>
            <div className={f.gateStats}>
              <div><span className={cx("mono", "mu")}>Trucks crossed</span><b data-gate-trucks="">0</b></div>
              <div><span className={cx("mono", "mu")}>Harvested</span><b><span data-gate-kwh="">0.0</span><small>kWh</small></b></div>
            </div>
          </div>
          <GateDiagram />
          <div className={f.gateLegend}>
            {[["plate", "REPS plate"], ["line", "Hydraulic line"], ["ecm", "Converter"], ["bat", "Storage"], ["out", "Lights & chargers"]].map(([k, l]) => <span key={k} className={cx("mono", "mu")}><i data-k={k} />{l}</span>)}
          </div>
        </div>
        <div className={f.impSide}>
          <div className={f.impPhoto} data-reveal="">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`${A}plate-164.webp`} alt="An electric truck crossing the first REPS plate at Hamburg Container Service" loading="lazy" data-parallax="" />
            <div className={cx("tag", "mono", "phTag")}><span className={s.dot} />Live since Nov 2025</div>
          </div>
          <div className={f.impStats}>
            <div className={cx("card", "dk")} data-rise=""><span className={cx("mono")}>Full rollout</span><b><span data-count="229">229</span><small>plates</small></b></div>
            <div className={cx("card", "gn2")} data-rise=""><span className={cx("mono")}>Clean electricity</span><b>~<span data-count="10">10</span><small>GWh/yr</small></b></div>
            <div className={cx("card")} data-rise=""><span className={cx("mono", "mu")}>Port-traffic CO₂</span><b>−<span data-count="10">10</span><small>%</small></b></div>
            <div className={cx("card")} data-rise=""><span className={cx("mono", "mu")}>Payback</span><b>&lt;<span data-count="4">4</span><small>years</small></b></div>
          </div>
        </div>
      </div>
      <div className={f.reel} data-reel="">
        {[["plate-173.webp", "Opening day at HCS", "24 Nov 2025"], ["plate-64.webp", "Alfons Huber, Founder & CEO", "Launch"], ["plate-38.webp", "Partners & port authority", "Launch"], ["hh.webp", "Port of Hamburg", "Site"], ["plate-139.jpg", "Trigger pairs, up close", "Detail"]].map(([img, c, k], i) => (
          <figure key={img} data-reel-item="">
            <div className={f.reelImg}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={A + img} alt={c} loading="lazy" draggable={false} />
            </div>
            <figcaption><span className={cx("mono", "gr")}>0{i + 1} · {k}</span><span>{c}</span></figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function GateDiagram() {
  const grid = [];
  for (let x = 0; x <= 820; x += 20) grid.push(<path key={`x${x}`} d={`M${x} 0V520`} />);
  for (let y = 0; y <= 520; y += 20) grid.push(<path key={`y${y}`} d={`M0 ${y}H820`} />);
  return (
    <svg className={f.gateSvg} viewBox="0 0 820 520" fill="none" aria-label="Animated diagram: trucks braking over the REPS plate at the terminal gate power the converter, storage, lights and chargers">
      <g stroke="#ECEEE9" strokeWidth="1">{grid}</g>
      {/* yard */}
      <rect x="0" y="40" width="820" height="150" fill="#EEF0EB" />
      {[60, 150, 240, 330, 420, 510, 600, 690].map((x, i) => <g key={x}><rect x={x} y={70 + (i % 2) * 10} width="70" height="26" rx="3" fill={["#D8DCD3", "#C9D7C0", "#DCE0D8", "#CFD3CB"][i % 4]} /><rect x={x + 6} y={110 + (i % 3) * 8} width="64" height="26" rx="3" fill={["#CFD3CB", "#D8DCD3", "#C3D1BA"][i % 3]} /></g>)}
      <text x="20" y="62" className={f.svgLabel}>Container yard</text>
      {/* road: outbound lane (top), inbound lane (bottom) */}
      <rect x="0" y="230" width="820" height="120" fill="#E3E5E0" />
      <path d="M0 290H820" stroke="#fff" strokeWidth="3" strokeDasharray="22 16" />
      <path d="M0 230H820M0 350H820" stroke="#CDD1C9" strokeWidth="2" />
      {/* gate */}
      <g data-gate-barrier="">
        <rect x="560" y="214" width="10" height="152" rx="2" fill="#111311" />
        <rect x="566" y="214" width="6" height="16" fill="#E5484D" />
      </g>
      <text x="580" y="224" className={f.svgLabel}>Gate 3 · inbound</text>
      {/* the plate */}
      <g data-gate-plate="">
        <rect x="300" y="296" width="120" height="48" rx="4" fill="#2B2F2B" />
        {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${300 + (i + 1) * 13.3} 296V344`} stroke="#3F443F" />)}
        {Array.from({ length: 27 }, (_, i) => [0, 1].map((r) => <rect key={`${i}${r}`} x={302 + i * 4.35} y={r ? 326 : 304} width="2.6" height="14" rx="1.3" fill="#8A908A" />))}
        <rect x="300" y="296" width="120" height="48" rx="4" fill="#8DD270" opacity="0" data-gate-glow="" />
      </g>
      <text x="300" y="370" className={f.svgLabel}>REPS plate · 12 × 3 m</text>
      {/* roadside: converter, storage, outputs */}
      <path id="gate-p1" d="M360 344V420" stroke="#C9CDC5" strokeWidth="4" strokeLinecap="round" />
      <path id="gate-p2" d="M400 446H468" stroke="#C9CDC5" strokeWidth="4" strokeLinecap="round" />
      <path id="gate-p3" d="M548 446H790" stroke="#C9CDC5" strokeWidth="4" strokeLinecap="round" />
      <g data-gate-ecm="">
        <rect x="320" y="420" width="80" height="54" rx="8" fill="#fff" stroke="#111311" strokeWidth="1.5" />
        <circle cx="360" cy="447" r="14" stroke="#111311" strokeWidth="1.5" data-gate-rotor="" />
        <path d="M346 447H374M360 433V461" stroke="#111311" strokeWidth="1.5" data-gate-rotor="" />
      </g>
      <text x="318" y="494" className={f.svgLabel}>Converter</text>
      <g>
        <rect x="468" y="420" width="80" height="54" rx="8" fill="#fff" stroke="#111311" strokeWidth="1.5" />
        {[0, 1, 2].map((i) => <g key={i}><rect x={480 + i * 20} y="428" width="14" height="38" rx="3" fill="#EEF0EB" stroke="#111311" /><rect x={482 + i * 20} y="464" width="10" height="0" rx="1.5" fill="#5DBB3A" data-gate-cell={i} /></g>)}
      </g>
      <text x="470" y="494" className={f.svgLabel}>Storage</text>
      <g data-gate-charger="">
        <rect x="600" y="410" width="30" height="64" rx="6" fill="#fff" stroke="#111311" strokeWidth="1.5" />
        <rect x="607" y="420" width="16" height="14" rx="2" fill="#EEF0EB" data-gate-screen="" />
      </g>
      {[680, 730, 780].map((x, i) => <g key={x}><path d={`M${x} 474V408H${x - 18}`} stroke="#111311" strokeWidth="1.5" /><rect x={x - 30} y="404" width="16" height="6" rx="2" fill="#D3D7CF" data-gate-lamp={i} /></g>)}
      <text x="600" y="494" className={f.svgLabel}>Chargers · lighting</text>
      {/* trucks are drawn by the motion loop */}
      <g data-gate-trucks-layer="" />
      <g data-gate-pulses="" />
    </svg>
  );
}

/* ───────────────────────── at a glance: comparison + bento ───────────────────────── */
export function GlanceSection() {
  const dots = [];
  for (let r = 0; r < 9; r++) for (let c = 0; c < 26; c++) {
    const lit = (r * 7 + c * 13) % 9 === 0 || (r * 3 + c * 5) % 17 === 0;
    dots.push(<i key={`${r}-${c}`} className={lit ? f.site : undefined} style={lit ? { animationDelay: `${((r * 26 + c) * 37) % 4000}ms` } : undefined} />);
  }
  return (
    <section className={s.sec}>
      <div className={s.sh}>
        <div><Eyebrow>At a glance</Eyebrow><h2 className={cx("h2")} data-split="">Not a little better.<br /><span className={s.mu}>Orders of magnitude.</span></h2></div>
        <p className={cx("body")} data-rise="">Energy recovered per braking event, compared with existing harvesting technologies. Log scale; source REPS.</p>
      </div>
      <div className={cx("card", "cmp2")}>
        {[["REPS", "hydraulic + magnetic levitation", 100, 13000, true], ["Dynamo systems", "mechanical contact", 41.6, 51, false], ["Piezo tiles", "the baseline", 3, 1, false]].map(([n, d, w, v, g]) => (
          <div key={n as string} className={f.cmpRow}>
            <div><b>{n}</b><span className={cx("mono", "mu")}>{d}</span></div>
            <div className={f.cmpTrack}><i className={cx(g === true && "cmpG")} data-bar-w={w}><em /></i></div>
            <div className={f.cmpV}><span data-count={v}>{fmt(v as number)}</span>×</div>
          </div>
        ))}
        <div className={f.cmpAxis}><span />{["1×", "10×", "100×", "1,000×", "10,000×"].map((t) => <span key={t} className={cx("mono", "mu")}>{t}</span>)}</div>
      </div>
      <div className={f.bento}>
        <div className={cx("card", "bGauge")} data-rise="">
          <span className={cx("mono", "mu")}>System efficiency</span>
          <svg viewBox="0 0 220 130" className={f.gauge} fill="none" aria-hidden="true">
            <path d="M20 115A90 90 0 0 1 200 115" stroke="#EEF0EB" strokeWidth="16" strokeLinecap="round" />
            <path d="M20 115A90 90 0 0 1 200 115" stroke="url(#gg)" strokeWidth="16" strokeLinecap="round" data-gauge="" />
            <defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stopColor="#8DD270" /><stop offset="1" stopColor="#3F8A22" /></linearGradient></defs>
            {Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (1 - i / 10); return <path key={i} d={`M${110 + Math.cos(a) * 68} ${115 - Math.sin(a) * 68}L${110 + Math.cos(a) * 74} ${115 - Math.sin(a) * 74}`} stroke="#C9CDC5" strokeWidth="1.5" />; })}
          </svg>
          <b className={f.bigN}><span data-count="90">90</span><small>%+</small></b>
          <p className={cx("body")}>of captured braking energy becomes electricity — the shaft floats on magnets, so almost nothing is lost to friction.</p>
        </div>
        <div className={cx("card", "bLand")} data-rise="">
          <span className={cx("mono", "mu")}>Extra land</span>
          <svg viewBox="0 0 300 120" className={f.land} fill="none" aria-hidden="true">
            <rect x="0" y="40" width="300" height="22" fill="#2B2F2B" />
            <rect x="0" y="62" width="300" height="34" fill="#D9DCD5" />
            <rect x="0" y="96" width="300" height="24" fill="#C9CCC3" />
            <rect x="96" y="40" width="108" height="22" fill="#8DD270" data-land-plate="" />
            {Array.from({ length: 9 }, (_, i) => <path key={i} d={`M${100 + i * 12} 44h6`} stroke="#2B2F2B" strokeWidth="3" strokeLinecap="round" />)}
            <rect x="96" y="62" width="108" height="14" fill="#B5BAAF" />
            <path d="M96 30V36M204 30V36M96 33H204" stroke="#111311" />
            <text x="150" y="24" textAnchor="middle" className={f.svgLabel}>flush with the surface</text>
            <text x="212" y="74" className={f.svgLabel}>12.5 cm foundation</text>
          </svg>
          <b className={f.bigN}><span data-count="0">0</span><small>m²</small></b>
          <p className={cx("body")}>It lives inside roads you already own. No new sealed surfaces.</p>
        </div>
        <div className={cx("card", "bLife")} data-rise="">
          <span className={cx("mono", "mu")}>Design life</span>
          <div className={f.life}>
            <div className={f.lifeTrack}><i data-life="" /><em className={f.lifeBand} /></div>
            <div className={f.lifeTicks}>{[0, 5, 10, 15, 20, 25].map((y) => <span key={y} className={cx("mono", "mu")}>{y}</span>)}</div>
            <div className={f.lifeYears}>{Array.from({ length: 25 }, (_, i) => <i key={i} />)}</div>
          </div>
          <div className={f.lifeRow}><b className={f.bigN}>20–25<small>years</small></b><p className={cx("body")}>under continuous heavy-truck loads, with one inspection a year.</p></div>
        </div>
        <div className={cx("card", "bSites")} data-rise="">
          <div className={f.sitesHead}><span className={cx("mono", "mu")}>Global potential</span><b className={f.bigN}><span data-count="1000">1,000</span><small>+ sites</small></b></div>
          <div className={f.dots} aria-hidden="true">{dots}</div>
          <p className={cx("body")}>Ports, toll plazas, exit ramps and logistics hubs identified so far — anywhere heavy traffic has to brake.</p>
        </div>
        <div className={cx("card", "bWeather")} data-rise="">
          <span className={cx("mono", "mu")}>Weather independent</span>
          <div className={f.wx} aria-hidden="true">
            <div className={f.wxIcons}>
              <svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="9" fill="#F2C94C" />{Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M${24 + Math.cos(a) * 14} ${24 + Math.sin(a) * 14}L${24 + Math.cos(a) * 19} ${24 + Math.sin(a) * 19}`} stroke="#F2C94C" strokeWidth="3" strokeLinecap="round" />; })}</svg>
              <svg viewBox="0 0 48 48"><path d="M30 8a16 16 0 1 0 10 28A14 14 0 0 1 30 8z" fill="#111311" /></svg>
              <svg viewBox="0 0 48 48"><path d="M14 28a8 8 0 0 1 2-15.8A11 11 0 0 1 37 16a7 7 0 0 1-1 14H14z" fill="#C9CDC5" />{[16, 24, 32].map((x) => <path key={x} d={`M${x} 34l-3 8`} stroke="#5B8DEF" strokeWidth="3" strokeLinecap="round" />)}</svg>
              <svg viewBox="0 0 48 48"><path d="M14 26a8 8 0 0 1 2-15.8A11 11 0 0 1 37 14a7 7 0 0 1-1 14H14z" fill="#C9CDC5" />{[16, 24, 32].map((x) => <circle key={x} cx={x} cy="38" r="2.6" fill="#9CB4D8" />)}</svg>
            </div>
            <div className={f.wxWords}><span>Day</span><span>Night</span><span>Rain</span><span>Snow</span></div>
          </div>
          <p className={cx("body")}>Traffic brakes whatever the sky does — unlike solar or wind.</p>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── potential calculator ───────────────────────── */
export function CalculatorSection() {
  const [trucks, setTrucks] = useState(1000);
  const [plates, setPlates] = useState(24);
  const r = potential(trucks, plates);
  const pct = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`;
  const lit = Math.max(1, Math.round((plates / 229) * 96));
  return (
    <section className={s.sec} id="potential">
      <div className={s.sh}>
        <div><Eyebrow>Potential</Eyebrow><h2 className={cx("h2")} data-split="">What would your road<br /><span className={s.mu}>give back?</span></h2></div>
        <p className={cx("body")} data-rise="">Move the sliders. We scale from the Hamburg projection — 229 plates, ~1,000 trucks a day, ~10 GWh a year — so you can see the order of magnitude before we run a real analysis.</p>
      </div>
      <div className={f.calc}>
        <div className={cx("card", "calcIn")} data-rise="">
          <label className={f.sl}>
            <span className={f.slT}><span className={cx("mono", "mu")}>Heavy vehicles per day</span><output>{fmt(trucks)}</output></span>
            <input type="range" min={100} max={5000} step={50} value={trucks} onChange={(e) => setTrucks(+e.target.value)} style={{ ["--p" as string]: pct(trucks, 100, 5000) }} />
            <span className={f.slScale}><span className={cx("mono", "mu")}>100</span><span className={cx("mono", "mu")}>5,000</span></span>
          </label>
          <label className={f.sl}>
            <span className={f.slT}><span className={cx("mono", "mu")}>REPS plates</span><output>{plates}</output></span>
            <input type="range" min={1} max={229} step={1} value={plates} onChange={(e) => setPlates(+e.target.value)} style={{ ["--p" as string]: pct(plates, 1, 229) }} />
            <span className={f.slScale}><span className={cx("mono", "mu")}>1</span><span className={cx("mono", "mu")}>229 · full HCS rollout</span></span>
          </label>
          <div className={f.plates} aria-hidden="true">{Array.from({ length: 96 }, (_, i) => <i key={i} data-on={i < lit ? "" : undefined} style={{ transitionDelay: `${(i % 24) * 8}ms` }} />)}</div>
          <p className={f.fine}>Illustrative. Linear scale of the HCS projection; 380 g CO₂/kWh grid mix; 3,500 kWh per household.</p>
        </div>
        <div className={cx("card", "calcOut")} data-rise="">
          <div className={f.outMain}><span className={cx("mono")}>Clean electricity</span><b>{fmt(r.mwh)}<small>MWh / year</small></b></div>
          <div className={f.outGrid}>
            <div><span className={cx("mono")}>CO₂ avoided</span><b>{fmt(r.co2)}<small>t/yr</small></b></div>
            <div><span className={cx("mono")}>Truck charges</span><b>{fmt(r.charges)}<small>/yr</small></b></div>
            <div><span className={cx("mono")}>Households</span><b>{fmt(r.homes)}</b></div>
          </div>
          <a className={cx("btn", "gn", "send")} href="#contact">Get the real numbers for my site <Arrow /></a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── where it works: one immersive stage ───────────────────────── */
export function LocationsSection() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(7000), lastI = useRef(0);
  useEffect(() => {
    if (lastI.current !== i) { lastI.current = i; remaining.current = 7000; }
    if (paused) return;
    const started = performance.now();
    const t = setTimeout(() => setI((v) => (v + 1) % LOCATIONS.length), remaining.current);
    return () => { clearTimeout(t); remaining.current = Math.max(0, remaining.current - (performance.now() - started)); };
  }, [i, paused]);
  const L = LOCATIONS[i];
  return (
    <section className={s.sec} id="locations">
      <div className={s.sh}>
        <div><Eyebrow>Where it works</Eyebrow><h2 className={cx("h2")} data-split="">Wherever traffic<br />slows down anyway.</h2></div>
        <p className={cx("body")} data-rise="">REPS is designed for areas with high-frequency traffic where vehicles need to slow down anyway. Three environments, one rule.</p>
      </div>
      <div className={f.stage} data-reveal="">
        {LOCATIONS.map((l, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={l.img} src={A + l.img} alt="" className={cx("stageImg", k === i && "on")} loading="lazy" />
        ))}
        <div className={f.stageShade} />
        {L.pins.map(([t, x, y], k) => (
          <div key={`${i}-${t}`} className={f.hot} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${0.3 + k * 0.15}s` }}>
            <span className={f.hotDot} /><span className={cx("hotTip", "mono")}>{t}</span>
          </div>
        ))}
        <div className={cx("stageInfo", "glass")} key={i}>
          <span className={cx("mono", "gr")}>0{i + 1} · {L.short}</span>
          <h3 className={cx("h3", "stageH")}>{L.head}</h3>
          <dl>
            <div><dt className={cx("mono", "mu")}>Best locations</dt><dd>{L.best}</dd></div>
            <div><dt className={cx("mono", "mu")}>Traffic profile</dt><dd>{L.traffic}</dd></div>
            <div><dt className={cx("mono", "mu")}>Electricity usage</dt><dd>{L.use}</dd></div>
          </dl>
          <a className={cx("btn", "bk")} href="#contact">Check my site <Arrow /></a>
        </div>
        <div className={cx("stageTabs", "glass")} role="tablist" aria-label="Locations" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          {LOCATIONS.map((l, k) => (
            <button key={l.name} type="button" role="tab" aria-selected={k === i} className={cx(k === i && "on")} onClick={() => setI(k)}>
              <span className={cx("mono")}>0{k + 1}</span>{l.short}
              {k === i && <i><b key={i} data-paused={paused ? "" : undefined} /></i>}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── what we believe: manifesto, team, values ───────────────────────── */
const VALS = [
  { t: "Innovation through action", p: "From prototype to a live road power plant at the Port of Hamburg." },
  { t: "Ownership with purpose", p: "Every plate is measured against one goal: cleaner traffic." },
  { t: "Human, honest, driven", p: "Real numbers, real sites, real people." },
  { t: "Team first, always", p: "Nine engineers and operators, one system." },
];
export function BeliefsSection() {
  return (
    <section className={s.sec} id="team">
      <div className={f.manifesto}>
        <Eyebrow>What we believe</Eyebrow>
        <p className={f.manifestoP} data-manifesto="">
          We didn’t stop at a lab prototype. The first REPS plate carries real trucks at the Port of Hamburg — and every plate we build is measured against one goal: <em>cleaner traffic</em>, on roads that already exist.
        </p>
      </div>
      <div className={f.teamStage} data-team-stage="">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${A}team.webp`} alt="The REPS team in the Austrian Alps" loading="lazy" data-team-img="" />
        <div className={f.teamShade} />
        <div className={f.teamCap}>
          <div className={f.faces}>{FACES.map((x) => <img key={x} src={A + x} alt="" loading="lazy" />)}</div>
          <span className={cx("mono")}>9 people · Innsbruck → Hamburg</span>
        </div>
      </div>
      <ol className={f.vals}>
        {VALS.map((v, i) => (
          <li key={v.t} data-rise="">
            <span className={cx("mono", "gr")}>0{i + 1}</span>
            <h4>{v.t}</h4>
            <p className={cx("body")}>{v.p}</p>
          </li>
        ))}
      </ol>
      <div className={f.people}>
        {PEOPLE.map((p) => (
          <figure key={p.n} className={f.per} data-rise="">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={A + p.img} alt={p.n} loading="lazy" />
            <figcaption><b>{p.n}</b><span className={cx("mono", "mu")}>{p.r}</span></figcaption>
          </figure>
        ))}
        <a className={cx("card", "join")} href="https://www.reps.energy/" target="_blank" rel="noreferrer" data-rise="">
          <span className={cx("mono", "gr")}>+6 more · we’re hiring</span>
          <ul>{["Business Operations", "Electrical Engineering", "Commercial Development", "Field Engineering"].map((r) => <li key={r}>{r}<span aria-hidden="true">↗</span></li>)}</ul>
          <span className={cx("btn", "bk", "joinBtn")}>Open roles <Arrow /></span>
        </a>
      </div>
    </section>
  );
}

/* ───────────────────────── press ───────────────────────── */
export function PressSection() {
  return (
    <section className={s.sec} id="press">
      <div className={f.fund}>
        <div>
          <Eyebrow>News &amp; press</Eyebrow>
          <div className={f.fundN} data-fund="">$<span data-count="23.6" data-dec="1">23.6</span>M</div>
          <p className={f.fundL}>raised to scale road power plants — <span className={s.mu}>equity round, May 2026.</span></p>
        </div>
        <a className={cx("btn", "wh")} href="https://www.reps.energy/" target="_blank" rel="noreferrer">All articles <Arrow /></a>
      </div>
      <div className={f.marquee} aria-label="As featured in">
        <div className={f.marqueeTrack}>{[0, 1].map((k) => PRESS_WALL.map(([n, img]) => <img key={n + k} src={A + img} alt={k ? "" : n} aria-hidden={k ? true : undefined} />))}</div>
      </div>
      <div className={f.arts}>
        {[["AP News", "plate-173.webp", "REPS: a patented road power plant that harvests energy from passing trucks and cars.", "Press release"], ["Yahoo Finance", "plate-64.webp", "REPS announces a $23.6M equity round to scale its Road Energy Production System.", "Press release"]].map(([src, img, t, k]) => (
          <a key={src} className={cx("card", "art2")} href="https://www.reps.energy/" target="_blank" rel="noreferrer" data-rise="">
            <div className={f.art2T}><img src={A + img} alt="" loading="lazy" /><span className={cx("tag", "mono", "liveTag")}>{src}</span></div>
            <div className={f.art2B}><span className={cx("mono", "mu")}>{src} · {k} · 22 May 2026</span><h3 className={cx("h3")}>{t}</h3><span className={f.art2Go} aria-hidden="true">↗</span></div>
          </a>
        ))}
        <a className={cx("card", "art2", "art2Dk")} href="https://www.reps.energy/" target="_blank" rel="noreferrer" data-rise="">
          <div className={cx("art2T", "art2Ph")}><img src={`${A}plate-38.webp`} alt="" loading="lazy" /><span className={cx("tag", "mono", "liveTag")}><span className={s.dot} />Webinar</span></div>
          <div className={f.art2B}><span className={cx("mono")}>Live session · REPS team</span><h3 className={cx("h3")}>Energy harvesting at ports: how the HCS plant was built.</h3><span className={f.art2Go} aria-hidden="true">↗</span></div>
        </a>
      </div>
    </section>
  );
}

/* ───────────────────────── faq ───────────────────────── */
export function FaqSection() {
  const [open, setOpen] = useState(0);
  return (
    <section className={s.sec}>
      <div className={f.faq}>
        <div className={f.faqL}>
          <Eyebrow>FAQ</Eyebrow>
          <h2 className={cx("h2")} data-split="">Questions,<br /><span className={s.mu}>answered.</span></h2>
          <div className={cx("card", "talk")} data-rise="">
            <div className={f.faces}>{FACES.slice(0, 3).map((x) => <img key={x} src={A + x} alt="" loading="lazy" />)}</div>
            <p><b>Talk to an engineer.</b> Not sure your roads qualify? The potential analysis is free of charge.</p>
            <a className={cx("btn", "bk")} href="#contact">Book a call <Arrow /></a>
          </div>
        </div>
        <div className={f.qs}>
          {FAQ.map(([q, a], i) => (
            <div key={q} className={cx("q2", open === i && "on")}>
              <button type="button" className={f.q2T} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span className={cx("mono", "mu")}>0{i + 1}</span><span className={f.q2Q}>{q}</span><span className={f.q2Pm} aria-hidden="true"><i /><i /></span>
              </button>
              <div className={f.q2A}><div><p>{a}</p></div></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── cta: the plates spell REPS in 3D behind the form ───────────────────────── */
export function CtaSection() {
  const [type, setType] = useState("Port / terminal");
  const [sent, setSent] = useState(false);
  return (
    <section className={f.cta} id="contact" data-cta="">
      <canvas className={f.ctaGl} data-gl-cta="" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={cx("fallback")} src={`${A}r-L-hero.webp`} alt="" aria-hidden="true" />
      <div className={f.ctaShade} />
      <div className={f.ctaIn}>
        <div className={f.ctaL}>
          <div className={cx("tag", "mono")}><span className={s.dot} />Free potential analysis</div>
          <h2 className={cx("h1", "ctaH")} data-split="">REPS on<br />my roads.</h2>
          <p className={cx("lead")}>Tell us where traffic slows on your site. We’ll map the plates, the energy and the payback — free of charge.</p>
          <ul className={f.ctaList}>{["Site visit & traffic count", "Plate layout and yield model", "Payback and CO₂ report"].map((t) => <li key={t}><span className={s.dot} />{t}</li>)}</ul>
        </div>
        <form
          className={cx("form2", "glass")}
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            const body = `Site type: ${type}%0D%0AHeavy vehicles per day: ${d.get("trucks")}%0D%0ACompany: ${d.get("company")}%0D%0AEmail: ${d.get("email")}`;
            window.location.href = `mailto:office@reps.energy?subject=Free%20potential%20analysis&body=${body}`;
            setSent(true);
          }}
        >
          <div className={f.fld}>
            <span className={cx("mono", "mu")}>Site type</span>
            <div className={f.seg} role="radiogroup" aria-label="Site type">
              {["Port / terminal", "Highway", "Logistics hub"].map((t) => <button key={t} type="button" role="radio" aria-checked={type === t} className={cx(type === t && "on")} onClick={() => setType(t)}>{t}</button>)}
            </div>
          </div>
          <label className={f.fld}><span className={cx("mono", "mu")}>Heavy vehicles per day</span><input name="trucks" inputMode="numeric" placeholder="~1,000" /></label>
          <label className={f.fld}><span className={cx("mono", "mu")}>Company</span><input name="company" placeholder="Company name" autoComplete="organization" /></label>
          <label className={f.fld}><span className={cx("mono", "mu")}>Work email</span><input name="email" type="email" required placeholder="name@company.com" autoComplete="email" /></label>
          <button type="submit" className={cx("btn", "bk", "send")}>{sent ? "Opening your mail app…" : "Send request"} <Arrow /></button>
        </form>
      </div>
    </section>
  );
}

/* ───────────────────────── footer: the wordmark writes itself ───────────────────────── */
export function FooterSection() {
  return (
    <footer className={f.foot}>
      <div className={f.fTop}>
        <p className={f.fLine}>Turning roads<br />into power plants.</p>
        <a className={cx("btn", "bk")} href="#contact">REPS on my roads <Arrow /></a>
      </div>
      <div className={f.fg}>
        <div><p className={cx("mono", "mu")}>Company</p><a href="#team">About us</a><a href="#team">Career</a><a href="#press">News &amp; Events</a><a href="#contact">Contact</a></div>
        <div><p className={cx("mono", "mu")}>Technology</p><a href="#technology">The plate</a><a href="#technology">How it works</a><a href="#locations">Locations</a><a href="#potential">Potential</a></div>
        <div><p className={cx("mono", "mu")}>Follow</p><a href="https://www.linkedin.com/company/reps-energy" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a></div>
        <div><p className={cx("mono", "mu")}>Legal</p><a href="https://www.reps.energy/" target="_blank" rel="noreferrer">Imprint</a><a href="https://www.reps.energy/" target="_blank" rel="noreferrer">Privacy Policy</a></div>
      </div>
      <div className={f.fmark} data-fmark=""><RepsLogo /></div>
      <div className={cx("fb", "mono", "mu")}><span>© 2026 REPS GmbH · Innsbruck, Austria</span><span>Concept for REPS by <Link href="/">David Adebayo ↗</Link></span></div>
    </footer>
  );
}
