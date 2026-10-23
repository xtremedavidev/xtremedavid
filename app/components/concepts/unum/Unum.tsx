"use client";

import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { Onest, JetBrains_Mono } from "next/font/google";
import s from "./unum.module.css";
import ConceptBadge from "../ConceptBadge";
import { initUnumMotion } from "./motion";
import { COPY, type Lang } from "./copy";
import { chartSVG, waveSVG } from "./teeth";

const onest = Onest({ subsets: ["latin", "cyrillic"], weight: ["300", "400", "500", "600"], variable: "--font-onest" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], weight: ["400", "500"], variable: "--font-jb" });
const cx = (...n: string[]) => n.map((k) => s[k]).filter(Boolean).join(" ");
const A = "/concepts/unum/";
const CHART = chartSVG();
const WAVE = waveSVG();

function Logo({ dark = false }: { dark?: boolean }) {
  return (
    <span className={cx("logo", dark ? "logo--dark" : "")}>
      <i>U</i><b>UNUM.CLINIC</b>
    </span>
  );
}

function Stamp({ time, text, rec = false, dark = false }: { time: string; text: string; rec?: boolean; dark?: boolean }) {
  return (
    <span className={cx("stamp", dark ? "stamp--dark" : "")} data-stamp="">
      <i className={rec ? s.rec : undefined} /><b>{time}</b><span>{text}</span>
    </span>
  );
}

// Switching language remounts the page (key), so motion is torn down and rebuilt cleanly around the new text.
export default function Unum() {
  const [lang, setLang] = useState<Lang>("ru");
  useEffect(() => { try { const q = new URLSearchParams(location.search).get("lang"); const v = q || localStorage.getItem("unum-lang"); if (v === "en" || v === "ru") setLang(v); } catch { /* ignore */ } }, []);
  const pick = (l: Lang) => { if (l === lang) return; setLang(l); try { localStorage.setItem("unum-lang", l); } catch { /* ignore */ } };
  return <Page key={lang} lang={lang} pick={pick} />;
}

function Page({ lang, pick }: { lang: Lang; pick: (l: Lang) => void }) {
  const root = useRef<HTMLDivElement>(null);
  const t = COPY[lang];

  useGSAP(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled && root.current) cleanup = initUnumMotion(root.current); });
    return () => { cancelled = true; cleanup?.(); };
  }, { scope: root });

  return (
    <div ref={root} className={`${s.root} ${onest.variable} ${mono.variable}`} lang={lang}>
      <div className={s.progress} data-progress="" aria-hidden="true" />

      <header className={s.nav} data-nav="">
        <a href="#top" aria-label="UNUM.CLINIC"><Logo /></a>
        <nav className={s.nav__links} aria-label="Main">
          <a href="#voice">{t.nav[0]}</a><a href="#chart">{t.nav[1]}</a><a href="#security">{t.nav[2]}</a><a href="#specialties">{t.nav[3]}</a>
        </nav>
        <div className={s.lang} role="group" aria-label="Language">
          <button data-on={lang === "ru" ? "" : undefined} onClick={() => pick("ru")} aria-pressed={lang === "ru"}>RU</button>
          <button data-on={lang === "en" ? "" : undefined} onClick={() => pick("en")} aria-pressed={lang === "en"}>EN</button>
        </div>
        <a href="https://unum.clinic/login" className={s.nav__login}>{t.login}</a>
        <a href="https://unum.clinic/register" className={cx("btn", "btn--teal", "btn--sm")} data-magnetic="">{t.register}</a>
      </header>

      <main id="top">
        {/* 01 HERO · 09:00 */}
        <section className={s.hero} data-hero="">
          <Stamp time="09:00" text={t.hero.stamp} rec />
          <h1 className={s.h1} data-lines=""><span>{t.hero.h1a}</span><span className={s.teal}>{t.hero.h1b}</span></h1>
          <p className={s.lead} data-rise="">{t.hero.lead}</p>
          <div className={s.btns} data-rise="">
            <a href="https://unum.clinic/register" className={cx("btn", "btn--teal")} data-magnetic="">{t.register}</a>
            <a href="#voice" className={cx("btn", "btn--ghost")}>{t.hero.watch}</a>
          </div>
          <div className={s.stage} data-stage="">
            <img className={s.stage__img} src={A + "operatory.jpg"} alt="" data-stage-img="" />
            <div className={s.dict} data-dict="">
              <span className={s.mic}><i /></span>
              <div className={s.wave} data-wave="" dangerouslySetInnerHTML={{ __html: WAVE }} />
              <span className={s.mono}>00:<b data-clock="">42</b> · {t.hero.dictation}</span>
              <p data-quote="">{t.hero.quote}</p>
            </div>
            <div className={s.mcard} data-mcard="">
              <span className={s.mono}>{t.hero.card}</span>
              <b className={s.mcard__name}>{t.hero.patient}</b>
              {t.hero.fields.map(([k, v], i) => (
                <div key={i} className={s.field} data-hfield="">
                  <span className={s.mono}>{k}</span>
                  <p><span data-hval="">{v}</span><span className={s.ghost} data-hghost="">{t.hero.filling}</span></p>
                  <i className={s.check} data-hcheck="">✓</i>
                </div>
              ))}
              <div className={s.aichip} data-aichip=""><span className={s.mono}>{t.hero.ai}</span><b>{t.hero.aiText}</b></div>
            </div>
          </div>
        </section>

        {/* 02 PROBLEM · 09:02 */}
        <section className={s.problem}>
          <Stamp time="09:02" text={t.problem.stamp} />
          <div className={s.big} data-big=""><span>≈</span><b data-two="">2</b> <span>{t.problem.unit}</span></div>
          <p className={s.problem__text} data-rise="">{t.problem.text}</p>
          <div className={s.bars}>
            <div><span className={s.mono}>{t.problem.a}</span><div className={s.bar}><i data-bar-a="" /></div><b>{t.problem.ha}</b></div>
            <div><span className={s.mono}>{t.problem.b}</span><div className={s.bar}><i className={s["bar--b"]} data-bar-b="" /></div><b>{t.problem.hb}</b></div>
          </div>
          <p className={s.src}>{t.problem.src}</p>
        </section>

        {/* 03 VOICE → CARD · 09:04 */}
        <section className={s.voice} id="voice" data-voice="">
          <div className={s.voice__pin} data-voice-pin="">
            <Stamp time="09:04" text={t.voice.stamp} rec />
            <h2 className={s.h2} data-lines=""><span>{t.voice.h1}</span><span className={s.teal}>{t.voice.h2}</span></h2>
            <div className={s.voice__grid}>
              <div className={s.transcript}>
                <span className={s.mono}>{t.voice.tr}</span>
                {t.voice.lines.map(([l, f], i) => (
                  <div key={i} className={s.tline} data-tline={f}>
                    <p>{l}</p><span className={s.ttag}>{t.voice.tags[f]}</span>
                  </div>
                ))}
              </div>
              <svg className={s.flow} viewBox="0 0 200 560" preserveAspectRatio="none" aria-hidden="true">
                {[[60, 40], [130, 40], [200, 150], [275, 260], [350, 260], [420, 370], [495, 370]].map(([a, b], i) => (
                  <path key={i} d={`M0 ${a} C100 ${a} 100 ${b} 200 ${b}`} data-flow="" />
                ))}
              </svg>
              <div className={s.vcard}>
                <span className={s.mono}>{t.voice.card}</span>
                {t.voice.fields.map(([k, v], i) => (
                  <div key={i} className={s.vfield} data-vfield={i}>
                    <span className={s.mono}>{k}</span><p data-vval="">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 04 DENTAL CHART · 09:09 */}
        <section className={s.chartSec} id="chart" data-chart-sec="">
          <div className={s.chart__pin} data-chart-pin="">
            <Stamp time="09:09" text={t.chart.stamp} />
            <h2 className={s.h2} data-lines=""><span>{t.chart.h1}</span><span className={s.teal}>{t.chart.h2}</span></h2>
            <div className={s.chart} data-chart="" dangerouslySetInnerHTML={{ __html: CHART }} />
            <div className={s.says} data-says="">
              {t.chart.says.map(([a, b], i) => (
                <div key={i} className={s.say} data-say={i}><span className={s.mono}>{a}</span><p>{b}</p></div>
              ))}
            </div>
            <div className={s.legend}>
              {t.chart.legend.map((x, i) => <span key={x}><i className={s["lg" + i]} />{x}</span>)}
            </div>
          </div>
        </section>

        {/* 05 DIAGNOSIS · 09:12 */}
        <section className={s.dx}>
          <div className={s.dx__text}>
            <Stamp time="09:12" text={t.dx.stamp} />
            <h2 className={s.h2l} data-lines=""><span>{t.dx.h1}</span><span className={s.teal}>{t.dx.h2}</span></h2>
            <p className={s.lead} data-rise="">{t.dx.lead}</p>
          </div>
          <div className={s.dcard} data-dcard="">
            <span className={s.mono}>{t.dx.label}</span>
            <b className={s.icd}>K02.1</b>
            <b className={s.dname}>{t.dx.name}</b>
            <div className={s.conf}><span className={s.mono}>{t.dx.conf}</span><b><span data-conf="">93</span>%</b><i><em data-conf-bar="" /></i></div>
            <span className={s.mono}>{t.dx.alts}</span>
            {t.dx.altList.map(([c, n, p]) => <div key={c} className={s.alt} data-alt=""><span className={s.mono}>{c}</span><b>{n}</b><span>{p}</span></div>)}
            <span className={s.mono}>{t.dx.why}</span>
            <ul className={s.why}>{t.dx.reasons.map((r) => <li key={r} data-why="">{r}</li>)}</ul>
            <div className={s.btns}>
              <button className={cx("btn", "btn--teal", "btn--sm")} data-confirm=""><span data-confirm-label="">{t.dx.confirm}</span><span data-confirmed="" className={s.confirmed}>✓ {t.dx.confirmed}</span></button>
              <button className={cx("btn", "btn--ghost", "btn--sm")}>{t.dx.edit}</button>
            </div>
          </div>
          <div className={s.dphoto} data-dphoto="">
            <img src={A + "doctor.jpg"} alt="" loading="lazy" />
            <span className={s.dchip}>{t.dx.chip} ✓</span>
          </div>
        </section>

        {/* 06 PLAN · 09:15 */}
        <section className={s.plan}>
          <Stamp time="09:15" text={t.plan.stamp} />
          <h2 className={s.h2} data-lines=""><span>{t.plan.h1}</span><span className={s.teal}>{t.plan.h2}</span></h2>
          <div className={s.plans} data-plans="">
            {t.plan.plans.map(([n, items, tot], i) => (
              <article key={n} className={s.pcard} data-pcard={i}>
                <span className={s.mono}>{t.plan.option} {i + 1}</span>
                <h3>{n}</h3>
                {i === 1 && <span className={s.recb}>{t.plan.rec}</span>}
                <ul>{items.map(([a, p]) => <li key={a}><span>{a}</span><span>{p} ₸</span></li>)}</ul>
                <div className={s.total}><span className={s.mono}>{t.plan.total}</span><b><span data-total={tot.replace(/\s/g, "")}>{tot}</span> ₸</b></div>
              </article>
            ))}
          </div>
          <p className={s.src}>{t.plan.note}</p>
          <div className={s.sign} data-sign="">
            <img src={A + "plan-signing.jpg"} alt="" loading="lazy" data-sign-img="" />
            <div className={s.signcard} data-signcard="">
              <span className={s.mono}>{t.plan.signedFor}</span>
              <svg viewBox="0 0 320 110" aria-hidden="true"><path data-sig="" d="M12 78 C24 40 44 22 56 46 C66 66 54 92 70 84 C88 74 92 30 112 34 C128 38 116 80 134 78 C150 76 158 44 176 48 C190 52 180 76 196 74 C214 72 222 50 240 58 C252 64 248 80 262 74 C276 68 290 46 306 40" /><line x1="10" y1="100" x2="310" y2="100" /></svg>
              <div className={s.signed} data-signed=""><i>✓</i><div><b>{t.plan.signed}</b><span className={s.mono}>{t.plan.signedAt}</span></div></div>
            </div>
          </div>
        </section>

        {/* 07 HISTORY · 09:20 */}
        <section className={s.history}>
          <Stamp time="09:20" text={t.history.stamp} />
          <h2 className={s.h2} data-lines=""><span>{t.history.h1}</span><span className={s.teal}>{t.history.h2}</span></h2>
          <div className={s.hcard} data-hcard="">
            <div className={s.tl}>
              <i className={s.tl__line} /><i className={s.tl__fill} data-tl-fill="" />
              {t.history.events.map(([d, e], i) => (
                <div key={d} className={s.tl__ev} data-tl-ev=""><span className={s.mono}>{d}</span><i className={i === 3 ? s.now : undefined} /><b>{e}</b></div>
              ))}
            </div>
            <div className={s.hgrid}>
              <div className={s.opg} data-opg="">
                <img src={A + "opg-xray.jpg"} alt="" loading="lazy" />
                <i className={s.scan} data-scan="" />
                <span className={cx("mark", "mark--c")} style={{ left: "68%", top: "56%" }} data-mark=""><em>36 · C</em></span>
                <span className={s.mark} style={{ left: "67%", top: "37%" }} data-mark=""><em>26 · K</em></span>
                <span className={s.mark} style={{ left: "27%", top: "57%" }} data-mark=""><em>46 · {lang === "ru" ? "П" : "F"}</em></span>
              </div>
              <div className={s.docs}>
                <span className={s.mono}>{t.history.docsTitle}</span>
                {t.history.docs.map(([a, b]) => (
                  <div key={a} className={s.doc} data-doc=""><i className={s.mono}>{b.split(" ")[0]}</i><div><b>{a}</b><span className={s.mono}>{b}</span></div></div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 08 SECURITY · 09:24 */}
        <section className={s.security} id="security" data-dark="">
          <Stamp time="09:24" text={t.sec.stamp} dark />
          <h2 className={s.h2} data-lines=""><span>{t.sec.h1}</span><span className={s.mint}>{t.sec.h2}</span></h2>
          <div className={s.secgrid}>
            <div className={s.iso} data-iso="">
              <span className={s.mono}>{t.sec.clinic}</span>
              <div className={s.iso__grid}>
                {t.sec.doctors.map((d, i) => (
                  <div key={d} className={s.space} data-space={i} data-on={i === 0 ? "" : undefined}>
                    <span className={s.mono}>{d}</span>
                    <div className={s.pts}>{Array.from({ length: [14, 10, 12, 8][i] }).map((_, k) => <i key={k} data-pt="" />)}</div>
                  </div>
                ))}
                <span className={s.lock} data-lock="" aria-hidden="true">
                  <svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
                </span>
              </div>
            </div>
            <div className={s.log} data-log="">
              <div className={s.log__head}><span className={s.mono}>{t.sec.log}</span><span className={s.live}>● LIVE</span></div>
              <div className={s.log__rows} data-log-rows="">
                {t.sec.rows.map(([a, b, c], i) => (
                  <div key={i} className={s.row} data-row="" data-on={i === 0 ? "" : undefined}>
                    <span className={s.mono}>{t.sec.times[i]}</span>
                    <div><b>{a} · {b}</b><span className={s.mono}>{c}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 09 SPECIALTIES · 09:27 */}
        <section className={s.spec} id="specialties">
          <Stamp time="09:27" text={t.spec.stamp} />
          <h2 className={s.h2} data-lines=""><span>{t.spec.h1}</span><span className={s.teal}>{t.spec.h2}</span></h2>
          {[t.spec.a, t.spec.b].map((row, r) => (
            <div key={r} className={s.marq}>
              <div className={s.marq__track} data-marq={r}>
                {[0, 1].map((k) => row.map((x, i) => (
                  <span key={k + "-" + i} className={cx("pill", r === 0 && i === 0 ? "pill--now" : "")} aria-hidden={k === 1 ? true : undefined}>{x}<em>{r === 0 && i === 0 ? t.spec.now : t.spec.soon}</em></span>
                )))}
              </div>
            </div>
          ))}
          <p className={s.src}>{t.spec.note}</p>
        </section>

        {/* 10 FOCUS */}
        <section className={s.focus}>
          <div className={s.focus__img} data-focus-img=""><img src={A + "tablet-hands.jpg"} alt="" loading="lazy" /></div>
          <div>
            <h2 className={s.h2l} data-lines=""><span>{t.focus.h1}</span><span>{t.focus.h2}</span><span className={s.teal}>{t.focus.h3}</span></h2>
            <ol className={s.focus__list}>
              {t.focus.items.map(([h, p], i) => <li key={h} data-rise=""><span className={s.mono}>0{i + 1}</span><div><b>{h}</b><p>{p}</p></div></li>)}
            </ol>
          </div>
        </section>

        {/* 11 CTA · 09:30 */}
        <section className={s.cta}>
          <Stamp time="09:30" text={t.cta.stamp} />
          <div className={s.cta__stage} data-cta="">
            <img src={A + "clinic-reception.jpg"} alt="" loading="lazy" data-cta-img="" />
            <div className={s.cta__body}>
              <h2 className={s.h2cta} data-lines=""><span>{t.cta.h1}</span><span className={s.mint}>{t.cta.h2}</span></h2>
              <div className={s.btns}>
                <a href="https://unum.clinic/register" className={cx("btn", "btn--white")} data-magnetic="">{t.register}</a>
                <a href="https://unum.clinic/login" className={cx("btn", "btn--line")}>{t.login}</a>
              </div>
            </div>
          </div>
        </section>

        {/* 12 FOOTER */}
        <footer className={s.foot}>
          <div className={s.foot__top}>
            <div><Logo /><p>{t.foot.tag}</p></div>
            {t.foot.cols.map(([h, it]) => <div key={h}><span className={s.mono}>{h}</span><ul>{it.map((x) => <li key={x}>{x}</li>)}</ul></div>)}
          </div>
          <div className={s.wordmark} data-wordmark="">UNUM.CLINIC</div>
          <div className={s.foot__bottom}><span className={s.mono}>© 2026 UNUM.CLINIC</span><span className={s.mono}>{t.foot.note}</span></div>
        </footer>
      </main>

      <ConceptBadge company="UNUM.CLINIC" className={s.badge} />
    </div>
  );
}
