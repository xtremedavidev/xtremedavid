"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import { hostGrotesk as host, jetbrainsMono as mono } from "@/app/components/concepts/fonts";
import s from "./dark.module.css";
import { RepsLogo } from "../logo";
import { RepsMenu } from "../menu";
import { A, ARTICLES, BACKERS, CLIENTS, FACES, FAQ, LOCATIONS, NAV, PEOPLE, PRESS_WALL, STEPS, VALUES, potential } from "../data";
import { initRepsDarkMotion } from "./motion";

const cx = (...n: (string | false | undefined)[]) => n.filter(Boolean).map((k) => s[k as string]).filter(Boolean).join(" ");
const fmt = (n: number) => Math.round(n).toLocaleString("en-GB");

const SIDES = ["l", "r", "l", "r", "l"] as const;

export default function RepsDark() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled && root.current) cleanup = initRepsDarkMotion(root.current); });
    return () => { cancelled = true; cleanup?.(); };
  }, { scope: root });

  return (
    <div ref={root} className={`${s.root} ${host.variable} ${mono.variable}`}>
      <div className={s.loader} data-loader="" aria-hidden="true">
        <RepsLogo className={s.loaderLogo} />
        <div className={s.loaderRow}><span className={s.mono}>Road Energy Production System</span><span className={s.mono} data-pct="">000</span></div>
        <div className={s.loaderBar}><i data-bar="" /></div>
      </div>

      <canvas className={s.gl} data-gl="" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={s.glFallback} src={`${A}r-hero.webp`} alt="" aria-hidden="true" />

      <header className={s.nav} data-nav="">
        <a className={s.navLogo} href="#top" aria-label="REPS home"><RepsLogo /></a>
        <nav className={s.pill} aria-label="Main">
          {NAV.map(([l, h]) => <a key={l} href={h} data-navlink={h}>{l}</a>)}
        </nav>
        <div className={s.navR}>
          <span className={cx("mono", "dim", "lang")}><b>EN</b> / DE</span>
          <a className={cx("btn", "btnG", "btnSm")} href="#contact" data-magnetic="">REPS on my roads <span aria-hidden="true">→</span></a>
          <RepsMenu host={root} links={NAV} cta={<a className={cx("btn", "btnG")} href="#contact">REPS on my roads →</a>} cls={{ btn: s.burger, panel: s.menu, links: s.menuLinks, foot: s.menuFoot }} />
        </div>
      </header>

      <main id="top">
        {/* 00 — hero over the live scene */}
        <section className={s.hero} data-hero="">
          <div className={s.shadeTop} /><div className={s.shadeL} />
          <div className={cx("heroMeta", "mono", "dim")} data-intro=""><span>53.5398° N, 9.9381° E</span><span>HCS · Port of Hamburg</span></div>
          <div className={s.heroCopy}>
            <h1 className={s.h1} data-h1=""><span>The road is</span><span className={s.l2}>the power plant.</span></h1>
            <div className={s.heroFoot} data-intro="">
              <p className={s.lead}>Every braking truck throws energy away as heat. REPS catches it inside the road you already have — and turns it into clean power on site.</p>
              <div className={s.ctas}>
                <a className={cx("btn", "btnG")} href="#contact" data-magnetic="">Get a free potential analysis <span aria-hidden="true">→</span></a>
                <a className={cx("btn", "btnO")} href="#technology">See how it works</a>
              </div>
            </div>
          </div>
          <aside className={cx("live", "glass")} data-intro="" data-live="">
            <div className={cx("liveTop", "mono")}><i className={s.dot} />Live simulation · 1 truck · 1 plate</div>
            <div className={s.liveRow}>
              <div><div className={cx("mono", "dim")}>Trigger impulses</div><div className={s.liveN} data-impulses="">0</div></div>
              <div><div className={cx("mono", "dim")}>Harvested</div><div className={s.liveN}><span data-kwh="">0.00</span><small>kWh</small></div></div>
            </div>
            <button type="button" className={s.hold} data-hold="" aria-label="Hold to brake the truck">
              <svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="20" className={s.holdBg} /><circle cx="22" cy="22" r="20" className={s.holdRing} data-hold-ring="" /></svg>
              <span data-hold-label="">Hold to brake</span>
            </button>
          </aside>
          <div className={cx("cue", "mono")} data-intro=""><span>Scroll</span><i /></div>
        </section>

        {/* proof strip — the logos come right after the promise */}
        <section className={s.proof} aria-label="Partners">
          <div className={s.prow}>
            <div className={cx("mono", "dim")}>Deployed with</div>
            <div className={s.logos} data-marquee="">
              <div className={s.logoTrack}>{[0, 1].map((k) => CLIENTS.map(([n, f, h]) => <img key={n + k} src={A + f} alt={k ? "" : n} aria-hidden={k ? true : undefined} style={{ height: h }} />))}</div>
            </div>
          </div>
          <div className={s.prow}>
            <div className={cx("mono", "dim")}>Backed &amp; recognised by</div>
            <div className={cx("logos", "logosSm")} data-marquee="">
              <div className={s.logoTrack}>{[0, 1].map((k) => BACKERS.map(([n, f]) => <img key={n + k} src={A + f} alt={k ? "" : n} aria-hidden={k ? true : undefined} />))}</div>
            </div>
          </div>
        </section>

        {/* 01–06 — the scroll journey; the camera follows the energy */}
        <section className={s.journey} id="technology" data-journey="">
          <div className={s.railWrap} aria-hidden="true">
            <div className={s.jshade} data-jshade="l" /><div className={cx("jshade", "jshadeR")} data-jshade="r" />
            <div className={s.rail} data-rail=""><i data-rail-fill="" /><ol className={s.mono}>{["01", "02", "03", "04", "05", "∞"].map((n, i) => <li key={n} data-rail-i={i}>{n}</li>)}</ol></div>
          </div>
          {STEPS.map((st, i) => (
            <div key={st.k} className={cx("step", SIDES[i] === "r" ? "stepR" : "stepL")} data-step={i}>
              <div className={s.card} data-card="">
                <div className={cx("mono", "g", "cardK")}>{String(i + 1).padStart(2, "0")} — {st.k}</div>
                <h2 className={s.h2} data-split="">{st.t}</h2>
                <p className={s.body}>{st.b}</p>
                <dl className={cx("spec", "mono")}>{st.spec.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
              </div>
              {i === 0 && <div className={cx("tag", "glass", "mono")} data-tag=""><i className={s.dot} /><span data-tag-t="">Trigger 14 · 18.4 kN</span></div>}
              {i === 2 && <div className={cx("tag", "tag3", "glass", "mono")}><i className={s.dot} />Shaft · levitating · 0 contact</div>}
            </div>
          ))}
          <div className={s.fin}>
            <div className={s.finIn} data-step={5}>
              <div className={cx("mono", "g")}>One plate. Every road.</div>
              <h2 className={s.finH} data-split="">Every braking event<br />is a power source.</h2>
              <p className={s.body}>Toll plazas, exit ramps, port gates, warehouse lanes. Wherever traffic slows, the energy is already there — 1,000+ sites are waiting.</p>
            </div>
          </div>
        </section>

        <div className={s.sheet} data-sheet="">
          {/* Impact */}
          <section className={s.sec} id="impact">
            <Head k="(01) Impact · Port of Hamburg" body="Installed at Hamburg Container Service (HCS): a 125,000 m² terminal with around 1,000 truck movements a day, aiming for climate neutrality by 2040.">
              The world’s first<br />Road Power Plant<br /><span className={s.dim}>is already working.</span>
            </Head>
            <div className={s.photo} data-reveal="">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${A}plate-164.webp`} alt="An electric truck crossing the first REPS plate at Hamburg Container Service" data-parallax="" />
              <div className={cx("cap", "mono")}><span>HCS · November 2025</span><span>First REPS plate in live operation</span></div>
            </div>
            <div className={s.kpis}>
              <Kpi n={229} label="plates in the full HCS rollout" />
              <Kpi n={10} pre="~" unit="GWh/yr" label="projected clean electricity" />
              <Kpi n={10} pre="~" unit="%" label="less CO₂ from port traffic" />
              <Kpi n={4} pre="<" unit="yrs" label="projected payback" />
            </div>
            <div className={s.reel} data-reel="">
              {[["plate-173.webp", "Opening day at HCS"], ["plate-64.webp", "Alfons Huber, Founder & CEO"], ["plate-38.webp", "Partners & port authority"], ["hh.webp", "Port of Hamburg"], ["plate-139.jpg", "Trigger pairs, up close"]].map(([f, c]) => (
                <figure key={f}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={A + f} alt={c} loading="lazy" draggable={false} /><figcaption className={cx("mono", "dim")}>{c}</figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* At a glance */}
          <section className={s.sec}>
            <Head k="(02) At a glance">Not a little better.<br /><span className={s.dim}>Orders of magnitude.</span></Head>
            <div className={s.bars}>
              {[["REPS", "hydraulic + magnetic levitation", 100, "13,000×", true], ["Dynamo systems", "mechanical contact", 41.6, "51×", false], ["Piezo tiles", "baseline", 2, "1×", false]].map(([n, d, w, v, g]) => (
                <div key={n as string} className={s.bar}>
                  <div><b>{n}</b><span className={cx("mono", "dim")}>{d}</span></div>
                  <div className={s.bt}><i className={cx(g === true && "gr")} data-bar-w={w} /></div>
                  <div className={s.bv}>{v}</div>
                </div>
              ))}
              <p className={cx("mono", "dim")}>Relative energy recovered per event, log scale. Source: REPS (254× dynamo, 13,000× piezo).</p>
            </div>
            <div className={s.glance}>
              <Glance n={90} unit="%+" label="conversion efficiency" />
              <Glance n={0} unit="m²" label="extra land — it lives in the road" />
              <Glance n={20} unit="+ yrs" label="design life, annual inspection" />
              <Glance n={1000} unit="+" label="potential sites worldwide" />
            </div>
          </section>

          {/* Where it works */}
          <section className={s.sec} id="locations">
            <Head k="(03) Where it works" body="Three environments, one rule: high-frequency traffic that has to brake. Pick yours.">Wherever heavy traffic<br /><span className={s.dim}>slows down anyway.</span></Head>
            <Locations />
          </section>

          {/* Potential calculator */}
          <section className={s.sec} id="potential">
            <Calculator />
          </section>

          {/* What we believe */}
          <section className={s.bel} id="team" data-bel="">
            <div className={s.belPhoto}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${A}team.webp`} alt="The REPS team in the Austrian Alps" loading="lazy" data-parallax="" />
              <div className={s.belFade} />
            </div>
            <div className={s.belTop}>
              <div><div className={cx("mono", "g")}>(05) What we believe</div><h2 className={s.h2} data-split="">Four rules behind<br />the first road power plant.</h2></div>
              <div className={s.belMeta}>
                <div className={s.faces}>{FACES.map((f) => <img key={f} src={A + f} alt="" loading="lazy" />)}</div>
                <div className={cx("mono", "dim")}>9 people · Austria → Hamburg</div>
              </div>
            </div>
            <div className={s.rows}>
              {VALUES.map((v, i) => (
                <div key={v.w} className={s.br} data-belrow={i}>
                  <span className={s.brN}>0{i + 1}</span>
                  <div className={s.brW}>{v.w}{v.em && <b>{v.em}</b>}</div>
                  <p>{v.p}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Team */}
          <section className={cx("sec", "secTight")}>
            <div className={s.people}>
              {PEOPLE.map((p) => (
                <div key={p.n} className={s.per} data-rise="">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={A + p.img} alt={p.n} loading="lazy" /><b>{p.n}</b><span className={cx("mono", "dim")}>{p.r}</span>
                </div>
              ))}
              <div className={s.vals} data-rise="">
                <p className={cx("mono", "g")}>+6 more</p>
                <ol>{["Business Operations", "Electrical Engineering", "Commercial Development", "Field Engineering"].map((r) => <li key={r}><span>→</span>{r}</li>)}</ol>
                <a className={s.link} href="https://www.reps.energy/" target="_blank" rel="noreferrer">Meet the team · Career ↗</a>
              </div>
            </div>
          </section>

          {/* Press */}
          <section className={s.sec} id="press">
            <Head k="(06) In the press" body="Covered by AP, Yahoo Finance, Business Insider, Forbes, Tech.eu and more.">$23.6M to put<br />power plants <span className={s.dim}>in roads.</span></Head>
            <div className={s.press}>
              {ARTICLES.map((a) => (
                <a key={a.src} className={s.art} href="https://www.reps.energy/" target="_blank" rel="noreferrer" data-rise="">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <div className={s.artTi}><img src={A + a.img} alt="" loading="lazy" /><span className={cx("src", "mono")}>{a.src}</span></div>
                  <div className={s.artBd}>
                    <div className={cx("mono", "dim")}>Press release · {a.date}</div>
                    <h3 className={s.h3}>{a.title}</h3>
                    <p className={s.body}>{a.body}</p>
                    <div className={s.artRow}><span className={cx("mono", "g")}>Read article</span><span aria-hidden="true">↗</span></div>
                  </div>
                </a>
              ))}
            </div>
            <div className={s.wall}>{PRESS_WALL.map(([n, f]) => <div key={n}><img src={A + f} alt={n} loading="lazy" /></div>)}</div>
          </section>

          {/* FAQ */}
          <section className={s.sec}>
            <div className={s.faq}>
              <div>
                <div className={cx("mono", "g")}>(07) FAQ</div>
                <h2 className={s.h2} data-split="">Questions,<br /><span className={s.dim}>answered.</span></h2>
                <p className={s.body}>Still unsure if your roads qualify? The potential analysis is free.</p>
                <a className={cx("btn", "btnG")} href="#contact">Free potential analysis →</a>
              </div>
              <Faq />
            </div>
          </section>

          {/* CTA */}
          <section className={s.cta} id="contact">
            <div className={s.glow} data-glow="" />
            <div className={cx("mono", "g")}>(08) Free potential analysis</div>
            <h2 className={s.ctah} data-split="">REPS on<br />my roads.</h2>
            <p className={s.body}>Tell us where traffic slows on your site. We’ll map the plates, the energy and the payback — free.</p>
            <a className={cx("btn", "btnG", "btnXl")} href="mailto:office@reps.energy?subject=Free%20potential%20analysis" data-magnetic="">Start my free analysis <span aria-hidden="true">→</span></a>
          </section>

          <footer className={s.foot}>
            <div className={s.fmark} data-fmark=""><RepsLogo /></div>
            <div className={s.fcols}>
              <div><p className={cx("mono", "g")}>Turning roads into power plants.</p><p className={s.body}>REPS GmbH · Innsbruck, Austria</p></div>
              <div><p className={cx("mono", "dim")}>Company</p><a href="#team">About us</a><a href="#team">Career</a><a href="#press">News &amp; Events</a><a href="#contact">Contact</a></div>
              <div><p className={cx("mono", "dim")}>Follow</p><a href="https://www.linkedin.com/company/reps-energy" target="_blank" rel="noreferrer">LinkedIn</a><a href="https://www.instagram.com/" target="_blank" rel="noreferrer">Instagram</a></div>
              <div><p className={cx("mono", "dim")}>Legal</p><a href="https://www.reps.energy/" target="_blank" rel="noreferrer">Imprint</a><a href="https://www.reps.energy/" target="_blank" rel="noreferrer">Privacy Policy</a></div>
            </div>
            <div className={cx("fbase", "mono", "dim")}><span>© 2026 REPS GmbH</span><span>Concept for REPS by <Link href="/">David Adebayo ↗</Link></span></div>
          </footer>
        </div>
      </main>
    </div>
  );
}

function Head({ k, body, children }: { k: string; body?: string; children: React.ReactNode }) {
  return (
    <div className={s.head}>
      <div className={cx("mono", "headK")}>{k}</div>
      <h2 className={s.h2} data-split="">{children}</h2>
      {body ? <p className={s.body} data-rise="">{body}</p> : <div />}
    </div>
  );
}

function Kpi({ n, pre = "", unit, label }: { n: number; pre?: string; unit?: string; label: string }) {
  return <div className={s.kpi}><div className={s.kn}>{pre}<span data-count={n}>{n}</span>{unit && <small>{unit}</small>}</div><div className={cx("mono", "dim")}>{label}</div></div>;
}
function Glance({ n, unit, label }: { n: number; unit: string; label: string }) {
  return <div><div className={s.gn}><span data-count={n}>{fmt(n)}</span><small>{unit}</small></div><p>{label}</p></div>;
}

function Locations() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // the timer keeps what's left when paused, so it stays in step with the progress line
  const remaining = useRef(6000), lastI = useRef(0);
  useEffect(() => {
    if (lastI.current !== i) { lastI.current = i; remaining.current = 6000; }
    if (paused) return;
    const started = performance.now();
    const t = setTimeout(() => setI((v) => (v + 1) % LOCATIONS.length), remaining.current);
    return () => { clearTimeout(t); remaining.current = Math.max(0, remaining.current - (performance.now() - started)); };
  }, [i, paused]);
  const L = LOCATIONS[i];
  return (
    <div className={s.tabs}>
      <div className={s.tl}>
        <div role="tablist" aria-label="Locations" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        {LOCATIONS.map((l, k) => (
          <div key={l.name}>
            <button type="button" role="tab" aria-selected={k === i} className={cx("tb", k === i && "on")} onClick={() => setI(k)}>
              <span>{l.name}</span><span className={cx("mono", "ix")}>0{k + 1}</span>
            </button>
            {k === i && <div className={s.prog}><i key={i} data-paused={paused ? "" : undefined} /></div>}
          </div>
        ))}
        </div>
        <p className={s.body}>Tabs advance every 6 s. Hover a location to pause.</p>
        <a className={cx("btn", "btnO")} href="#contact">Is my site suitable? →</a>
      </div>
      <div className={s.tp}>
        {LOCATIONS.map((l, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={l.img} src={A + l.img} alt="" className={cx(k === i && "on")} loading="lazy" />
        ))}
        <div className={s.tpOv} />
        {L.pins.map(([t, x, y]) => <div key={t} className={cx("pin", "mono")} style={{ left: `${x}%`, top: `${y}%` }}><i className={s.dot} />{t}</div>)}
        <div className={s.tpIn} key={i}>
          <div className={cx("mono", "g")}>{L.short}</div>
          <h3 className={s.h3}>{L.head}</h3>
          <div className={s.cols}>
            <div><div className={cx("mono", "dim")}>Best locations</div><p>{L.best}</p></div>
            <div><div className={cx("mono", "dim")}>Traffic profile</div><p>{L.traffic}</p></div>
            <div><div className={cx("mono", "dim")}>Electricity usage</div><p>{L.use}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Calculator() {
  const [trucks, setTrucks] = useState(1000);
  const [plates, setPlates] = useState(24);
  const r = potential(trucks, plates);
  const pct = (v: number, min: number, max: number) => `${((v - min) / (max - min)) * 100}%`;
  return (
    <div className={s.calc}>
      <div>
        <div className={cx("mono", "g")}>(04) Potential</div>
        <h2 className={s.h2} data-split="">What would<br />your road<br /><span className={s.dim}>give back?</span></h2>
        <p className={s.body}>Move the sliders. We scale from the Hamburg projection — 229 plates, ~1,000 trucks a day, ~10 GWh a year — so you can see the order of magnitude before we run a real analysis.</p>
      </div>
      <div className={cx("panel", "glass")} data-rise="">
        <label className={s.sl}>
          <span className={s.slT}><span className={cx("mono", "dim")}>Heavy vehicles per day</span><output>{fmt(trucks)}</output></span>
          <input type="range" min={100} max={5000} step={50} value={trucks} onChange={(e) => setTrucks(+e.target.value)} style={{ ["--p" as string]: pct(trucks, 100, 5000) }} />
        </label>
        <label className={s.sl}>
          <span className={s.slT}><span className={cx("mono", "dim")}>REPS plates</span><output>{plates}</output></span>
          <input type="range" min={1} max={229} step={1} value={plates} onChange={(e) => setPlates(+e.target.value)} style={{ ["--p" as string]: pct(plates, 1, 229) }} />
        </label>
        <div className={s.out}>
          <div><div className={cx("mono", "dim")}>Clean electricity</div><div className={s.cn}>{fmt(r.mwh)}<small>MWh/yr</small></div></div>
          <div><div className={cx("mono", "dim")}>CO₂ avoided*</div><div className={s.cn}>{fmt(r.co2)}<small>t/yr</small></div></div>
          <div><div className={cx("mono", "dim")}>Truck charges (400 kWh)</div><div className={s.cn}>{fmt(r.charges)}<small>/yr</small></div></div>
          <div><div className={cx("mono", "dim")}>Households powered</div><div className={s.cn}>{fmt(r.homes)}</div></div>
        </div>
        <a className={cx("btn", "btnG", "wide")} href="#contact">Get the real numbers for my site <span aria-hidden="true">→</span></a>
        <p className={s.fine}>*Illustrative. Linear scale of the HCS projection; 380 g CO₂/kWh grid mix; 3,500 kWh per household.</p>
      </div>
    </div>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <div>
      {FAQ.map(([q, a], i) => (
        <div key={q} className={cx("q", open === i && "on")}>
          <button type="button" className={s.qT} aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{q}</span><span className={s.pm} aria-hidden="true">{open === i ? "−" : "+"}</span>
          </button>
          <div className={s.qA}><div><p>{a}</p></div></div>
        </div>
      ))}
    </div>
  );
}
