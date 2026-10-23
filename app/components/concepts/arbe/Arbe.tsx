"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { Outfit, IBM_Plex_Mono } from "next/font/google";
import s from "./arbe.module.css";
import ConceptBadge from "../ConceptBadge";
import { initArbeMotion, SCENES } from "./motion";
import { EXPLODED, FAN, HWFAN, LOGO_PATHS, fogSVG, gridSVG, vignetteSVG } from "./art";

const outfit = Outfit({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-outfit" });
const plex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["500"], variable: "--font-plex" });
const cx = (...n: string[]) => n.map((k) => s[k]).filter(Boolean).join(" ");
const A = "/concepts/arbe/";

const GRID = gridSVG();
const FOG = fogSVG();
const VIGN = (["debris", "rail", "stop", "bike"] as const).map((k, i) => vignetteSVG(k, 31 + i * 7));

function Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 95 38" aria-label="Arbe">
      <g transform="translate(-100 -32)" fill="currentColor">
        {LOGO_PATHS.map((d) => <path key={d.slice(0, 12)} d={d} />)}
      </g>
    </svg>
  );
}

const Arrow = () => <i className={s.arrow} aria-hidden="true">→</i>;

export default function Arbe() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled && root.current) cleanup = initArbeMotion(root.current);
    });
    return () => { cancelled = true; cleanup?.(); };
  }, { scope: root });

  const first = SCENES[0];

  return (
    <div ref={root} className={`${s.root} ${outfit.variable} ${plex.variable}`}>
      <div className={s.progress} data-progress="" aria-hidden="true" />

      {/* NAV */}
      <header className={s.nav} data-nav="">
        <a href="#top" className={s.nav__logo} aria-label="Arbe home"><Logo /></a>
        <nav className={s.nav__links} aria-label="Main">
          <a href="#perception">Technology</a>
          <a href="#inside">Phoenix radar</a>
          <a href="#applications">Applications</a>
          <a href="#recognition">Company</a>
        </nav>
        <span className={s.nav__chip}><i />NASDAQ: ARBE</span>
        <a href="#contact" className={cx("pill", "pill--blue", "nav__cta")} data-magnetic="">Contact</a>
      </header>

      <main id="top">
        {/* 01 HERO */}
        <section className={s.hero} data-hero="">
          <div className={s.hero__top}>
            <div>
              <span className={s.lab} data-rise="">(01) — 4D imaging radar</span>
              <h1 className={s.h1} data-lines="">
                <span className={s.ln}>Radar Revolution.</span>
                <span className={cx("ln", "blue")}>Delivered.</span>
              </h1>
            </div>
            <div className={s.hero__aside}>
              <p className={s.note} data-rise="">Arbe is driving a zero-road-fatality reality, with 4D imaging radar enabling eyes-off driving today and paving the way to full autonomy.</p>
              <div className={s.btns} data-rise="">
                <a href="#inside" className={cx("pill", "pill--blue", "pill--icon")} data-magnetic="">Explore Phoenix radar <Arrow /></a>
                <a href="#contact" className={cx("pill", "pill--ghost")}>Driver survey</a>
              </div>
            </div>
          </div>

          <div className={s.stage} data-stage="">
            <div className={s.stage__media} data-stage-media="">
              <video data-video="" autoPlay muted loop playsInline preload="metadata" poster={A + "hero-poster.jpg"}>
                <source src={A + "hero.webm"} type="video/webm" />
                <source src={A + "hero.mp4"} type="video/mp4" />
              </video>
              <div className={s.stage__shade} />
              <canvas className={s.lens} data-lens-canvas="" aria-hidden="true" />
              <div className={s.lensRing} data-lens-ring="" aria-hidden="true"><span>Radar view · 4D</span></div>
              {["tl", "tr", "bl", "br"].map((k) => <i key={k} className={cx("br", "br--" + k)} data-br="" aria-hidden="true" />)}
              <div className={s.live}><i />Live · Phoenix 4D radar</div>
              <span className={s.ghz}>76–81 GHz · 2,304 CH</span>
              <div className={s.reads}>
                <div className={s.read} data-read=""><span className={s.lab}>Range</span><b><span data-count="300">300</span> m</b></div>
                <div className={s.read} data-read=""><span className={s.lab}>Field of view</span><b>120° × 30°</b></div>
                <div className={s.read} data-read=""><span className={s.lab}>Resolution</span><b>0.7° · 0.9°</b></div>
                <div className={s.read} data-read=""><span className={s.lab}>Real time</span><b><span data-count="20">20</span> FPS</b></div>
              </div>
              <p className={s.lensHint} data-lens-hint="">Move across the road to see it the way Arbe does.</p>
            </div>
          </div>
        </section>

        {/* 02 PERCEPTION */}
        <section className={s.sec} id="perception">
          <div className={s.head}>
            <div>
              <span className={s.lab} data-rise="">(02) — From detection to perception</span>
              <h2 className={s.st} data-lines="">
                <span className={s.ln}>Radar used to say</span>
                <span className={cx("ln", "in")}>something is there.</span>
                <span className={s.ln}>Arbe shows <em>what</em>.</span>
              </h2>
            </div>
            <p className={s.note} data-rise="">2,304 virtual channels separate a cyclist from the car beside it, a person from the guardrail and debris from the road, in range, azimuth, elevation and velocity.</p>
          </div>
          <div className={s.cloud} data-cloud="">
            <canvas data-cloud-canvas="" aria-label="Point cloud: conventional radar on the left, Arbe on the right" role="img" />
            <div className={s.split} data-split-line="">
              <button className={s.knob} data-knob="" aria-label="Drag to compare">⟷</button>
            </div>
            <div className={cx("tag", "tag--l")} data-tag=""><span className={s.lab}>Conventional radar</span><b>192 channels · no elevation</b></div>
            <div className={cx("tag", "tag--r")} data-tag=""><span className={s.lab}>Arbe Phoenix</span><b>2,304 channels · true 4D</b></div>
            <div className={s.legend}><span><i className={s.pink} />People, cyclists & debris</span><span><i />Vehicles & barriers</span></div>
          </div>
          <div className={s.trio}>
            <div data-rise=""><b><span data-count="12">12</span>×</b><span className={s.lab}>More channels than competitors</span></div>
            <div data-rise=""><b>&gt;<span data-count="10">10</span>K</b><span className={s.lab}>Detections per frame</span></div>
            <div data-rise=""><b>~0</b><span className={s.lab}>False alarms</span></div>
          </div>
        </section>

        {/* 03 THE DRIVE */}
        <section className={s.drive} id="drive" data-drive="">
          <div className={s.head}>
            <div>
              <span className={s.lab} data-rise="">(03) — Ride along</span>
              <h2 className={s.st} data-lines="">
                <span className={s.ln}>One drive.</span>
                <span className={cx("ln", "in")}>Every condition.</span>
              </h2>
            </div>
            <p className={s.note} data-rise="">Five scenes, one radar. Keep scrolling to drive through a city, a highway, a crossing at night, fog and a work site.</p>
          </div>
          <div className={s.drive__pin} data-drive-pin="">
            <div className={s.shield} data-shield="">
              <div className={s.scene} data-scene="0">
                <img src={A + "city.jpg"} alt="City street with pedestrians" loading="lazy" />
                <div className={s.det} style={{ left: "5.7%", top: "37%", width: "14.3%", height: "57%" }} data-det=""><span>Pedestrian 0.98</span></div>
                <div className={s.det} style={{ left: "25%", top: "40.7%", width: "10%", height: "40.7%" }} data-det=""><span>Pedestrian 0.96</span></div>
                <div className={s.det} style={{ left: "40.7%", top: "47.7%", width: "25%", height: "37%" }} data-det=""><span>Vehicle 0.99</span></div>
              </div>
              <div className={s.scene} data-scene="1">
                <img src={A + "highway.jpg"} alt="Highway seen from above" loading="lazy" />
                <div className={s.hwfan} data-hwfan="" dangerouslySetInnerHTML={{ __html: HWFAN }} />
              </div>
              <div className={s.scene} data-scene="2">
                <img src={A + "intersection.jpg"} alt="Busy intersection at night" loading="lazy" />
                <div className={s.sweep} data-sweep2="" aria-hidden="true" />
              </div>
              <div className={s.scene} data-scene="3">
                <img src={A + "snow-road.jpg"} alt="Snowy road in poor visibility" loading="lazy" />
                <div className={s.fog} aria-hidden="true" />
                <div className={s.fogRadar} data-fog-radar="" dangerouslySetInnerHTML={{ __html: FOG }} />
                <div className={s.wipe} data-wipe=""><i>⟷</i></div>
                <span className={cx("lab", "fogL")} data-foglab="">Camera</span><span className={cx("lab", "fogR")} data-foglab="">Arbe radar</span>
              </div>
              <div className={s.scene} data-scene="4">
                <img src={A + "machinery.jpg"} alt="Mining site with heavy machinery" loading="lazy" />
                <div className={s.rings} aria-hidden="true"><i /><i /><i /></div>
              </div>

              <div className={s.rail} data-rail="">
                <i className={s.rail__track} /><i className={s.rail__fill} data-rail-fill="" />
                {SCENES.map((sc, i) => <span key={sc.stop} className={s.stop} data-stop={i}>{sc.stop}</span>)}
              </div>
              <div className={s.card} data-card="">
                <span className={s.lab} data-card-lab="">{first.lab}</span>
                <p data-card-text="">{first.text}</p>
              </div>
              <div className={s.hud} data-hud="">
                {first.hud.map(([k, v, u], i) => (
                  <div key={i} className={s.hud__cell} data-hud-cell={i} data-on={i === first.hi ? "" : undefined}>
                    <span className={s.lab} data-hud-k="">{k}</span>
                    <b><span data-hud-v="">{v}</span> <small data-hud-u="">{u}</small></b>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 04 INSIDE PHOENIX */}
        <section className={s.inside} id="inside" data-inside="">
          <div className={s.inside__pin} data-inside-pin="">
            <ol className={s.layers}>
              {[
                ["Radome & housing", "135 × 102 × 42 mm · 1 kg · automotive grade"],
                ["Antenna array", "48 transmit × 48 receive channels"],
                ["RF & processor chips", "4 TX + 2 RX chips · 1 processor · 3 Tbps"],
                ["Thermal base", "26 W · 12 V · Automotive Ethernet 1000Base-T1"],
              ].map(([t, d], i) => (
                <li key={t} data-li={i}><span className={cx("lab", "blueLab")}>0{i + 1}</span><b>{t}</b><span>{d}</span><i className={s.leader} data-leader="" /></li>
              ))}
            </ol>
            <div className={s.exploded} data-exploded="" dangerouslySetInnerHTML={{ __html: EXPLODED }} />
            <div className={s.inside__title}>
              <span className={s.lab}>(04) — Inside Phoenix</span>
              <h2 className={s.st2} data-lines=""><span className={s.ln}>2,304 channels,</span><span className={cx("ln", "blue")}>one quiet box.</span></h2>
            </div>
          </div>
        </section>

        {/* 05 PHOENIX REASSEMBLED — PERFORMANCE */}
        <section className={cx("sec", "dark", "perf")} data-dark="">
          <div className={s.perf__grid}>
            <div className={s.perf__left}>
              <span className={s.lab} data-rise="">(05) — Phoenix, reassembled</span>
              <h2 className={s.st} data-lines="">
                <span className={s.ln}>Sees 300 metres ahead.</span>
                <span className={cx("ln", "soft")}>In 4D, 20 times a second.</span>
              </h2>
              <div className={s.fan} data-fan-wrap="" dangerouslySetInnerHTML={{ __html: FAN }} />
            </div>
            <div className={s.perf__right}>
              <img className={s.phx} src={A + "phoenix.png"} alt="Arbe Phoenix 4D imaging radar unit" data-phx="" loading="lazy" />
              <div className={s.specs}>
                {[
                  ["0.7° · 0.9°", "Azimuth · elevation"], ["120° × 30°", "Field of view"], ["300 m", "Detection range"], ["20 FPS", "Real time"],
                  ["0.1 m/s", "Doppler resolution"], ["~0", "False alarms"], ["4 cm", "Range accuracy"], ["100s", "Objects per frame"],
                ].map(([v, l]) => <div key={l} data-spec=""><i className={s.hr} /><b>{v}</b><span className={s.lab}>{l}</span></div>)}
              </div>
            </div>
          </div>
        </section>

        {/* 06 AI-READY */}
        <section className={s.sec}>
          <div className={s.head}>
            <div>
              <span className={s.lab} data-rise="">(06) — AI-ready radar</span>
              <h2 className={s.st} data-lines="">
                <span className={s.ln}>Free space, mapped.</span>
                <span className={cx("ln", "in")}>Ready for <em>the AI that drives.</em></span>
              </h2>
            </div>
            <p className={s.note} data-rise="">Arbe processes radar at the sensor and hands central compute a clean, structured picture for BEV perception, occupancy mapping and sensor fusion.</p>
          </div>
          <div className={s.bev} data-bev="">
            <div className={s.bev__grid} data-grid="" dangerouslySetInnerHTML={{ __html: GRID }} />
            <div className={s.bev__legend}><span><i className={s.occ} />Occupied</span><span><i className={s.free} />Free</span><span><i className={s.unk} />Unknown</span></div>
            <div className={s.bev__pills}><span>BEV perception</span><span>Sensor fusion</span></div>
          </div>
        </section>

        {/* 07 CHIPSET */}
        <section className={cx("sec", "dark")} data-dark="">
          <div className={s.chip}>
            <div className={s.chip__left}>
              <span className={s.lab} data-rise="">(07) — Chipset</span>
              <h2 className={s.st} data-lines="">
                <span className={s.ln}>2,304 channels.</span>
                <span className={cx("ln", "in", "soft")}>One chipset.</span>
              </h2>
              <p className={cx("note", "noteDark")} data-rise="">48 transmit × 48 receive channels and a dedicated processor turn raw radar into a perception-ready point cloud, automotive-grade, low power and software-defined.</p>
              <div className={s.boards} data-boards=""><img src={A + "boards.jpg"} alt="Arbe radar chipset boards" loading="lazy" /></div>
            </div>
            <div className={s.chip__right}>
              <div className={s.matrix}><canvas data-matrix="" aria-label="48 by 48 channel grid lighting up" role="img" /></div>
              <span className={s.lab}>TX 48 × RX 48 = <b data-matrix-count="">0</b> virtual channels</span>
              <div className={s.chip__stats}>
                <div data-rise=""><i className={s.hr} /><b><span data-count="2304" data-sep="">2,304</span></b><span className={s.lab}>Virtual channels · 12× competitors</span></div>
                <div data-rise=""><i className={s.hr} /><b><span data-count="3">3</span> Tbps</b><span className={s.lab}>Equivalent processing</span></div>
                <div data-rise=""><i className={s.hr} /><b>&gt;<span data-count="10">10</span>K</b><span className={s.lab}>Detections per frame</span></div>
                <div data-rise=""><i className={s.hr} /><b>22FDX</b><span className={s.lab}>RF CMOS receiver</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* 08 EDGE CASES */}
        <section className={s.sec}>
          <div className={s.head}>
            <div>
              <span className={s.lab} data-rise="">(08) — Edge cases</span>
              <h2 className={s.st} data-lines="">
                <span className={s.ln}>Built for the moments</span>
                <span className={cx("ln", "in")}>that decide safety.</span>
              </h2>
            </div>
          </div>
          <div className={s.cases}>
            {[
              ["Lost cargo", "Low, small debris resolved at highway distance, long before a camera can see it."],
              ["Person by the guardrail", "Separates a pedestrian from the steel barrier right next to them."],
              ["Stopped vehicle", "Detects stationary hazards, even when your own car is standing still."],
              ["Motorbike beside a truck", "Weak targets stay visible next to massive reflectors."],
            ].map(([t, d], i) => (
              <article key={t} className={s.case} data-case="">
                <div className={s.case__v} dangerouslySetInnerHTML={{ __html: VIGN[i] }} />
                <span className={cx("lab", "blueLab")}>0{i + 1}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>

        {/* 09 APPLICATIONS */}
        <section className={s.sec} id="applications">
          <div className={s.head}>
            <div>
              <span className={s.lab} data-rise="">(09) — Applications</span>
              <h2 className={s.st} data-lines="">
                <span className={s.ln}>One radar.</span>
                <span className={cx("ln", "in")}>Every operating domain.</span>
              </h2>
            </div>
          </div>
          <div className={s.apps} data-apps="">
            {[
              ["01 / Automotive", "Passenger vehicles", "High-resolution separation and tracking for eyes-off driving at full highway speeds.", "city.jpg", ["Eyes-off autonomy", "2K resolution", "Free space mapping"]],
              ["02 / Automotive", "Robotaxis", "Detects static, low-profile hazards, even when the vehicle itself is stopped.", "intersection.jpg", ["Static objects", "Low-speed perception", "100–120 m mid-range"]],
              ["03 / Automotive", "Robotrucks", "Earlier detection of small, distant or partly hidden hazards at highway speed.", "highway.jpg", ["Long range", "Platooning", "All weather"]],
              ["04 / Industrial", "Heavy machinery", "Durable high-resolution perception where dust, dark and terrain defeat optics.", "machinery.jpg", ["Mining", "Construction", "All-terrain"]],
            ].map(([m, t, d, img, tags], i) => (
              <article key={t as string} className={s.app} data-app="" data-open={i === 0 ? "" : undefined} tabIndex={0}>
                <img src={A + img} alt="" loading="lazy" />
                <span className={s.lab}>{m as string}</span>
                <i className={s.app__plus} aria-hidden="true">+</i>
                <div className={s.app__body}>
                  <h3>{t as string}</h3>
                  <p>{d as string}</p>
                  <div className={s.app__tags}>{(tags as string[]).map((x) => <span key={x}>{x}</span>)}</div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 10 RECOGNITION */}
        <section className={s.recog} id="recognition" data-recog="">
          <div className={s.head}>
            <div>
              <span className={s.lab} data-rise="">(10) — Recognition</span>
              <h2 className={s.st} data-lines=""><span className={s.ln}>A decade of firsts.</span></h2>
            </div>
            <p className={s.note} data-rise="">Nasdaq-listed, and recognised as a groundbreaking company disrupting the automotive market.</p>
          </div>
          <div className={s.timeline} data-timeline="">
            <i className={s.timeline__line} /><i className={s.timeline__fill} data-tl-fill="" />
            <div className={s.track} data-track="">
              {[
                ["2016", "Disrupt TLV", "Contest winner"], ["2019", "Red Herring", "Top 100 Europe"], ["2020", "Cool Vendor", "Winner"],
                ["2021", "ADAS & Autonomous", "Product of the Year"], ["2022", "Sensor Perception", "Category winner"], ["2023", "CES Innovation Awards", "Honoree"],
                ["2023", "Self-Driving Industry Award", "Winner"], ["2025", "Just Auto Excellence Award", "Sensor Technology Solution of the Year"],
              ].map(([y, a, b], i) => (
                <div key={i} className={s.ev} data-ev=""><i /><b>{y}</b><strong>{a}</strong><span>{b}</span></div>
              ))}
            </div>
          </div>
        </section>

        {/* 11 CTA */}
        <section className={s.ctaSec} id="contact">
          <div className={s.marquee} aria-hidden="true"><div data-marquee="">
            {[0, 1].map((k) => (
              <span key={k}>Sensor Technology Solution of the Year 2025 <i /> Just Auto Excellence Award 2025 <i /> Self-Driving Industry Award 2023 <i /> CES Innovation Awards Honoree 2023 <i /> ADAS &amp; Autonomous Product of the Year 2021 <i /> </span>
            ))}
          </div></div>
          <div className={s.cta} data-cta="">
            <div className={s.cta__rings} aria-hidden="true"><i /><i /><i /><i /><i /></div>
            <span className={cx("lab", "labLight")}>(11) — Partner with Arbe</span>
            <h2 className={s.cta__h} data-lines=""><span className={s.ln}>Put eyes-off</span><span className={s.ln}>on the road.</span></h2>
            <p>Arbe works with leading OEMs, Tier 1 suppliers and system integrators across the United States, Europe and Asia.</p>
            <div className={s.btns}>
              <a href="https://arberobotics.com/contact-us/" className={cx("pill", "pill--white", "pill--icon")} data-magnetic="">Talk to Arbe <Arrow /></a>
              <a href="https://arberobotics.com/surveyreport/" className={cx("pill", "pill--line")}>Download the driver survey</a>
            </div>
            <div className={s.ticker}><span className={cx("lab", "labLight")}>Nasdaq</span><b>ARBE</b></div>
          </div>
        </section>

        {/* 12 FOOTER */}
        <footer className={s.foot}>
          <div className={s.foot__top}>
            {[
              ["Technology", ["Chipset", "Phoenix radar", "AI-ready radar", "Eyes-off"]],
              ["Applications", ["Automotive", "Heavy machinery", "All-terrain & industrial", "Counter-drone"]],
              ["Company", ["About", "Careers", "News", "Events"]],
              ["Connect", ["Contact us", "LinkedIn", "Podcast", "Media kit"]],
            ].map(([h, items]) => (
              <div key={h as string}><span className={s.lab}>{h as string}</span><ul>{(items as string[]).map((x) => <li key={x}>{x}</li>)}</ul></div>
            ))}
            <div className={s.news}>
              <p>Stay up-to-date with Arbe.</p>
              <div className={s.news__field}><span>Your work email</span><i>→</i></div>
            </div>
          </div>
          <svg className={s.wordmark} viewBox="0 0 95 38" data-wordmark="" aria-label="Arbe">
            <g transform="translate(-100 -32)">{LOGO_PATHS.map((d) => <path key={d.slice(0, 12)} d={d} />)}</g>
          </svg>
          <div className={s.foot__bottom}><span className={s.lab}>© Arbe 2026</span><span className={s.lab}>Unsolicited concept by David Adebayo — not affiliated with Arbe</span></div>
        </footer>
      </main>

      <ConceptBadge company="Arbe" className={s.badge} />
    </div>
  );
}
