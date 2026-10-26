"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Geist, Geist_Mono } from "next/font/google";
import s from "./light.module.css";
import ConceptBadge from "../ConceptBadge";
import { Logo } from "./logo";
import { MobileMenu } from "./menu";
import { initTrueRightsLightMotion } from "./motion";

const geist = Geist({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-geist" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-gmono" });
const A = "/concepts/truerights/";
const cx = (...n: (string | false | undefined)[]) => n.filter(Boolean).map((k) => s[k as string]).filter(Boolean).join(" ");

const RULES: [string, string, string, boolean][] = [
  ["Likeness", "/editorial", "—", true], ["Likeness", "/commercial", "$0.12 / gen", true], ["Likeness", "/political", "—", false], ["Voice", "/all uses", "—", false], ["Style", "/fine-tune", "£48k / year", true],
];
const SWITCH: [string, string, string, boolean][] = [
  ["Likeness", "/editorial", "—", true], ["Likeness", "/commercial", "$0.12 / gen", true], ["Likeness", "/political", "—", false], ["Voice", "/all uses", "—", false],
  ["Style", "/fine tune", "£48k / year", true], ["Platform", "/acme_v4 · via default", "—", true], ["Platform", "/fringe_gen · explicit block", "—", false],
];
const LOGS: [string, string, string, string, boolean][] = [
  ["09:41:07", "acme_v4", "likeness/editorial", "ALLOW", true], ["09:41:03", "studio_gen", "likeness/commercial", "ALLOW · $0.12", true], ["09:40:58", "fringe_gen", "likeness/commercial", "DENY", false],
  ["09:40:51", "voxa", "voice/ad-read", "DENY", false], ["09:40:44", "acme_v4", "style/fine-tune", "ALLOW · £48K/YR", true], ["09:40:39", "pixl", "likeness/political", "DENY", false], ["09:40:31", "studio_gen", "likeness/commercial", "ALLOW · $0.12", true],
];
const STEPS: [string, string, string][] = [
  ["Register", "Protect your likeness, content & IP in one verified registry.", "ui-vault"], ["Value", "TrueRates creates fair pricing for every use.", "ui-truerates"],
  ["Deal", "AI-assisted terms. Shared in minutes.", "ui-campaign"], ["Licence", "Scoped usage — what, where, how long.", "ui-talentrights"],
  ["Monitor", "Detect deal terms in real time.", "ui-roster"], ["Enforce", "Protect assets & submit takedowns.", "ui-vault"], ["Earn", "Performance-based payments with revenue recovery.", "ui-truerates"],
];
const LOCKS: [string, string, string][] = [["door", "Front door", "Keys · alarm"], ["car", "Car", "Key fob · tracker"], ["phone", "Phone", "Face ID · passcode"], ["bank", "Bank", "2FA · PIN"], ["likeness", "Your likeness", "Nothing"]];
const FEED: [string, string, string, string, string, string][] = [
  ["VOICE", "Instagram", "AI voice ad", "Taken down", "ok", "2h ago"], ["FACE", "YouTube", "Face swap", "Licensed  +£420", "ok", "5h ago"], ["ENDRS", "X", "Synthetic endorsement", "Under review", "wait", "8h ago"],
  ["STYLE", "TikTok", "Style clone", "Taken down", "ok", "1d ago"], ["VIDEO", "Web", "Deepfake video", "Notice sent", "wait", "1d ago"],
];
const PAIRS: [string, string][] = [
  ["A deepfake goes viral before you even know", "Instant alerts — and a takedown in one tap"], ["Licensing requests buried in your inbox", "Every request in one place"],
  ["Your likeness quietly trained into an AI model", "Detected and flagged"], ["A campaign keeps running beyond its terms", "Breaches flagged automatically"],
  ["Earnings tracked in spreadsheets", "Live earnings tracking"], ["Nobody is sure who owns what", "One signed, verifiable rights record"],
];

function Eyebrow({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return <span className={cx("eyebrow", dark && "eyebrow--dark")} data-rise=""><i />{children}</span>;
}
const Tog = ({ on, dark }: { on: boolean; dark?: boolean }) => <i className={cx("tog", dark && "tog--dark")} data-tog={on ? "1" : "0"} data-on={on ? "" : undefined} />;

export default function TrueRightsLight() {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled && root.current) cleanup = initTrueRightsLightMotion(root.current); });
    return () => { cancelled = true; cleanup?.(); };
  }, { scope: root });

  return (
    <div ref={root} className={`${s.root} ${geist.variable} ${mono.variable}`}>
      <div className={s.progress} data-progress="" aria-hidden="true" />
      <header className={s.nav} data-nav="">
        <a href="#top" aria-label="TrueRights home"><Logo className={s.nav__logo} /></a>
        <nav className={s.nav__pill} aria-label="Main">
          <a href="#steps" data-on="">Platform</a><a href="#switch">Talent</a><a href="#detect">Brands</a><a href="#api">AI Platforms</a><a href="#cta">Company</a>
        </nav>
        <a href="https://truerights.com" className={s.nav__in}>Sign in</a>
        <a href="https://truerights.com" className={cx("btn", "btn--forest", "btn--sm")} data-magnetic="">Get started</a>
        <MobileMenu host={root} bp={1240} links={[["Platform", "#steps"], ["Talent", "#switch"], ["Brands", "#detect"], ["AI Platforms", "#api"], ["Company", "#cta"]]}
          cls={{ btn: s.menuBtn, panel: s.menu, links: s.menu__links, foot: s.menu__foot }}
          cta={<><a href="https://truerights.com" className={cx("btn", "btn--forest")}>Register your likeness</a><a href="https://truerights.com" className={cx("btn", "btn--line")}>Sign in</a></>} />
      </header>

      <main id="top">
        {/* A01 HERO */}
        <section className={s.hero} data-hero="">
          <div className={s.hero__glow} />
          <a href="#steps" className={s.pill} data-rise=""><i />New — TrueRates: fair pricing for your likeness <span>→</span></a>
          <h1 className={s.h1} data-h1="">
            <span>Own the rights</span>
            <span className={s.h1__row}><img src={`${A}likeness.jpg`} alt="" className={s.h1__pill} data-facepill="" /><span>to you.</span></span>
          </h1>
          <p className={s.lead} data-rise="">Register your face, voice and style once. License them on your terms, catch every misuse, and get paid every time AI uses you.</p>
          <div className={s.btns} data-rise="">
            <a href="https://truerights.com" className={cx("btn", "btn--forest")} data-magnetic="">Register your likeness</a>
            <a href="https://truerights.com" className={cx("btn", "btn--line")}>Book a demo</a>
          </div>
          <div className={s.stage} data-stage="">
            <div className={s.stage__grid} />
            <div className={s.app} data-app="">
              <aside className={s.app__side}>
                <Logo className={s.app__logo} />
                {["Overview", "Rights", "Deals", "Detection", "Earnings", "Vault"].map((l, i) => <span key={l} className={i === 1 ? s.on : undefined}><i />{l}{i === 3 && <em>3</em>}</span>)}
                <div className={s.app__me}><img src={`${A}likeness.jpg`} alt="" /><div><b>Elena Marsh</b><small>Talent</small></div></div>
              </aside>
              <div className={s.app__main}>
                <div className={s.app__head}><img src={`${A}likeness.jpg`} alt="" /><div><b>Elena Marsh</b><span className={s.mono}>TR-832-0419 · Likeness · Voice · Style</span></div><em className={s.verified}><i />Verified</em></div>
                <div className={s.app__title}><b>Consent rules</b><span className={s.live}>Live</span></div>
                <div className={s.app__cols}><span>USE</span><span>RATE</span><span>STATUS</span></div>
                {RULES.map(([a, b, r, on]) => (
                  <div key={a + b} className={s.app__row} data-arow=""><span><b>{a}</b> <span className={s.mono}>{b}</span></span><span className={s.mono}>{r}</span><span className={s.app__st}><Tog on={on} /><em className={on ? s.ok : s.no}>{on ? "Allow" : "Deny"}</em></span></div>
                ))}
                <div className={s.earn}><div><small>Pending this month</small><strong data-earn="">£1,780.40</strong><span className={s.mono}>14,820 queries · last query 03m ago</span></div>
                  <div className={s.earn__bars}>{[30, 44, 38, 52, 48, 64, 58, 72, 66, 80, 74, 90, 84, 100].map((h, i) => <i key={i} style={{ height: h }} data-ebar="" />)}</div></div>
              </div>
            </div>
            <div className={cx("float", "fl1")} data-float="" data-depth="1.2">
              <div className={s.fl1__img}><img src={`${A}face-strip.jpg`} alt="" /><i className={s.ret} /></div>
              <b>Synthetic match detected</b><span className={s.mono}>TikTok · 03m ago · unlicensed ad</span>
              <em className={s.takedown}>Takedown filed ✓</em><small>Auto-enforced by TrueRights</small>
            </div>
            <div className={cx("float", "fl2")} data-float="" data-depth="0.8">
              <small>Generations this week</small><strong data-count="14820">14,820</strong><small>across 6 AI platforms</small>
              <svg viewBox="0 0 224 44"><path d="M0 40 L20 34 L40 36 L60 28 L80 30 L100 22 L120 24 L140 16 L160 18 L180 10 L200 12 L220 4" data-draw="" /></svg>
            </div>
            <div className={cx("float", "fl3")} data-float="" data-depth="1">
              <svg viewBox="0 0 28 32" className={s.shield}><path d="M14 1 L26 6 V15 C26 23 20.5 28.5 14 31 C7.5 28.5 2 23 2 15 V6 Z" /><path d="M9 16 l4 4 7-8" /></svg>
              <strong data-count="2104">2,104</strong><small>unlicensed uses blocked</small><span className={s.mono}>this week</span>
            </div>
          </div>
          <div className={s.trust}>
            <p>Trusted by creators, agencies, brands and AI platforms</p>
            <div className={s.trust__logos}>{["flightstory", "tiktok", "sixteenth", "intertalent"].map((l) => <img key={l} src={`${A}logo-${l}.svg`} alt={l} />)}</div>
          </div>
        </section>

        {/* A02 LOCKED */}
        <section className={s.locked} data-locked="">
          <div className={s.center}><Eyebrow>The problem</Eyebrow>
            <h2 className={cx("h2", "tc")} data-lines=""><span>You lock everything that matters.</span><span className={s.muted}>Except the one thing AI can copy.</span></h2></div>
          <div className={s.locks}>
            {LOCKS.map(([img, l, sub], i) => (
              <div key={l} className={cx("lock", i === 4 && "lock--open")} data-lock={i}>
                <img src={`${A}${img}.jpg`} alt="" />
                <b>{l}</b><span className={s.mono}>{sub}</span>
                <em className={s.lock__chip}><svg viewBox="0 0 20 22"><path d={i === 4 ? "M5 10V6.5a5 5 0 0 1 9.7-1.7" : "M5 10V7a5 5 0 0 1 10 0v3"} data-shackle="" /><rect x="2" y="10" width="16" height="11" rx="2.5" /></svg>{i === 4 ? "Unlocked" : "Locked"}</em>
              </div>
            ))}
          </div>
          <div className={s.locked__foot}>
            <p className={s.h4} data-rise="">Your likeness is the only asset anyone can copy, use and profit from <span className={s.muted}>— without asking you first.</span></p>
            <a href="https://truerights.com" className={cx("btn", "btn--forest")} data-magnetic="">Lock your likeness →</a>
          </div>
        </section>

        {/* A03 WHY NOW */}
        <section className={s.sec}>
          <div className={s.split}><div><Eyebrow>Why now</Eyebrow><h2 className={s.h2} data-lines=""><span>The deepfake economy</span><span className={s.muted}>grew up overnight.</span></h2></div>
            <p className={s.sub} data-rise="">AI can now generate your face, voice and style in seconds. The market is booming — the rules haven&apos;t caught up.</p></div>
          <div className={s.bento} data-bento="">
            <div className={cx("card", "c1")}><strong className={s.stat} data-count="2137" data-suffix="%">2,137%</strong><p>increase in deepfake fraud cases</p><span className={s.src}>Sumsub Identity Fraud Report 2025</span>
              <div className={s.bars}>{[14, 18, 16, 24, 30, 42, 60, 96, 150].map((v, i) => <i key={i} style={{ height: v }} data-bar="" />)}</div></div>
            <div className={cx("card", "c2")}><img src={`${A}face-strip.jpg`} alt="" /><span className={s.c2__q}>Which one is real?</span>
              {[["Original", 4], ["Clone 01", 40], ["Clone 02", 75]].map(([l, x], i) => <div key={l as string} className={cx("ret2", i > 0 && "ret2--bad")} style={{ left: `${x}%` }} data-ret=""><em>{l}</em></div>)}</div>
            <div className={cx("card", "c3")}><strong className={s.stat} data-count="1.1" data-dec="1" data-prefix="$" data-suffix="B">$1.1B</strong><p>estimated deepfake-driven losses in financial services</p><span className={s.src}>Deloitte Financial Services Institute</span></div>
            <div className={cx("card", "c4")}><strong className={s.stat} data-count="26.7" data-dec="1" data-prefix="$" data-suffix="B">$26.7B</strong><p>GenAI image & likeness market by 2030</p><span className={s.src}>Grand View Research</span>
              <svg viewBox="0 0 140 90" className={s.curve}><path d="M2 86 C40 80 70 64 92 40 S128 8 138 4" data-draw="" /><circle cx="138" cy="4" r="4" /></svg></div>
            <div className={cx("card", "c5")}><b>Rights infrastructure today</b>
              <div className={s.cmp}><span>Music</span><span className={s.monoV}>$32.3B</span></div><i className={s.cmp__full} data-fill="" />
              <div className={s.cmp}><span>Likeness</span><span className={cx("monoV", "red")}>None*</span></div><i className={s.cmp__none} />
              <p>*No standard framework exists. Which is why we&apos;re building it.</p></div>
          </div>
        </section>

        {/* A04 STEPS (pinned) */}
        <section className={s.steps} id="steps" data-steps="">
          <div className={s.steps__pin} data-steps-pin="">
            <div className={s.split}><div><Eyebrow>How it works · 7 steps, 1 platform</Eyebrow><h2 className={s.h2}><span>From dealmaking to</span><span>enforcement. <span className={s.muted}>One platform.</span></span></h2></div>
              <p className={s.sub}>Historically fragmented across lawyers, spreadsheets, manual searches and goodwill — every step now runs on a single API-addressable platform.</p></div>
            <div className={s.steps__grid}>
              <ol className={s.steps__list}><i className={s.steps__track}><b data-strack="" /></i>
                {STEPS.map(([t, d], i) => <li key={t} data-step={i}><span className={s.mono}>{String(i + 1).padStart(2, "0")}</span><b>{t}</b><p>{d}</p></li>)}
              </ol>
              <div className={s.steps__stage}>
                <div className={s.steps__top}><b data-stitle="">Step 01 — Register</b><span className={s.mono} data-snum="">01 / 07</span></div>
                <div className={s.steps__ui}>{STEPS.map(([, , ui], i) => <img key={i} src={`${A}${ui}.jpg`} alt="" data-sui={i} />)}</div>
                <em className={s.steps__chip}><i />Likeness registered · TR-832-0419</em>
                <div className={s.steps__bars}>{STEPS.map((_, i) => <i key={i} data-sbar={i} />)}</div>
              </div>
            </div>
          </div>
        </section>

        {/* A05 SWITCHBOARD */}
        <section className={s.dark} id="switch" data-dark="">
          <div className={s.dark__glow} />
          <div className={s.center}><Eyebrow dark>TalentRights · Consent</Eyebrow>
            <h2 className={cx("h2", "tc")} data-lines=""><span>You decide who</span><span className={s.mintDim}>gets to be you.</span></h2>
            <p className={cx("sub", "tc", "onDark")} data-rise="">Set your rules once. Every AI platform that queries TrueRights gets an instant answer — allow, deny, or allow at your price.</p></div>
          <div className={s.console} data-console="">
            <div className={s.console__l}>
              <div className={s.console__head}><b>Consent switchboard</b><span className={s.livePill}>● Live</span>
                <div className={s.seg}>{["All", "Likeness", "Voice", "Style", "Platforms"].map((l, i) => <span key={l} className={i === 0 ? s.on : undefined}>{l}</span>)}</div></div>
              <div className={s.console__cols}><span>ASSET / SCOPE</span><span>RATE</span><span>RULE</span></div>
              {SWITCH.map(([a, b, r, on], i) => (
                <div key={i} className={s.console__row} data-crow=""><span><b>{a}</b> <span className={s.mono}>{b}</span></span><span className={r === "—" ? s.faint : s.neon}>{r}</span><Tog on={on} dark /><em className={on ? s.neon : s.red}>{on ? "ALLOW" : "DENY"}</em></div>
              ))}
            </div>
            <div className={s.console__r}>
              <div className={s.console__head}><b>Query log</b><span className={s.mono}>streaming</span></div>
              <div className={s.qlog} data-log="">{LOGS.map(([t, p, sc, r, ok]) => <div key={t} className={s.qrow}><span className={s.mono}>{t}</span><div><b>{p}</b><span>{sc}</span></div><em className={ok ? s.tagOk : s.tagNo}>{r}</em></div>)}</div>
              <div className={s.qstats}><div><strong data-count="14820">14,820</strong><span>queries · 6 platforms</span></div><div><strong data-count="1780" data-prefix="£">£1,780</strong><span>accrued this week</span></div><div><strong data-count="2104">2,104</strong><span>blocked</span></div></div>
              <span className={s.mono}>Last query 03m ago · £1,780.40 pending</span>
            </div>
          </div>
          <p className={s.neutral}>Neutral by design — TrueRights never sells your likeness. It only enforces the rules you set.</p>
        </section>

        {/* A06 DETECTION */}
        <section className={s.sec} id="detect">
          <div className={s.detect}>
            <div>
              <Eyebrow>Detection · Enforcement</Eyebrow>
              <h2 className={s.h2} data-lines=""><span>Spot every copy</span><span className={s.muted}>before it spreads.</span></h2>
              <p className={s.sub} data-rise="" style={{ marginTop: 28, maxWidth: 500 }}>TrueRights scans AI platforms, social feeds and ad networks for your face, voice and style — and acts the moment a use breaks your terms.</p>
              <ul className={s.feats}>{[["Likeness & voice matching", "Detects synthetic and re-used copies of you."], ["AI copyright & watermarking", "Every licensed output carries proof of origin."], ["One-click takedowns", "Notices filed and tracked for you."]].map(([a, b], i) => <li key={a} data-rise=""><em>{String(i + 1).padStart(2, "0")}</em><div><b>{a}</b><span>{b}</span></div></li>)}</ul>
            </div>
            <div className={s.scan} data-scan="">
              <img src={`${A}likeness.jpg`} alt="" />
              <svg className={s.mesh} viewBox="0 0 680 760" data-mesh="">{Array.from({ length: 110 }, (_, i) => { const a = i * 2.399, r = Math.sqrt(i / 110) * 150; return <circle key={i} cx={(330 + r * Math.cos(a) * 0.8).toFixed(2)} cy={(330 + r * Math.sin(a)).toFixed(2)} r="1.9" />; })}</svg>
              <i className={s.scan__line} data-scanline="" />
              <span className={s.scan__chip}><i />Scanning 6 platforms…</span>
              <div className={s.readout}>
                <div><small>Match confidence</small><strong data-count="97.8" data-dec="1" data-suffix="%">97.8%</strong><i className={s.meter}><b data-meter="" /></i><em className={s.red}>Unlicensed use</em></div>
                <div><pre className={s.mono2}>{"Source  TikTok · sponsored post\nType    synthetic endorsement\nTerms   not licensed"}</pre>
                  <div className={s.btns}><a className={cx("btn", "btn--forest", "btn--sm")} href="https://truerights.com">File takedown →</a><a className={cx("btn", "btn--line", "btn--sm")} href="https://truerights.com">Offer licence</a></div></div>
              </div>
            </div>
          </div>
          <div className={s.feedHead}><b>Misuse feed</b><span className={s.mono}>Live · anonymised</span></div>
          <div className={s.feed}><div className={s.feed__track} data-marquee="">
            {[...FEED, ...FEED].map(([k, p, t, st, tone, ago], i) => <div key={i} className={s.fcard}><span className={s.fcard__k}>{k}</span><div><span className={s.mono}>{p} · {ago}</span><b>{t}</b><em className={tone === "ok" ? s.tagOkL : s.tagWait}>● {st}</em></div></div>)}
          </div></div>
        </section>

        {/* A07 CASE */}
        <section className={s.sec}>
          <div className={s.case} data-case="">
            <Eyebrow>Case study</Eyebrow>
            <div className={s.case__top}>
              <div><strong className={s.case__big} data-cbig="">$340K</strong><p className={s.case__sub}>recovered + new licensing in Q1</p></div>
              <div><h3 className={s.h3}>Three deepfake takedowns. <span className={s.muted}>One missing royalty stream.</span></h3>
                <p className={s.sub} style={{ marginTop: 22, maxWidth: 540 }}>Within 90 days, TrueRights detected three unlicensed AI endorsements, took them down, converted one into a paid licence — and invoiced a historic unpaid image use.</p></div>
            </div>
            <div className={s.tl}>
              <i className={s.tl__line}><b data-tline="" /></i><span className={s.mono}>Day 0</span><span className={cx("mono", "tl__end")}>Day 90</span>
              {([[4, "Unlicensed AI endorsement detected", "Takedown filed", 0, 1], [23, "Second unlicensed endorsement", "Taken down", 0, 0], [46, "Third endorsement", "Converted to paid licence", 1, 1], [78, "Historic unpaid image use found", "Invoiced", 1, 0]] as [number, string, string, number, number][]).map(([d, t, tag, ok, up]) => (
                <div key={d} className={cx("tev", up ? "tev--up" : "tev--down")} style={{ left: `${(d / 90) * 100}%` }} data-tev="">
                  <i className={ok ? s.tdotOk : s.tdotNo} />
                  <div className={s.tev__card}><span className={s.mono}>Day {d}</span><b>{t}</b><em className={ok ? s.tagOkL : s.tagNoL}>● {tag}</em></div>
                </div>
              ))}
            </div>
            <div className={s.case__foot}><span className={s.mono}>Anonymised composite · representative of TrueRights pilots</span><a href="https://truerights.com" className={cx("btn", "btn--forest", "btn--sm")}>Read the full case →</a></div>
          </div>
        </section>

        {/* A08 CHAOS VS CONTROL */}
        <section className={s.sec} data-cvc="">
          <div className={s.center}><Eyebrow>Before & after</Eyebrow><h2 className={cx("h2", "tc")}><span>From chaos <span className={s.green}>to control.</span></span></h2>
            <button className={s.modeSwitch} data-mode="" aria-label="Toggle before and after"><i data-mknob="" /><span>Without TrueRights</span><span>With TrueRights</span></button></div>
          <div className={s.cvc}>
            <div className={s.cvc__without} data-cwo=""><span className={s.mono}>Without</span>{PAIRS.map(([a]) => <p key={a} data-wo=""><i className={s.x}>×</i>{a}</p>)}</div>
            <div className={s.cvc__with} data-cwi=""><span className={cx("mono", "neon")}>With TrueRights</span>{PAIRS.map(([, b]) => <p key={b} data-wi=""><i className={s.v}>✓</i>{b}</p>)}</div>
          </div>
        </section>

        {/* A09 CREATORS */}
        <section className={s.sec}>
          <div className={s.split}><div><Eyebrow>Real creators. Real impact.</Eyebrow><h2 className={s.h2} data-lines=""><span>Creators who chose</span><span className={s.muted}>to own their likeness.</span></h2></div>
            <div className={s.arrows}><button data-rprev="" aria-label="Previous">←</button><button data-rnext="" className={s.on} aria-label="Next">→</button></div></div>
          <div className={s.rail} data-rail="">{["beth", "kacey", "millie", "monae"].map((c) => (
            <a key={c} href="https://truerights.com" className={s.creator}><img src={`${A}creator-${c}.jpg`} alt="" draggable={false} /><span className={s.play} /><b>{c[0].toUpperCase() + c.slice(1)} × TrueRights</b><span className={s.mono}>Creator · Watch story</span></a>
          ))}</div>
          <div className={s.railbar}><b data-railbar="" /></div>
        </section>

        {/* A10 PILLARS */}
        <section className={s.sec}>
          <div className={s.split}><div><Eyebrow>Built for everyone in the deal</Eyebrow><h2 className={s.h2} data-lines=""><span>Control. Protect.</span><span className={s.green}>Monetise.</span></h2></div>
            <div className={s.tabs} data-tabs="">{["Talent & agencies", "Brands & advertisers", "AI platforms"].map((t, i) => <button key={t} data-tab={i} data-on={i === 0 ? "" : undefined}>{t}</button>)}</div></div>
          <div className={s.panels} data-panels="">
            {([["control-bg", "Control", "Your rights, one record.", "Register likeness, voice and style once. Every deal, licence and permission lives in a single verified registry you own.", "Registry · deals · licences"], ["protect-bg", "Protect", "Every copy, found.", "Detection across AI platforms, social and ads — with watermarking and takedowns that work while you sleep.", "Detection · takedowns"], ["monetise-bg", "Monetise", "Paid for every use.", "TrueRates prices each use fairly, and payments follow every licensed generation automatically.", "TrueRates · payments"]] as string[][]).map(([img, t, h, d, tag], i) => (
              <div key={t} className={s.panel} data-panel={i} data-open={i === 0 ? "" : undefined}>
                <img src={`${A}${img}.jpg`} alt="" /><span className={s.panel__n}>{String(i + 1).padStart(2, "0")} — {t}</span>
                <div className={s.panel__body}><b>{h}</b><p>{d}</p></div>
                <div className={s.panel__closed}><b>{t}</b><span className={s.mono}>{tag}</span><i>+</i></div>
              </div>
            ))}
          </div>
        </section>

        {/* A11 API */}
        <section className={cx("dark", "api")} id="api" data-dark="">
          <div className={s.dark__glow} style={{ left: "75%", top: "50%" }} />
          <div className={s.api__grid}>
            <div>
              <Eyebrow dark>For AI platforms · API-first</Eyebrow>
              <h2 className={s.h2} data-lines=""><span>Consent, answered</span><span className={s.mintDim}>before you generate.</span></h2>
              <p className={cx("sub", "onDark")} data-rise="" style={{ marginTop: 28 }}>One call tells you whether a use is allowed, what it costs and what must be watermarked. Every generation is logged, licensed and paid — automatically.</p>
              <span className={cx("mono", "mintMono")} style={{ display: "block", marginTop: 50 }}>REGULATOR-READY</span>
              <div className={s.regs}>{["EU AI Act", "NO FAKES Act", "Denmark personality law"].map((r) => <span key={r}>{r}</span>)}</div>
              <div className={s.apistats}>{[["$100B+", "rights & licensing market"], ["1 API", "consent · licence · payment"], ["Neutral", "by design"]].map(([a, b]) => <div key={a}><strong>{a}</strong><span>{b}</span></div>)}</div>
            </div>
            <div className={s.code} data-code="">
              <div className={s.code__bar}><i /><i /><i /><div>{["cURL", "Node", "Python"].map((t, i) => <span key={t} className={i === 0 ? s.on : undefined}>{t}</span>)}</div></div>
              <div className={s.code__req}><em>GET</em><pre data-type="">{"/v1/consent?talent=TR-832-0419\n    &use=likeness.commercial\n    &platform=acme_v4"}</pre></div>
              <div className={s.code__res}><em>● 200 OK</em>
                <pre data-json="">{[
                  ["{", ""], ['  "talent": ', '"TR-832-0419",'], ['  "use": ', '"likeness/commercial",'], ['  "decision": ', '"allow",'], ['  "rate": ', "{"], ['    "amount": ', "0.12,"], ['    "currency": ', '"USD",'], ['    "per": ', '"generation"'], ["  },", ""], ['  "watermark": ', '"required",'], ['  "licence_id": ', '"TR-L-2291",'], ['  "payout": ', '"on_generation"'], ["}", ""],
                ].map(([k, v], i) => <span key={i} className={s.jl}><span className={s.jk}>{k}</span><span className={v.startsWith('"') ? s.jv : s.jn}>{v}</span>{"\n"}</span>)}</pre></div>
            </div>
          </div>
          <span className={s.apinote}>Illustrative request — API reference available to partners.</span>
        </section>

        {/* A12 TESTIMONY */}
        <section className={s.quote}>
          <img src={`${A}nicolaas-kroone.jpg`} alt="Nicolaas Kroone" />
          <blockquote data-quote="">“I think I can speak on behalf of many brands we work with when I say: the need for TrueRights in the era of AI is increasingly important.”</blockquote>
          <b>Nicolaas Kroone</b><span>Co-founder, Bloom Studios</span>
        </section>

        {/* A13 PRESS */}
        <section className={s.press}><span>As featured in</span><div>{["campaign", "net-influencer", "ai-media-news"].map((p) => <img key={p} src={`${A}press-${p}.png`} alt={p} />)}</div></section>

        {/* A14 CTA */}
        <section className={s.ctaWrap} id="cta">
          <div className={s.cta} data-cta="">
            <div className={s.stage__grid} /><div className={s.cta__bloom} />
            <h2 className={s.cta__h}><span>Your likeness.</span><span className={s.cta__row}><span className={s.neon}>Your terms.</span><img src={`${A}likeness.jpg`} alt="" /></span></h2>
            <p>Register once. Decide every use. Get paid every time.</p>
            <div className={s.btns}><a href="https://truerights.com" className={cx("btn", "btn--neon")} data-magnetic="">Register your likeness</a><a href="https://truerights.com" className={cx("btn", "btn--glass")}>Talk to our team</a></div>
            <div className={s.avatars}>{["beth", "kacey", "millie", "monae"].map((c) => <img key={c} src={`${A}creator-${c}.jpg`} alt="" />)}<span>Join creators, agencies, brands and AI platforms already on TrueRights</span></div>
            <div className={cx("float", "ctaF1")} data-float="" data-depth="1"><small className={s.mono}>LIKENESS / COMMERCIAL</small><strong>$0.12 / gen</strong><Tog on /></div>
            <div className={cx("float", "ctaF2")} data-float="" data-depth="1.3"><b><i className={s.dotRed} />Deepfake detected</b><em className={s.takedown}>Takedown filed ✓</em></div>
          </div>
        </section>
      </main>

      {/* A15 FOOTER */}
      <footer className={s.footer}>
        <div className={s.footer__top}>
          <div><Logo className={s.footer__logo} /><p>The rights ownership company.<br />The platform to own your rights and digital identity.</p></div>
          {[["Platform", ["TalentRights", "TrueRates", "Detection", "AI Copyright", "Watermarking", "Creative Studio"]], ["Who it’s for", ["Talent", "Agencies", "Brands", "AI Platforms", "Partners"]], ["Company", ["About", "Team", "Press", "Careers", "Contact"]]].map(([h, ls]) => (
            <div key={h as string} className={s.footer__col}><b>{h}</b>{(ls as string[]).map((l) => <a key={l} href="https://truerights.com">{l}</a>)}</div>
          ))}
        </div>
        <div className={s.wordmark} data-wordmark="" aria-hidden="true">TrueRights</div>
        <div className={s.footer__bot}><span>© 2026 TrueRights</span><span>Privacy · Terms · Cookies</span></div>
      </footer>
      <ConceptBadge company="TrueRights" className={s.badge} />
    </div>
  );
}
