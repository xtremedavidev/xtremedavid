"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Geist } from "next/font/google";
import s from "./galcon.module.css";
import ConceptBadge from "../ConceptBadge";
import { initGalconMotion } from "./motion";

const geist = Geist({ subsets: ["latin"], weight: ["400", "500", "600"] });
const cx = (...names: string[]) => names.map((n) => s[n]).filter(Boolean).join(" ");

export default function Galcon() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled && root.current) cleanup = initGalconMotion(root.current);
    });
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, { scope: root });

  return (
    <div ref={root} className={`${s.root} ${geist.className}`}>
      <div className={s.progress} data-progress="" aria-hidden="true" />

      <header className={s.nav} data-nav="">
        <a className={s.nav__logo} href="#top" aria-label="Galcon home">
          <img src="/concepts/galcon/logo.png" alt="Galcon — Member of the Plasson Group" loading="eager" />
        </a>
        <nav className={s.nav__links} data-navlinks="" aria-label="Main">
          <span className={s.nav__pill} data-navpill="" />
          <a href="#areas">Garden</a>
          <a href="#areas">Landscape</a>
          <a href="#areas" data-active="">Agriculture</a>
          <a href="#products">Products</a>
          <a href="#proof">Projects</a>
          <a href="#proof">About</a>
        </nav>
        <a className={cx("btn", "btn--dark", "nav__cta")} data-magnetic="" href="#contact">
          Contact sales
        </a>
      </header>

      <main id="top">
        {/* 01 HERO */}
        <section className={cx("sec", "hero", "wrap")} data-section="hero">
          <div className={s.hero__top}>
            <h1 className={s.two} data-hero-title="">
              <span className={s.l1} data-l1="">Every drop,</span>
              <span className={s.l2} data-l2="">precisely controlled.</span>
            </h1>
            <div className={s.hero__aside} data-hero-aside="">
              <p className={s.lead}>
                Irrigation, fertigation and climate controllers for home gardens, parks and farms — made in Israel by Galcon, a member of the Plasson Group.
              </p>
              <div className={s.row}>
                <a className={cx("btn", "btn--dark")} data-magnetic="" href="#products">
                  Explore products
                </a>
                <a className={cx("btn", "btn--light")} data-magnetic="" href="#contact">
                  Talk to an expert
                </a>
              </div>
            </div>
          </div>
          <div className={s.hero__cards} data-hero-cards="">
            <article className={cx("card", "card--photo")} data-hero-card="">
              <img src="/concepts/galcon/field.jpg" alt="Young lettuce rows with drip irrigation lines" data-hero-photo="" loading="eager" />
              <span className={cx("chip", "chip--dark")}>Drip · Fertigation · Climate</span>
              <h2 className={s.card__title}>
                <span>Open Field</span>
                <span>Agriculture</span>
              </h2>
            </article>
            <article className={cx("card", "stage")} data-hero-card="" data-stage="">
              <img className={s.stage__bg} src="/concepts/galcon/moss.jpg" alt="" data-depth="0.15" loading="eager" />
              <p className={s.stage__title}>
                <span>Control</span>
                <span>from anywhere</span>
              </p>
              <div className={s.stage__shadow} data-shadow="" />
              <img className={s.stage__product} src="/concepts/galcon/galileo-cloud.png" alt="Galcon Galileo Cloud controller" data-product="" data-depth="0.5" loading="eager" />
              <div className={s.stage__glass} data-glass="" data-depth="0.9">
                <span className={s.tag}>Cloud</span>
                <span className={cx("lens", "round", "glass")}>4G</span>
                <small>Galileo Cloud</small>
                <strong><span data-count="120">120</span> valves</strong>
                <em>from any device</em>
              </div>
            </article>
          </div>
        </section>

        {/* 02 AREAS */}
        <section className={cx("sec", "areas", "wrap")} id="areas" data-section="areas">
          <div className={s.sec__head}>
            <h2 className={cx("two", "h2")} data-fill="">
              <span className={s.l1} data-l1="">One system,</span>
              <span className={s.l2} data-l2="">three ways to grow.</span>
            </h2>
            <p className={s.lead} data-lead="">
              The same Galcon control logic runs a balcony planter, a city park and a commercial farm. Choose where you grow.
            </p>
          </div>
          <div className={s.areas__grid}>
            <article className={s.area} data-area="">
              <img src="/concepts/galcon/garden.jpg" alt="Home garden raised beds" loading="lazy" />
              <span className={cx("chip", "chip--dark")}>Tap &amp; battery controllers</span>
              <span className={cx("area__plus", "round", "glass")} data-plus="">+</span>
              <div className={s.area__body}>
                <h3 className={s.area__title}>
                  <span>Residential</span>
                  <span>Gardening</span>
                </h3>
                <div className={s.area__more} data-more="">
                  <p>Set the season once. Tap timers and battery controllers that water the garden while you&apos;re away.</p>
                </div>
              </div>
            </article>
            <article className={s.area} data-area="">
              <img src="/concepts/galcon/park.jpg" alt="Park lawn with sprinklers" loading="lazy" />
              <span className={cx("chip", "chip--dark")}>Parks · campuses · streets</span>
              <span className={cx("area__plus", "round", "glass")} data-plus="">+</span>
              <div className={s.area__body}>
                <h3 className={s.area__title}>
                  <span>Turf &amp;</span>
                  <span>Landscape</span>
                </h3>
                <div className={s.area__more} data-more="">
                  <p>Municipal and landscape controllers that keep public green spaces on one schedule.</p>
                </div>
              </div>
            </article>
            <article className={s.area} data-area="">
              <img src="/concepts/galcon/aerial.jpg" alt="Aerial view of crop rows" loading="lazy" />
              <span className={cx("chip", "chip--dark")}>Irrigation · fertigation</span>
              <span className={cx("area__plus", "round", "glass")} data-plus="">+</span>
              <div className={s.area__body}>
                <h3 className={s.area__title}>
                  <span>Open Field</span>
                  <span>Agriculture</span>
                </h3>
                <div className={s.area__more} data-more="">
                  <p>Irrigation and fertigation programs for fields and greenhouses, from one valve to the whole farm.</p>
                </div>
              </div>
            </article>
          </div>
        </section>

        {/* 03 APP (pinned) */}
        <section className={cx("sec", "app", "wrap")} data-section="app">
          <div className={s.app__stage} data-app="">
            <img className={s.app__bg} src="/concepts/galcon/moss.jpg" alt="" data-app-bg="" loading="eager" />
            <div className={s.app__copy}>
              <h2 className={s.two} style={{ fontSize: "clamp(36px,3.9vw,56px)" }} data-fill="">
                <span className={s.l1} data-l1="">Your whole farm,</span>
                <span className={s.l2} data-l2="">in one app.</span>
              </h2>
              <p className={s.lead} data-lead="">
                Galileo Cloud and GSI PRO run irrigation and fertigation over cellular — set programs, open valves and get real-time alerts from a phone, tablet or computer.
              </p>
            </div>
            <div className={s.app__stats} data-app-stats="">
              <div className={s.stat} data-stat=""><b data-count="120">120</b><span>valves per controller</span></div>
              <div className={s.stat} data-stat=""><b data-count="100">100</b><span>irrigation programs</span></div>
              <div className={s.stat} data-stat=""><b>24/7</b><span>push &amp; email alerts</span></div>
            </div>
            <div className={s.phone} data-phone="">
              <i className={s.phone__island} />
              <div className={s.phone__top}>
                <span className={s.round}>←</span>
                <span className={s.round}>•</span>
              </div>
              <img className={s.phone__product} src="/concepts/galcon/gsi-pro.png" alt="GSI PRO controller" data-phone-product="" loading="lazy" />
              <div className={cx("zone", "glass")}>
                <span className={s.zone__thumb}>
                  <img src="/concepts/galcon/galileo-cloud.png" alt="" loading="eager" />
                </span>
                <span className={s.zone__txt}>North Block · Field 3<br /><i>Drip · 4 valves</i></span>
                <span className={s.zone__plus}>+</span>
              </div>
              <p className={s.phone__title}>
                <span>Program 07</span>
                <span data-phone-state="">Irrigation</span>
              </p>
              <p className={s.phone__meta}>Soil moisture <b data-moist="">31</b>% at 30 cm<br />Next cycle starts 05:30 · 18 min</p>
              <div className={s.phone__ctrl}>
                <div>
                  <label>Duration</label>
                  <div className={s.stepper}>
                    <span className={s.round}>−</span>
                    <output><b data-min="">20</b><br />min</output>
                    <span className={s.round}>+</span>
                  </div>
                </div>
                <div>
                  <label>Water</label>
                  <div className={s.water}><span data-water="">4.2</span> m³</div>
                </div>
              </div>
              <div className={s.phone__bar}><i data-phone-bar="" /></div>
              <div className={s.slide} data-phone-slide="">
                <span className={s.slide__knob} data-phone-knob="">✓</span>
                <span className={s.slide__label} data-phone-label="" data-slide-label="">Start irrigation</span>
                <span className={s.slide__chev} data-slide-chev="">›››</span>
              </div>
            </div>
          </div>
        </section>

        {/* 04 PRODUCTS (pinned horizontal on desktop) */}
        <section className={cx("sec", "products")} id="products" data-section="products">
          <div className={cx("wrap", "sec__head")}>
            <h2 className={cx("two", "h2")} data-fill="">
              <span className={s.l1} data-l1="">Every part</span>
              <span className={s.l2} data-l2="">of the water path.</span>
            </h2>
            <div className={s.rail__ctrl}>
              <button className={s.round} data-prev="" aria-label="Previous">←</button>
              <button className={cx("round", "is-dark")} data-next="" aria-label="Next">→</button>
            </div>
          </div>
          <div className={s.wrap}>
            <div className={s.rail} data-rail="">
              <article className={s.prod} data-prod="">
                <div className={s.prod__stage}>
                  <img src="/concepts/galcon/controller-9001.png" alt="Galcon irrigation controller" data-prod-img="" loading="lazy" />
                </div>
                <h3>Irrigation<span>controllers</span></h3>
                <p>From tap timers to cloud systems.</p>
                <a className={s.prod__more} href="#">View range <span className={s.round}>→</span></a>
              </article>
              <article className={s.prod} data-prod="">
                <div className={s.prod__stage}>
                  <img src="/concepts/galcon/fertimix.png" alt="Fertimix fertigation machine" data-prod-img="" loading="lazy" />
                </div>
                <h3>Fertigation<span>machines</span></h3>
                <p>Homogeneous, proportional dosing.</p>
                <a className={s.prod__more} href="#">View range <span className={s.round}>→</span></a>
              </article>
              <article className={s.prod} data-prod="">
                <div className={s.prod__stage}>
                  <img src="/concepts/galcon/rtu.png" alt="Remote terminal unit" data-prod-img="" loading="lazy" />
                </div>
                <h3>Remote<span>terminal units</span></h3>
                <p>Control every corner of the farm.</p>
                <a className={s.prod__more} href="#">View range <span className={s.round}>→</span></a>
              </article>
              <article className={s.prod} data-prod="">
                <div className={cx("prod__stage", "is-white")}>
                  <img src="/concepts/galcon/valve.png" alt="Irrigation valve" data-prod-img="" loading="lazy" />
                </div>
                <h3>Irrigation<span>valves</span></h3>
                <p>¾″ to 2″ for every line.</p>
                <a className={s.prod__more} href="#">View range <span className={s.round}>→</span></a>
              </article>
              <article className={s.prod} data-prod="">
                <div className={s.prod__stage}>
                  <img src="/concepts/galcon/sentek-probe.png" alt="Sentek soil probe" data-prod-img="" loading="lazy" />
                </div>
                <h3>Sensors<span>&amp; meters</span></h3>
                <p>Measure quantity and quality.</p>
                <a className={s.prod__more} href="#">View range <span className={s.round}>→</span></a>
              </article>
            </div>
          </div>
        </section>

        {/* 05 SOIL */}
        <section className={cx("sec", "soil", "wrap")} data-section="soil">
          <div className={s.soil__card} data-soil="">
            <img src="/concepts/galcon/soil.jpg" alt="Soil cutaway with roots and a seedling" data-soil-img="" loading="lazy" />
            <i className={s.soil__line} data-soil-line="" />
            <div className={s.reading} style={{ left: "9%", top: "26%" }} data-reading="">
              <i /><span>10 cm</span><b><span data-count="34">34</span>%</b>
            </div>
            <div className={s.reading} style={{ left: "68%", top: "49%" }} data-reading="">
              <i /><span>30 cm</span><b><span data-count="31">31</span>%</b>
            </div>
            <div className={s.reading} style={{ left: "9%", top: "77%" }} data-reading="">
              <i /><span>60 cm</span><b><span data-count="16">16</span>%</b>
            </div>
            <span className={s.soil__cap}>Sentek probe → IrriMAX Live</span>
          </div>
          <div className={s.soil__copy}>
            <h2 className={s.two} style={{ fontSize: "clamp(36px,3.9vw,56px)" }} data-fill="">
              <span className={s.l1} data-l1="">Know what’s happening</span>
              <span className={s.l2} data-l2="">below the surface.</span>
            </h2>
            <p className={s.lead} data-lead="">
              Sentek probes read soil water, temperature and salinity at multiple depths and stream it live to IrriMAX Live — so you water the roots, not the calendar.
            </p>
            <div className={s.feat} data-feat=""><small>01</small><div><h4>Soil water</h4><p>Moisture at every depth, in real time.</p></div></div>
            <div className={s.feat} data-feat=""><small>02</small><div><h4>Temperature</h4><p>Know when roots are active.</p></div></div>
            <div className={s.feat} data-feat=""><small>03</small><div><h4>Salinity</h4><p>Catch build-up before it hurts yield.</p></div></div>
            <a className={cx("btn", "btn--dark")} data-magnetic="" href="#">Explore Sentek systems</a>
          </div>
        </section>

        {/* 06 PROOF */}
        <section className={cx("sec", "proof", "wrap")} id="proof" data-section="proof">
          <div className={s.sec__head}>
            <h2 className={cx("two", "h2")} data-fill="">
              <span className={s.l1} data-l1="">Nearly 40 years</span>
              <span className={s.l2} data-l2="">of growing with growers.</span>
            </h2>
          </div>
          <div className={s.proof__photo} data-proof="">
            <img src="/concepts/galcon/grower.jpg" alt="Grower checking irrigation on a phone in a greenhouse" data-proof-img="" loading="lazy" />
            <div className={s.proof__card} data-proof-card="">
              <small>Projects in</small><strong><span data-count="10">10</span> countries</strong>
              <div className={s.countries} data-countries="">
                <span>Israel</span><span>Chile</span><span>China</span><span>Germany</span><span>Japan</span><span>Kenya</span><span>Mexico</span><span>Peru</span><span>Russia</span><span>Vietnam</span>
              </div>
            </div>
          </div>
          <div className={s.proof__stats} data-proof-stats="">
            <div><b>~<span data-count="40">40</span></b><span>years of R&amp;D in Kfar Blum</span></div>
            <div><b data-count="5">5</b><span>product families, one system</span></div>
            <div><b data-count="3">3</b><span>markets — home, public, agriculture</span></div>
            <div><b data-count="120">120</b><span>valves on one cloud controller</span></div>
          </div>
        </section>

        {/* 07 CTA */}
        <section className={cx("sec", "cta", "wrap")} id="contact" data-section="cta">
          <div className={s.cta__card} data-cta="">
            <div className={s.cta__copy}>
              <h2 className={cx("two", "h2")}>
                <span className={s.l1} data-l1="">Plan your irrigation</span>
                <span className={s.l2} data-l2="">with a Galcon expert.</span>
              </h2>
              <p className={s.lead}>Tell us what you grow and where. We’ll map the controllers, valves and sensors that fit — and connect you with a local dealer.</p>
            </div>
            <div className={s.cta__oval} data-cta-oval=""><img src="/concepts/galcon/field.jpg" alt="" loading="eager" /></div>
            <img className={s.cta__product} src="/concepts/galcon/gsi-pro.png" alt="GSI PRO controller" data-cta-product="" loading="lazy" />
            <div className={s.slide} data-cta-slide="" role="button" tabIndex={0} aria-label="Slide to contact sales">
              <span className={s.slide__knob} data-cta-knob="">→</span>
              <span className={s.slide__label} data-slide-label="">Contact sales</span>
              <span className={s.slide__chev} data-slide-chev="">›››</span>
            </div>
          </div>
        </section>
      </main>

      <footer className={cx("foot", "wrap")} data-foot="" data-section="footer">
        <div className={s.foot__top} data-foot-top="">
          <div className={s.foot__brand}>
            <span className={s.nav__logo}>
              <img src="/concepts/galcon/logo.png" alt="Galcon" loading="eager" />
            </span>
            <p>Water management systems for home gardens, public landscapes and agriculture.</p>
          </div>
          <div><h5>Areas</h5><ul><li>Residential Gardening</li><li>Turf &amp; Landscape</li><li>Open Field Agriculture</li><li>Sentek decision support</li></ul></div>
          <div><h5>Products</h5><ul><li>Irrigation controllers</li><li>Fertigation machines</li><li>Sensors &amp; meters</li><li>Remote terminal units</li><li>Valves</li></ul></div>
          <div><h5>Company</h5><ul><li>About</li><li>What’s new</li><li>Projects</li><li>Downloads</li><li>Jobs</li></ul></div>
          <div><h5>Contact</h5><ul><li>Kfar Blum 1215000, Israel</li><li>+972 4 690 0200</li><li>info@galconc.com</li></ul></div>
        </div>
        <div className={s.foot__bottom}>
          <span>© 2026 Galcon · Member of the Plasson Group</span>
          <span>Unsolicited concept by David Adebayo — not affiliated with Galcon</span>
        </div>
      </footer>

      <ConceptBadge company="Galcon" className={s.badge} />
    </div>
  );
}
