"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Geist, Geist_Mono } from "next/font/google";
import s from "./truerights.module.css";
import ConceptBadge from "../ConceptBadge";
import { Logo } from "./logo";
import { MobileMenu } from "./menu";
import { initTrueRightsMotion } from "./motion";

const geist = Geist({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-gmono" });
const A = "/concepts/truerights/";
const cx = (...n: (string | false | undefined)[]) => n.filter(Boolean).map((k) => s[k as string]).filter(Boolean).join(" ");

const STEPS = [
  { t: "Register", d: "Protect your likeness, content & IP in one verified registry.", ui: "ui-vault" },
  { t: "Value", d: "TrueRates turns reach, category and usage into a fair price.", ui: "ui-truerates" },
  { t: "Deal", d: "AI-assisted terms, shared with the brand in minutes.", ui: "ui-campaign" },
  { t: "Licence", d: "Scoped usage — which platform, what use, for how long.", ui: "ui-talentrights" },
  { t: "Monitor", d: "Every generation is checked against the deal in real time.", ui: "ui-roster" },
  { t: "Enforce", d: "Breaches are flagged and takedowns filed for you.", ui: "ui-vault" },
  { t: "Earn", d: "Performance-based payments, with revenue recovery built in.", ui: "ui-truerates" },
];
const RULES: [string, string, string, boolean][] = [
  ["Likeness", "editorial", "", true],
  ["Likeness", "commercial", "$0.12 / gen", true],
  ["Likeness", "political", "", false],
  ["Voice", "all uses", "", false],
  ["Style", "fine-tune", "£48k / yr", true],
  ["fringe_gen", "explicit block", "", false],
];
const LOGS: [string, string, string, string, boolean][] = [
  ["09:41:07", "acme_v4", "likeness/editorial", "ALLOW", true],
  ["09:41:03", "studio_gen", "likeness/commercial", "ALLOW · $0.12", true],
  ["09:40:58", "fringe_gen", "likeness/commercial", "DENY", false],
  ["09:40:51", "voxa", "voice/ad-read", "DENY", false],
  ["09:40:44", "acme_v4", "style/fine-tune", "ALLOW · £48K/YR", true],
  ["09:40:39", "pixl", "likeness/political", "DENY", false],
];
const EVENTS: [number, string, string, boolean][] = [
  [4, "Unlicensed AI endorsement", "Takedown filed", false],
  [23, "Second unlicensed endorsement", "Taken down", false],
  [46, "Third endorsement", "Converted to paid licence", true],
  [78, "Historic unpaid image use", "Invoiced", true],
];
const CREATORS = ["beth", "kacey", "millie", "monae"];
const CHAOS = [
  ["RE: RE: RE: usage rights??", "Inbox · 14 unread"],
  ["Is this you in this ad?", "DM · unknown sender"],
  ["likeness_deals_FINAL_v7.xlsx", "Spreadsheet · 3 versions"],
  ["Invoice overdue — 92 days", "Brand campaign"],
  ["Your face is in a model?", "Forum thread"],
  ["Campaign still running after term", "Spotted by a fan"],
];
const CONTROL = [
  "Instant deepfake alerts — takedown in one tap",
  "Every licensing request in one place",
  "AI model use detected and flagged",
  "Campaign breaches flagged automatically",
  "Live earnings tracking",
  "One signed, verifiable rights record",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <span className={s.eyebrow} data-rise=""><i />{children}</span>;
}
function Check() {
  return <svg viewBox="0 0 30 30" className={s.check} aria-hidden="true"><circle cx="15" cy="15" r="14" /><path d="M9.5 15.5l3.8 3.8 7.5-8" /></svg>;
}

export default function TrueRights() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled && root.current) cleanup = initTrueRightsMotion(root.current); });
    return () => { cancelled = true; cleanup?.(); };
  }, { scope: root });

  return (
    <div ref={root} className={`${s.root} ${geist.variable} ${mono.variable}`}>
      <div className={s.intro} data-intro="" aria-hidden="true"><Logo mark className={s.intro__mark} /></div>
      <div className={s.cursor} data-cursor="" aria-hidden="true" />

      <header className={s.nav} data-nav="">
        <a href="#top" aria-label="TrueRights home"><Logo className={s.nav__logo} /></a>
        <nav className={s.nav__links} aria-label="Main">
          <a href="#steps">Platform</a><a href="#consent">Talent</a><a href="#detect">Brands</a><a href="#why">AI Platforms</a><a href="#cta">Company</a>
        </nav>
        <a href="https://truerights.com" className={s.nav__in}>Sign in</a>
        <a href="https://truerights.com" className={cx("btn", "btn--neon", "btn--sm")} data-magnetic="">Get started</a>
        <MobileMenu host={root} bp={1100} links={[["Platform", "#steps"], ["Talent", "#consent"], ["Brands", "#detect"], ["AI Platforms", "#why"], ["Company", "#cta"]]}
          cls={{ btn: s.menuBtn, panel: s.menu, links: s.menu__links, foot: s.menu__foot }}
          cta={<><a href="https://truerights.com" className={cx("btn", "btn--neon")}>Register your likeness</a><a href="https://truerights.com" className={cx("btn", "btn--glass")}>Sign in</a></>} />
      </header>

      <main id="top">
        {/* B01 · HERO — the likeness dissolves into particles as you scroll */}
        <section className={s.hero} data-hero="">
          <div className={s.hero__media}>
            <img src={`${A}gen-hero.jpg`} alt="" className={s.hero__img} data-hero-img="" />
            <canvas className={s.hero__canvas} data-particles="" aria-hidden="true" />
            <div className={s.hero__shade} />
          </div>
          <div className={s.hero__brackets} data-brackets="" aria-hidden="true"><i /><i /><i /><i /></div>
          <span className={cx("glass", "chipv")} data-float="" data-depth="0.5"><i />Verified likeness · TR-832-0419</span>
          <div className={cx("glass", "w1")} data-float="" data-depth="1.1">
            <b><i className={s.dotRed} />Unlicensed copy blocked</b>
            <span className={s.mono}>fringe_gen · likeness/commercial</span>
            <em className={cx("tag", "tag--deny")}>DENY</em>
          </div>
          <div className={cx("glass", "w2")} data-float="" data-depth="0.8">
            <span className={s.mono}>Consent · Likeness / commercial</span>
            <div className={s.w2__row}><strong>$0.12 / gen</strong><span className={s.toggle} data-on="" /></div>
            <span className={s.mono}>14,820 queries this week · £1,780 accrued</span>
          </div>
          <div className={s.hero__copy}>
            <Eyebrow>The rights ownership company</Eyebrow>
            <h1 className={s.h1} data-h1=""><span>Own your</span><span className={s.grad} data-grad="">likeness.</span></h1>
            <p className={s.lead} data-rise="">Register your face, voice and style once. Decide who can use them, on what terms — and get paid every time AI does.</p>
            <div className={s.btns} data-rise="">
              <a href="https://truerights.com" className={cx("btn", "btn--neon")} data-magnetic="">Register your likeness</a>
              <a href="#manifesto" className={cx("btn", "btn--glass")}>See how it works</a>
            </div>
          </div>
          <div className={s.scroll} aria-hidden="true"><span>Scroll to protect</span><i><b /></i></div>
        </section>

        {/* B02 · MANIFESTO */}
        <section className={s.manifesto} id="manifesto">
          <div className={s.glow} style={{ left: "60%", top: "55%" }} />
          <Eyebrow>Why we exist</Eyebrow>
          <p className={s.manifesto__text} data-manifesto="">
            <span>Your face</span> <img src={`${A}likeness.jpg`} alt="" data-pill="" />{" "}
            <span>your voice</span> <span className={s.wave} data-pill="">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 6) * -0.12}s` }} />)}</span>{" "}
            <span>your style</span> <img src={`${A}gen-dotface.jpg`} alt="" data-pill="" />{" "}
            <span>— copied by AI in seconds.</span> <span className={s.neon}>TrueRights</span> <span>makes them</span>{" "}
            <img src={`${A}gen-seal.jpg`} alt="" data-pill="" /> <span>yours again.</span>
          </p>
          <div className={cx("glass", "stat8")} data-rise="">
            <strong data-count="8" data-suffix="M">8M</strong>
            <span>deepfakes projected to be shared in 2025 — up from 500,000 in 2023.</span>
          </div>
        </section>

        {/* B03 · SEVEN STEPS, ONE SEAL (pinned) */}
        <section className={s.seal} id="steps" data-seal="">
          <div className={s.seal__pin} data-seal-pin="">
            <div className={s.seal__head}>
              <div><Eyebrow>How it works</Eyebrow><h2 className={s.h2} data-lines=""><span>Seven steps.</span><span>One seal.</span></h2></div>
              <p className={s.sub} data-rise="">From dealmaking to enforcement. Historically fragmented across lawyers, spreadsheets and goodwill — now one API-addressable platform.</p>
            </div>
            <div className={s.seal__stage} data-tilt="">
              <div className={s.seal__glow} />
              <div className={s.seal__disc} data-seal-disc=""><img src={`${A}gen-seal.jpg`} alt="" /></div>
              <Logo mark className={s.seal__mark} />
              <div className={s.orbit} data-orbit="" aria-hidden="true" />
              {STEPS.map((st, i) => (
                <span key={st.t} className={s.orbitStep} data-ostep={i}><b>{String(i + 1).padStart(2, "0")}</b>{st.t}</span>
              ))}
            </div>
            <div className={cx("glass", "seal__detail")} data-sdetail="">
              <span className={s.mono} data-snum="">01 / 07</span>
              <strong data-stitle="">{STEPS[0].t}</strong>
              <p data-sdesc="">{STEPS[0].d}</p>
              <div className={s.seal__bars}>{STEPS.map((_, i) => <i key={i} data-sbar={i} />)}</div>
            </div>
            <div className={s.seal__ui}>
              {STEPS.map((st, i) => <img key={i} src={`${A}${st.ui}.jpg`} alt="" data-sui={i} />)}
            </div>
          </div>
        </section>

        {/* B04 · ONE RECORD, EVERYWHERE */}
        <section className={s.land} data-land="">
          <img src={`${A}gen-landscape.jpg`} alt="" className={s.land__img} data-land-img="" />
          <div className={s.land__shade} />
          <div className={s.land__head}>
            <Eyebrow>TalentRights</Eyebrow>
            <h2 className={cx("h2", "center")} data-lines=""><span>One verified record.</span><span>Everywhere you go.</span></h2>
            <p className={s.sub} data-rise="">Your likeness, voice and style — registered once, recognised by every platform that queries TrueRights.</p>
          </div>
          <div className={s.passWrap} data-tilt="">
            <div className={cx("glass", "pass")} data-pass="">
              <i className={s.pass__sheen} data-sheen="" />
              <div className={s.pass__top}><Logo className={s.pass__logo} /><span className={s.mono}>Rights passport</span></div>
              <div className={s.pass__body}>
                <img src={`${A}likeness.jpg`} alt="" />
                <dl>
                  <dt>Holder</dt><dd>Elena Marsh</dd>
                  <dt>Registry ID</dt><dd className={s.monoV}>TR-832-0419</dd>
                  <dt>Status</dt><dd className={s.neon}>● Verified</dd>
                </dl>
              </div>
              <div className={s.pass__chips}>
                {["Face · Registered", "Voice · Registered", "Style · Licensed", "Body · Registered"].map((c) => <span key={c} className={c.includes("Licensed") ? s.on : undefined}><i />{c}</span>)}
              </div>
            </div>
          </div>
          {[["Licensed", "Campaign 2026 · UK · 12 mo", "13%", "86%"], ["Monitored", "6 platforms · live", "90%", "62%"], ["Watermarked", "acme_v4 · every output", "80%", "84%"]].map(([a, b, x, y]) => (
            <div key={a} className={s.marker} style={{ left: x, top: y }} data-marker="">
              <div className={s.glassy}><b>{a}</b><span>{b}</span></div><i /><u />
            </div>
          ))}
        </section>

        {/* B05 · WHY NOW */}
        <section className={s.why} id="why">
          <div className={s.glow} style={{ left: "10%", top: "60%" }} /><div className={cx("glow", "glow--lime")} style={{ left: "85%", top: "85%" }} />
          <div className={s.split}>
            <div><Eyebrow>Why now</Eyebrow><h2 className={s.h2} data-lines=""><span>The deepfake economy</span><span>grew up overnight.</span></h2></div>
            <p className={s.sub} data-rise="">AI can generate your face, voice and style in seconds. The market is booming — the rules haven’t caught up.</p>
          </div>
          <div className={s.bento} data-bento="">
            <div className={cx("glass", "b1")}>
              <strong className={s.big} data-count="2137" data-suffix="%">2,137%</strong>
              <p>increase in deepfake fraud cases</p><span className={s.mono}>Sumsub Identity Fraud Report 2025</span>
              <div className={s.bars}>{[14, 18, 16, 24, 30, 42, 60, 96, 150].map((v, i) => <i key={i} style={{ height: v }} data-bar="" />)}</div>
            </div>
            <div className={s.b2}>
              <img src={`${A}face-strip.jpg`} alt="" />
              <span className={cx("glassy", "b2__q")}>Which one is real?</span>
              {[["Original", 2], ["Clone 01", 36], ["Clone 02", 69]].map(([l, x], i) => (
                <div key={l as string} className={cx("reticle", i ? "reticle--bad" : "")} style={{ left: `${x}%` }} data-reticle=""><em>{l}</em></div>
              ))}
            </div>
            <div className={cx("glass", "b3")}><strong className={s.big} data-count="1.1" data-prefix="$" data-suffix="B" data-dec="1">$1.1B</strong><p>estimated deepfake-driven losses in financial services</p><span className={s.mono}>Deloitte Financial Services Institute</span></div>
            <div className={cx("glass", "b4")}><strong className={s.big} data-count="26.7" data-prefix="$" data-suffix="B" data-dec="1">$26.7B</strong><p>GenAI image & likeness market by 2030</p><span className={s.mono}>Grand View Research</span>
              <svg viewBox="0 0 180 110" className={s.curve}><path d="M2 106 C50 98 90 80 118 50 S166 10 178 4" data-draw="" /><circle cx="178" cy="4" r="4" /></svg></div>
            <div className={cx("glass", "b5")}>
              <b>Rights infrastructure today</b>
              <div className={s.cmp}><span>Music</span><span className={s.monoV}>$32.3B</span></div><i className={s.cmp__full} data-fill="" />
              <div className={s.cmp}><span>Likeness</span><span className={cx("monoV", "red")}>None*</span></div><i className={s.cmp__none} />
              <p>*No standard framework exists. Which is why we’re building it.</p>
            </div>
          </div>
        </section>

        {/* B06 · CONSENT IN YOUR HAND */}
        <section className={s.consent} id="consent" data-consent="">
          <div className={s.glow} style={{ left: "70%", top: "50%" }} />
          <Eyebrow>TalentRights · Consent</Eyebrow>
          <h2 className={s.h2} data-lines=""><span>You decide who</span><span className={s.neon}>gets to be you.</span></h2>
          <div className={s.consent__grid}>
            <div className={s.hand}>
              <div className={s.hand__zoom}>
              <img src={`${A}gen-hands.jpg`} alt="" className={s.hand__img} />
              <div className={s.screen} data-screen="">
                <div className={s.screen__top}><img src={`${A}likeness.jpg`} alt="" /><div><b>Elena Marsh</b><span>● Verified</span></div></div>
                <small>Pending</small><strong data-earn="">£1,780.40</strong>
                {RULES.map(([a, b, , on], i) => (
                  <div key={i} className={s.screen__row}><div><b>{a}</b><span>{b}</span></div><i className={s.mtog} data-mtog={on ? "1" : "0"} data-on={on ? "" : undefined} /></div>
                ))}
              </div>
              </div>
              <div className={cx("glass", "req")} data-req=""><i className={s.dotNeon} /><b>studio_gen asked to use</b><span className={s.mono}>likeness / commercial</span><em className={cx("tag", "tag--allow")}>ALLOWED · $0.12</em></div>
            </div>
            <div>
              <p className={s.sub} data-rise="">Set your rules once. Every AI platform that queries TrueRights gets an instant answer — allow, deny, or allow at your price.</p>
              <div className={cx("glass", "log")}>
                <div className={s.log__head}><b>Live query log</b><em className={cx("tag", "tag--allow")}>● Streaming</em></div>
                <div className={s.log__rows} data-log="">
                  {LOGS.map(([t, p, sc, r, ok]) => (
                    <div key={t} className={s.log__row}><span className={s.mono}>{t}</span><div><b>{p}</b><span>{sc}</span></div><em className={cx("tag", ok ? "tag--allow" : "tag--deny")}>{r}</em></div>
                  ))}
                </div>
                <div className={s.log__stats}>
                  <div><strong data-count="14820">14,820</strong><span>queries · 6 platforms</span></div>
                  <div><strong data-count="1780" data-prefix="£">£1,780</strong><span>accrued this week</span></div>
                  <div><strong data-count="2104">2,104</strong><span>blocked</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* B07 · DETECTION — real vs halftone copy (pinned sweep) */}
        <section className={s.detect} id="detect" data-detect="">
          <div className={s.split}>
            <div><Eyebrow>Detection · Enforcement</Eyebrow><h2 className={s.h2} data-lines=""><span>Spot every copy</span><span className={s.dim}>before it spreads.</span></h2></div>
            <p className={s.sub} data-rise="">TrueRights scans AI platforms, social feeds and ad networks for your face, voice and style — and acts the moment a use breaks your terms.</p>
          </div>
          <div className={s.compare} data-compare="">
            <img src={`${A}likeness.jpg`} alt="Original likeness" className={s.compare__img} />
            <div className={s.compare__copy} data-copy=""><canvas data-halftone="" aria-hidden="true" /></div>
            <div className={s.compare__line} data-divider=""><button className={s.compare__handle} aria-label="Drag to compare" data-handle="">‹ ›</button></div>
            <span className={cx("glassy", "cmpL")}><i className={s.dotNeon} />Original · verified likeness</span>
            <span className={s.cmpR}><i />Synthetic copy · <b data-count="97.8" data-dec="1" data-suffix="%">97.8%</b> match</span>
            <div className={cx("glass", "readout")} data-readout="">
              <pre className={s.mono2}>{"Source  TikTok · sponsored post\nType    synthetic endorsement\nTerms   not licensed"}</pre>
              <div className={s.btns}><a className={cx("btn", "btn--neon", "btn--sm")} href="https://truerights.com">File takedown →</a><a className={cx("btn", "btn--glass", "btn--sm")} href="https://truerights.com">Offer licence</a></div>
            </div>
          </div>
          <div className={s.feats}>
            {[["Likeness & voice matching", "Synthetic and re-used copies of you"], ["AI copyright & watermarking", "Proof of origin on every licensed output"], ["One-click takedowns", "Notices filed and tracked for you"]].map(([a, b], i) => (
              <div key={a} className={cx("glass", "feat")} data-rise=""><em>{String(i + 1).padStart(2, "0")}</em><b>{a}</b><span>{b}</span></div>
            ))}
          </div>
        </section>

        {/* B08 · CASE STUDY */}
        <section className={s.case} data-case="">
          <div className={s.glow} style={{ left: "45%", top: "25%" }} />
          <Eyebrow>Case study · anonymised composite</Eyebrow>
          <div className={s.case__top}>
            <div><strong className={s.huge} data-count="340" data-prefix="$" data-suffix="K">$340K</strong><p className={s.case__sub}>recovered + new licensing in Q1</p></div>
            <h3 className={s.h3} data-lines=""><span>Three deepfake takedowns.</span><span className={s.dim}>One missing royalty stream.</span></h3>
          </div>
          <div className={s.timeline} data-timeline="">
            <div className={s.timeline__axis}><i data-beam="" /><span>Day 0</span><span>Day 90</span>
              {EVENTS.map(([d, , , ok]) => <b key={d} className={ok ? s.ok : undefined} style={{ left: `${(d / 90) * 100}%` }} data-tdot="" />)}
            </div>
            <div className={s.timeline__cards}>
              {EVENTS.map(([d, t, tag, ok]) => (
                <div key={d} className={cx("glass", "event")} data-event=""><span className={s.mono}>Day {d}</span><b>{t}</b><em className={cx("tag", ok ? "tag--allow" : "tag--deny")}>{tag}</em></div>
              ))}
            </div>
          </div>
        </section>

        {/* B09 · CREATORS (coverflow) */}
        <section className={s.creators} data-creators="">
          <div className={s.glow} style={{ left: "50%", top: "60%" }} />
          <div className={s.center}><Eyebrow>Real creators. Real impact.</Eyebrow><h2 className={cx("h2", "center")} data-lines=""><span>Creators who chose</span><span>to own their likeness.</span></h2></div>
          <div className={s.flow} data-flow="">
            {CREATORS.map((c, i) => (
              <a key={c} href="https://truerights.com" className={s.flow__card} data-card={i}>
                <img src={`${A}creator-${c}.jpg`} alt={`${c} × TrueRights`} draggable={false} />
                <span className={s.flow__play} aria-hidden="true" />
                <b>{c[0].toUpperCase() + c.slice(1)} × TrueRights</b><span className={s.mono}>Watch story</span>
              </a>
            ))}
          </div>
          <div className={s.flow__nav}><button data-prev="" aria-label="Previous">←</button><span className={s.mono} data-findex="">01 / 04</span><button data-next="" aria-label="Next">→</button></div>
        </section>

        {/* B10 · CHAOS → CONTROL */}
        <section className={s.cc} data-cc="">
          <div className={s.cc__pin} data-cc-pin="">
            <h2 className={cx("h2", "center")}><span>From chaos <em className={s.neon}>to control.</em></span></h2>
            <div className={s.cc__grid}>
              <div className={s.chaos}>
                {CHAOS.map(([a, b], i) => <div key={a} className={cx("glassy", "note")} data-note={i}><b><i className={s.dotRed} />{a}</b><span className={s.mono}>{b}</span></div>)}
                <span className={cx("mono", "cc__label")}>Without TrueRights</span>
              </div>
              <div className={cx("glass", "control")}>
                {CONTROL.map((c) => <div key={c} className={s.control__row} data-crow=""><Check /><span>{c}</span></div>)}
                <span className={cx("mono", "cc__label", "neon")}>With TrueRights</span>
              </div>
              <div className={cx("glass", "switch")} aria-hidden="true"><i data-knob="" /></div>
            </div>
          </div>
        </section>

        {/* B11 · CTA */}
        <section className={s.cta} id="cta" data-cta="">
          <div className={s.cta__seal} data-cta-seal=""><img src={`${A}gen-seal.jpg`} alt="" /></div>
          <h2 className={s.cta__h}><span data-from="-1">Your likeness.</span><span data-from="1" className={s.grad}>Your terms.</span></h2>
          <p className={s.sub} data-rise="">Register once. Decide every use. Get paid every time.</p>
          <div className={s.btns} data-rise="">
            <a href="https://truerights.com" className={cx("btn", "btn--neon")} data-magnetic="">Register your likeness</a>
            <a href="https://truerights.com" className={cx("btn", "btn--glass")} data-magnetic="">Talk to our team</a>
          </div>
          <div className={s.avatars} data-rise="">{CREATORS.map((c) => <img key={c} src={`${A}creator-${c}.jpg`} alt="" />)}<span>Join creators, agencies, brands and AI platforms on TrueRights</span></div>
        </section>
      </main>

      {/* B12 · FOOTER */}
      <footer className={s.footer}>
        <div className={s.footer__top}>
          <div><Logo className={s.footer__logo} /><p>The rights ownership company.</p>
            <form className={cx("glassy", "news")} onSubmit={(e) => e.preventDefault()}><input placeholder="you@studio.com" aria-label="Email" /><button className={cx("btn", "btn--neon", "btn--sm")}>Get updates</button></form>
          </div>
          {[["Platform", ["TalentRights", "TrueRates", "Detection", "AI Copyright", "Watermarking", "Creative Studio"]], ["For", ["Talent", "Agencies", "Brands", "AI Platforms", "Partners"]], ["Company", ["About", "Team", "Press", "Careers", "Contact"]]].map(([h, ls]) => (
            <div key={h as string} className={s.footer__col}><span className={s.mono}>{h}</span>{(ls as string[]).map((l) => <a key={l} href="https://truerights.com">{l}</a>)}</div>
          ))}
        </div>
        <div className={s.wordmark} data-wordmark="" aria-hidden="true">TrueRights</div>
        <div className={s.footer__bot}><span>© 2026 TrueRights</span><span>Privacy · Terms · Cookies</span></div>
      </footer>

      <ConceptBadge company="TrueRights" className={s.badge} />
    </div>
  );
}
