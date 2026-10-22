import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger, SplitText);

export function initEcolitMotion(root: HTMLElement, s: Record<string, string>): () => void {
  /* ---- class-name helpers ---- */
  const q = (sel: string) =>
    sel.replace(/\.([a-zA-Z][\w-]*)/g, (_m, n) => (s[n] ? "." + s[n] : _m));
  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) =>
    r.querySelector<T>(q(sel))!;
  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) =>
    [...r.querySelectorAll<T>(q(sel))];
  const k = (n: string) => s[n] ?? n;

  const splits: SplitText[] = [];
  const listeners: Array<[EventTarget, string, EventListener]> = [];
  const on = (el: EventTarget, ev: string, fn: EventListener) => {
    el.addEventListener(ev, fn);
    listeners.push([el, ev, fn]);
  };
  const timers: ReturnType<typeof setTimeout>[] = [];
  const created: Element[] = []; // pins, partner cards and leader lines built at runtime

  /* ---- Map data ---- */
  const MAP = {
    w: 1360,
    h: 603,
    step: 9,
    rle: "0151|051.11.01.15.01.113.027.11.051|044.13.02.15.06.110.021.11.07.17.06.13.036|041.11.01.14.02.11.01.15.05.18.021.11.03.117.01.16.033|024.11.03.27.111.01.13.01.11.01.11.01.12.03.16.014.17.01.11.01.137.024|026.21.01.26.117.01.14.04.13.06.12.08.13.01.146.022|025.27.115.05.11.07.13.014.14.01.143.01.13.022|025.22.05.21.113.05.13.01.11.021.14.02.21.136.03.11.02.11.024|024.21.08.114.04.15.018.21.03.11.01.11.01.23.135.06.12.023|033.115.01.18.015.22.01.21.02.15.21.112.25.121.05.11.023|032.116.01.17.018.22.01.119.26.114.22.16.04.11.022|032.120.04.11.018.15.22.110.214.19.25.15.026|032.214.15.21.11.022.118.01.213.110.25.12.01.11.025|032.214.13.23.11.022.15.01.15.01.11.01.13.02.215.16.27.12.027|031.215.11.23.022.15.02.12.01.14.04.13.02.216.14.27.11.03.11.024|030.218.024.14.05.11.01.11.02.18.01.13.223.12.028|030.218.024.13.06.11.01.11.01.19.01.15.21.12.216.03.11.04.11.023|030.217.026.11.02.14.06.11.02.115.217.02.11.03.11.023|030.216.027.16.010.116.216.04.11.025|031.11.213.027.18.21.02.21.05.117.216.03.11.025|032.13.29.028.17.26.122.215.029|032.14.22.05.21.027.18.26.19.01.114.23.11.210.028|031.11.01.14.06.21.026.19.26.14.01.15.03.116.29.028|031.11.01.14.033.110.25.14.01.16.01.21.04.112.29.11.027|033.14.05.12.025.113.24.14.01.16.21.11.04.112.22.11.24.01.11.027|033.14.02.12.03.11.024.115.22.14.01.18.06.15.02.16.01.21.031|033.14.02.11.06.12.021.122.01.17.06.15.03.12.21.12.01.21.031|035.15.029.122.02.15.07.14.05.11.23.11.05.11.026|038.13.028.123.01.14.09.12.07.11.22.12.04.11.026|039.12.028.126.011.12.08.21.13.05.11.025|040.11.028.124.013.12.010.12.05.11.025|040.11.04.15.020.14.22.120.011.11.043|043.18.019.14.22.120.011.12.07.21.09.12.023|044.16.22.019.13.22.120.021.21.033|044.17.21.12.018.11.05.117.020.21.01.11.05.12.026|043.18.21.13.025.115.021.21.11.04.11.21.027|043.112.024.115.022.22.03.11.24.02.21.022|042.113.024.114.024.21.03.23.02.21.03.21.020|043.115.022.112.025.22.02.23.01.21.04.21.01.22.017|042.118.020.112.026.21.012.23.12.015|042.119.020.111.027.21.013.21.12.01.11.01.11.011|043.118.020.111.029.22.09.22.11.016|043.118.020.111.034.21.09.11.04.11.09|044.116.021.111.059|044.116.021.111.03.11.033.22.02.21.017|045.115.020.112.03.11.030.25.02.22.08.11.07|046.114.020.111.02.13.030.26.01.22.016|047.113.021.19.03.12.030.210.016|047.112.022.19.03.12.027.213.06.11.09|048.111.022.19.03.12.026.215.015|048.19.024.18.04.11.026.216.015|048.18.025.17.032.216.015|048.19.025.16.032.215.016|048.18.026.15.033.215.016|048.18.027.14.033.24.03.27.017|048.15.01.11.028.11.035.22.07.25.018|048.16.074.24.019|048.16.074.22.010.12.09|049.14.098|049.14.075.21.08.11.013|049.13.083.11.015|049.13.099|050.12.047.11.051|050.12.099|051.12.098|0151|0151",
  };
  const PINS: [string, string, string, number, number, number, number][] = [
    ["Mark Farrelly", "United Kingdom", "partner-mark-farrelly.jpg", 679.6, 94.6, 520, 0],
    ["Nikita Shumeiko", "New Jersey, USA", "partner-nikita-shumeiko.jpg", 434.6, 141.5, 240, 30],
    ["Paul Stephenson", "Kingston, Jamaica", "partner-paul-stephenson.jpg", 400.9, 243.9, 160, 200],
    ["Jamaal Marcano", "Guyana", "partner-jamaal-marcano.jpg", 464.2, 299.4, 260, 360],
    ["Nii Kojo Biney", "Ghana", "partner-nii-kojo-biney.jpg", 679.3, 305.4, 580, 360],
    ["Siril George", "Dubai, UAE", "partner-siril-george.jpg", 876.3, 209.3, 796, 120],
    ["Tanaphak Krabat", "Thailand", "partner-tanaphak-krabat.jpg", 1049, 264.9, 1090, 200],
    ["Chris Rayson", "Australia", "partner-chris-rayson.jpg", 1196.6, 498, 940, 520],
  ];
  const ASSET = "/concepts/ecolit/";

  // Build dots from RLE
  type Dot = { x: number; y: number; eco: boolean; a: number; g: number; r: number };
  const dots: Dot[] = [];
  MAP.rle.split("|").forEach((row, ri) => {
    let col = 0;
    row.split(".").forEach((tok) => {
      const ch = tok[0];
      const n = +tok.slice(1);
      for (let kk = 0; kk < n; kk++) {
        if (ch !== "0")
          dots.push({ x: MAP.step / 2 + col * MAP.step, y: MAP.step / 2 + ri * MAP.step, eco: ch === "2", a: 0, g: 0, r: Math.random() });
        col++;
      }
    });
  });

  const mapEl = $<HTMLDivElement>("[data-map]");
  const cv = $<HTMLCanvasElement>("[data-map-canvas]");
  const ctx2 = cv.getContext("2d")!;

  const drawMap = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    const W = mapEl.clientWidth;
    const H = mapEl.clientHeight;
    if (cv.width !== W * dpr) {
      cv.width = W * dpr;
      cv.height = H * dpr;
    }
    const sc = W / MAP.w;
    ctx2.setTransform(dpr * sc, 0, 0, dpr * sc, 0, 0);
    ctx2.clearRect(0, 0, MAP.w, MAP.h);
    for (const d of dots) {
      if (d.a <= 0) continue;
      ctx2.beginPath();
      if (d.eco && d.g > 0) {
        ctx2.fillStyle = `rgba(0,203,20,${d.a})`;
        ctx2.arc(d.x, d.y, 1.7 + 0.9 * d.g, 0, 6.283);
      } else {
        ctx2.fillStyle = `rgba(15,18,16,${0.22 * d.a})`;
        ctx2.arc(d.x, d.y, 1.7, 0, 6.283);
      }
      ctx2.fill();
    }
  };

  // Pins, cards, leaders
  const lead = $<SVGSVGElement>("[data-leaders]");
  PINS.forEach(([n, loc, img, px, py, cx2, cy]) => {
    const pin = document.createElement("i");
    pin.className = k("pin");
    pin.dataset.pin = "";
    pin.style.left = (px / MAP.w) * 100 + "%";
    pin.style.top = (py / MAP.h) * 100 + "%";
    mapEl.appendChild(pin);
    created.push(pin);

    const card = document.createElement("div");
    card.className = k("mate");
    card.dataset.mate = "";
    card.style.left = (cx2 / MAP.w) * 100 + "%";
    card.style.top = (cy / MAP.h) * 100 + "%";
    card.innerHTML = `<img src="${ASSET + img}" alt="${n}"><div><b>${n}</b><small>${loc}</small></div>`;
    mapEl.appendChild(card);
    created.push(card);

    const ln = document.createElementNS("http://www.w3.org/2000/svg", "line") as SVGLineElement;
    ln.setAttribute("x1", String(px));
    ln.setAttribute("y1", String(py));
    ln.setAttribute("x2", String(cx2 + 100));
    ln.setAttribute("y2", String(cy + 26));
    lead.appendChild(ln);
    created.push(ln);

    on(card, "mouseenter", () => {
      pin.classList.remove(k("is-pulse"));
      void pin.offsetWidth;
      pin.classList.add(k("is-pulse"));
    });
  });

  on(window, "resize", drawMap as EventListener);

  /* ---- reduced motion ---- */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    dots.forEach((d) => { d.a = 1; d.g = 1; });
    drawMap();
    $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count!));
    return () => {
      listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
      created.forEach((el) => el.remove());
    };
  }

  drawMap();
  $$("[data-count]").forEach((el) => (el.textContent = "0"));

  /* ---- Lenis + ScrollTrigger ticker ---- */
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = (t: number) => lenis.raf(t * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    const EASE = "expo.out";

    /* ---- 00 Smooth scroll (Lenis → anchors) ---- */
    $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
      on(a, "click", (e: Event) => {
        const id = a.getAttribute("href");
        if (!id || id.length < 2) return;
        const t = root.querySelector<HTMLElement>(id);
        if (!t) return;
        e.preventDefault();
        lenis.scrollTo(t, { offset: -90, duration: 1.4 });
      })
    );

    /* ---- 00 Scroll progress hairline ---- */
    gsap.to(q(".progress"), { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

    /* ---- 00 Nav hide/show ---- */
    const nav = $("[data-nav]");
    ScrollTrigger.create({
      start: "top -80",
      end: "max",
      onUpdate(self) {
        gsap.to(nav, { yPercent: self.direction === 1 && self.scroll() > 600 ? -120 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      },
    });

    /* ---- 00 Magnetic buttons ---- */
    $$("[data-magnetic]").forEach((el) => {
      const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      on(el, "pointermove", (e: Event) => {
        const pe = e as PointerEvent;
        const r = el.getBoundingClientRect();
        xTo((pe.clientX - r.left - r.width / 2) * 0.25);
        yTo((pe.clientY - r.top - r.height / 2) * 0.3);
      });
      on(el, "pointerleave", () => { xTo(0); yTo(0); });
    });

    /* ---- 00 Count-up helper ---- */
    const countUp = (el: HTMLElement | null, dur = 1.4) => {
      if (!el) return;
      const o = { v: 0 };
      return gsap.to(o, { v: +(el.dataset.count || 0), duration: dur, ease: "power3.out", onUpdate: () => (el.textContent = Math.round(o.v).toString()) });
    };

    /* ---- helper: prepare stroke-draw on paths ---- */
    const prepDraw = (paths: Element[]) =>
      paths.forEach((p) => {
        const pe = p as SVGPathElement;
        const L = pe.getTotalLength();
        pe.style.strokeDasharray = String(L);
        pe.style.strokeDashoffset = String(L);
      });

    /* ---- Statements: staggered lines rise (masked) ---- */
    const statement = (el: Element, opts: gsap.TweenVars = {}) => {
      const sp = SplitText.create($$(".ln", el), { type: "lines", mask: "lines" });
      splits.push(sp);
      return gsap.from(sp.lines, { yPercent: 110, duration: 1.2, stagger: 0.1, ease: EASE, ...opts });
    };

    /* ---- 01 Load — the frame draws itself, layer by layer ---- */
    const heroIso = $<SVGSVGElement>('[data-iso="hero"]');
    const layers = ["slab", "gf", "floor", "ff", "roof"].map((k2) => heroIso.querySelector<SVGPathElement>(`[data-layer="${k2}"]`)!);
    prepDraw([...layers, heroIso.querySelector<SVGPathElement>('[data-layer="dims"]')!]);
    gsap.set(heroIso.querySelectorAll("text"), { opacity: 0 });
    gsap.set("[data-neon]", { scale: 0 });
    gsap.set("[data-person]", { y: 60, opacity: 0 });
    gsap.set("[data-cap]", { opacity: 0, x: 10 });
    gsap.set("[data-rule]", { scaleX: 0 });

    const intro = gsap.timeline({ delay: 0.2 });
    intro
      .from(q("[data-nav] > *"), { y: -20, opacity: 0, duration: 1, stagger: 0.06, ease: EASE })
      .to("[data-rule]", { scaleX: 1, duration: 1.4, ease: "expo.inOut", stagger: 0.2 }, 0.1)
      .add(statement($(".hero [data-statement]")), 0.3);

    layers.forEach((p, i) =>
      intro.to(p, { strokeDashoffset: 0, duration: i === 3 ? 1.1 : 0.9, ease: "power2.inOut" }, 0.6 + i * 0.38)
    );
    intro
      .to(heroIso.querySelector<SVGPathElement>('[data-layer="dims"]')!, { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }, 2.4)
      .to(heroIso.querySelectorAll("text"), { opacity: 1, duration: 0.6 }, 2.8)
      .to("[data-neon]", { scale: 1, duration: 0.7, ease: "back.out(1.8)" }, 2.5)
      .to("[data-cap]", { opacity: 1, x: 0, duration: 0.8, ease: EASE }, 2.7)
      .to("[data-person]", { y: 0, opacity: 1, duration: 1, ease: EASE }, 2.6)
      .from(q(".hero__stat, .hero__foot .note"), { y: 20, opacity: 0, stagger: 0.07, duration: 0.9, ease: EASE }, 2.2)
      .add(() => $$<HTMLElement>(".hero [data-count]").forEach((el) => countUp(el, 1.6)), 2.3);

    /* ---- 02 Hero depth — pointer parallax ---- */
    const hero = $('[data-section="hero"]');
    const isoX = gsap.quickTo(heroIso, "x", { duration: 1.2, ease: "power3.out" });
    const isoY = gsap.quickTo(heroIso, "y", { duration: 1.2, ease: "power3.out" });
    const pX = gsap.quickTo("[data-person]", "x", { duration: 1.2, ease: "power3.out" });
    on(hero, "pointermove", (e: Event) => {
      const pe = e as PointerEvent;
      const nx = pe.clientX / innerWidth - 0.5;
      const ny = pe.clientY / innerHeight - 0.5;
      isoX(nx * 18);
      isoY(ny * 12);
      pX(-nx * 30);
    });
    gsap.to(heroIso, { yPercent: 10, ease: "none", scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 1 } });

    /* ---- 03 Drawing → reality (pinned) ---- */
    const rIso = $<SVGSVGElement>('[data-iso="reality"]');
    const rPaths = $$("path", rIso);
    mm.add("(min-width: 761px)", () => {
      prepDraw(rPaths);
      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-reality]", start: "top top+=40", end: "+=140%", pin: true, scrub: 1, anticipatePin: 1 } });
      tl.to(rPaths, { strokeDashoffset: 0, duration: 0.35, stagger: 0.04, ease: "none" }, 0)
        .to("[data-reality-photo]", { clipPath: "circle(120% at 68% 52%)", duration: 0.5, ease: "power2.inOut" }, 0.3)
        .to(rPaths, { stroke: "#ffffff", opacity: 0.4, duration: 0.2 }, 0.45)
        .from($$("[data-reality-statement] .ln"), { yPercent: 60, opacity: 0, stagger: 0.05, duration: 0.2 }, 0.62)
        .from("[data-machine]", { y: 40, opacity: 0, duration: 0.15 }, 0.65);
      $$("[data-tick]").forEach((t, i) =>
        tl
          .add(() => t.classList.add(k("is-done")), 0.75 + i * 0.06)
          .add(() => {}, 0.75 + i * 0.06)
      );
      tl.to({}, { duration: 0.15 });
    });
    mm.add("(max-width: 760px)", () => {
      // Mobile: no pin — the drawing draws as the stage scrolls in, then the aperture opens into the photo.
      prepDraw(rPaths);
      gsap.set("[data-reality-photo]", { clipPath: "circle(0% at 50% 30%)" });
      const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-reality]", start: "top 85%", end: "bottom 75%", scrub: 1 } });
      tl.to(rPaths, { strokeDashoffset: 0, duration: 0.4, stagger: 0.03, ease: "none" }, 0)
        .to("[data-reality-photo]", { clipPath: "circle(130% at 50% 30%)", duration: 0.4, ease: "power2.inOut" }, 0.38)
        .to(rPaths, { stroke: "#ffffff", opacity: 0.4, duration: 0.15 }, 0.5)
        .from($$("[data-reality-statement] .ln"), { yPercent: 60, opacity: 0, stagger: 0.04, duration: 0.15 }, 0.62)
        .from("[data-machine]", { y: 30, opacity: 0, duration: 0.12 }, 0.7)
        .to("[data-tick]", { opacity: 1, stagger: 0.05, duration: 0.05 }, 0.8);
    });

    /* ---- Section statements + notes ---- */
    $$(".sec [data-statement]").forEach((el) => statement(el, { scrollTrigger: { trigger: el, start: "top 85%" } }));
    $$("[data-note]").forEach((el) =>
      gsap.from(el, { y: 20, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: el, start: "top 88%" } })
    );

    /* ---- 04 Network map ---- */
    const mates = $$("[data-mate]");
    const pins = $$<HTMLElement>("[data-pin]");
    const leaders = $$<SVGLineElement>("line", lead);
    gsap.set(mates, { opacity: 0, scale: 0.9, y: 10 });
    gsap.set(pins, { scale: 0 });
    leaders.forEach((l) => {
      const L = Math.hypot(l.x2.baseVal.value - l.x1.baseVal.value, l.y2.baseVal.value - l.y1.baseVal.value);
      l.style.strokeDasharray = String(L);
      l.style.strokeDashoffset = String(L);
    });
    const mtl = gsap.timeline({ scrollTrigger: { trigger: mapEl, start: "top 75%" }, onUpdate: drawMap });
    mtl.to(dots, { a: 1, duration: 0.6, ease: "power2.out", stagger: { each: 0.0004, from: "start" } }, 0);
    mtl.to(dots.filter((d) => d.eco), { g: 1, duration: 0.5, ease: "back.out(2)", stagger: { each: 0.0015, from: "random" } }, 0.6);
    mtl
      .to(pins, {
        scale: 1, duration: 0.5, ease: "back.out(2)", stagger: 0.06,
        onComplete() {
          pins.forEach((p, i) => {
            const t = setTimeout(() => p.classList.add(k("is-pulse")), i * 120);
            timers.push(t);
          });
        },
      }, 1.4)
      .to(leaders, { strokeDashoffset: 0, duration: 0.6, stagger: 0.06, ease: "power2.out" }, 1.6)
      .to(mates, { opacity: 1, scale: 1, y: 0, duration: 0.7, stagger: 0.06, ease: "back.out(1.6)" }, 1.7);

    /* ---- 05 Partner portal: device rises, demo runs ---- */
    const segMove = (seg: HTMLElement, idx: number) => {
      const opts = $$<HTMLSpanElement>("span", seg);
      const pill = $<HTMLElement>("i", seg);
      const t = opts[idx];
      opts.forEach((o, i) => o.classList.toggle(k("is-on"), i === idx));
      gsap.to(pill, { x: t.offsetLeft - 4, width: t.offsetWidth, duration: 0.5, ease: "power3.out" });
    };
    $$<HTMLElement>("[data-seg]").forEach((seg) => {
      const o = $$<HTMLSpanElement>("span", seg)[0];
      gsap.set($<HTMLElement>("i", seg), { width: o.offsetWidth });
      o.classList.add(k("is-on"));
    });
    const pIso = $<SVGSVGElement>('[data-iso="preview"]');
    const pPaths = $$("path", pIso);
    prepDraw(pPaths);
    gsap.from("[data-device]", { y: 120, rotateX: 10, opacity: 0, transformPerspective: 1600, duration: 1.4, ease: EASE, scrollTrigger: { trigger: "[data-device]", start: "top 85%" } });
    const areaEl = $<HTMLElement>("[data-area]");
    const A = { v: 60 };
    const ptl = gsap.timeline({ scrollTrigger: { trigger: "[data-device]", start: "top 60%", end: "bottom 70%", scrub: 1 } });
    ptl
      .add(() => segMove($<HTMLElement>('[data-seg="storeys"]'), 1), 0.05)
      .add(() => segMove($<HTMLElement>('[data-seg="storeys"]'), 0), 0.04)
      .to(pPaths, { strokeDashoffset: 0, duration: 0.4, stagger: 0.03 }, 0.05)
      .add(() => segMove($<HTMLElement>('[data-seg="seismic"]'), 2), 0.3)
      .add(() => segMove($<HTMLElement>('[data-seg="seismic"]'), 0), 0.29)
      .fromTo("[data-slider] i", { width: "10%" }, { width: "45%", duration: 0.2 }, 0.35)
      .fromTo("[data-slider] b", { left: "10%" }, { left: "45%", duration: 0.2 }, 0.35)
      .to(A, { v: 96, duration: 0.2, onUpdate: () => (areaEl.textContent = Math.round(A.v) + " m²") }, 0.35)
      .to("[data-kit] i", { scale: 1, duration: 0.06, stagger: 0.05, ease: "back.out(2)" }, 0.55)
      .from("[data-toast]", { y: 30, opacity: 0, duration: 0.12 }, 0.88);

    /* ---- 06 Profile draws ---- */
    const prof = $<SVGSVGElement>("[data-profile] svg");
    const pr = $$<SVGPathElement>("path", prof);
    prepDraw(pr);
    gsap.set(prof.querySelectorAll("text"), { opacity: 0 });
    gsap.timeline({ scrollTrigger: { trigger: prof, start: "top 70%" } })
      .to(pr[0], { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" })
      .to(pr[1], { strokeDashoffset: 0, duration: 0.8, ease: "power2.out" }, "-=0.3")
      .to(pr[2], { strokeDashoffset: 0, duration: 0.6 }, "-=0.4")
      .to(prof.querySelectorAll("text"), { opacity: 1, duration: 0.5 }, "-=0.2");
    $$("[data-specs] .row").forEach((r) =>
      gsap.timeline({ scrollTrigger: { trigger: r, start: "top 90%" } })
        .from($(".hr", r), { scaleX: 0, duration: 1, ease: "expo.inOut" })
        .from($$(".lab, p", r), { y: 14, opacity: 0, stagger: 0.06, duration: 0.7, ease: EASE }, "-=0.6")
    );

    /* ---- 07 Energy: 280 counts down to 15 ---- */
    const big = $<HTMLElement>("[data-big15]");
    const E = { v: 280 };
    gsap.timeline({ scrollTrigger: { trigger: big, start: "top 75%" } })
      .fromTo(E, { v: 280 }, { v: 15, duration: 2, ease: "power3.inOut", onUpdate: () => (big.textContent = Math.round(E.v).toString()) })
      .fromTo(big, { color: "#0F1210" }, { color: "#00CB14", duration: 0.6 }, 1.5);
    gsap.set(q(".bar__line i"), { scaleX: 0 });
    const btl = gsap.timeline({ scrollTrigger: { trigger: "[data-chart]", start: "top 75%" } });
    $$<HTMLElement>("[data-bar]").forEach((b, i) =>
      btl
        .to($(".bar__line i", b), { scaleX: 1, duration: 1, ease: "power3.out" }, i * 0.15)
        .add(() => countUp($<HTMLElement>("[data-count]", b), 1), i * 0.15)
    );

    /* ---- 08 Approvals ---- */
    const docs = $$<HTMLElement>("[data-doc]");
    docs.forEach((d) => { d.style.left = d.dataset.x!; d.style.top = d.dataset.y!; });
    mm.add("(min-width: 1101px)", () => {
      gsap.fromTo(
        docs,
        { x: (_i: number, el: HTMLElement) => el.parentElement!.clientWidth * 0.36 - el.offsetLeft, y: (i: number, el: HTMLElement) => 120 - el.offsetTop + i * 4, rotate: (i: number) => (i - 3) * 3, filter: "blur(0px)" },
        { x: 0, y: 0, rotate: (_i: number, el: HTMLElement) => +el.dataset.r!, filter: (_i: number, el: HTMLElement) => `blur(${el.dataset.blur}px)`, ease: "power2.inOut", scrollTrigger: { trigger: "[data-docs]", start: "top 85%", end: "center 50%", scrub: 1, invalidateOnRefresh: true } }
      );
    });
    mm.add("(min-width: 761px) and (max-width: 1100px)", () =>
      docs.forEach((d) => gsap.set(d, { rotate: +d.dataset.r!, filter: `blur(${d.dataset.blur}px)` }))
    );
    mm.add("(max-width: 760px)", () => {
      // Mobile: a fanned deck. Cards start stacked in the centre and spread as you scroll.
      const FAN = [[0, 6, -8], [11, 1, -4], [22, 7, -1], [34, 2, 3], [45, 8, 6], [56, 3, 9]]; // left %, top %, rotate
      docs.forEach((d, i) => { d.style.left = FAN[i][0] + "%"; d.style.top = FAN[i][1] + "%"; });
      gsap.fromTo(
        docs,
        { x: (_i: number, el: HTMLElement) => el.parentElement!.clientWidth * 0.28 - el.offsetLeft, y: (i: number) => 14 - i * 2, rotate: (i: number) => (i - 2.5) * 1.5, filter: "blur(0px)" },
        { x: 0, y: 0, rotate: (i: number) => FAN[i][2], filter: "blur(0px)", ease: "power2.inOut", stagger: 0.04, scrollTrigger: { trigger: "[data-docs]", start: "top 85%", end: "bottom 60%", scrub: 1, invalidateOnRefresh: true } }
      );
      return () => docs.forEach((d) => { d.style.left = d.dataset.x!; d.style.top = d.dataset.y!; });
    });
    $$("[data-list] .row").forEach((r) =>
      gsap.from(r, { y: 16, opacity: 0, duration: 0.8, ease: EASE, scrollTrigger: { trigger: r, start: "top 92%" } })
    );

    /* ---- 09 Partnership ---- */
    gsap.fromTo("[data-pship-img]", { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: "[data-pship-photo]", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from("[data-pship-photo]", { clipPath: "inset(12% 0% 0% 0% round 8px)", duration: 1.4, ease: "expo.inOut", scrollTrigger: { trigger: "[data-pship-photo]", start: "top 80%" } });
    gsap.from("[data-pship-card]", { x: -40, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: "[data-pship-photo]", start: "top 45%" } });
    $$("[data-s4]").forEach((r) =>
      gsap.timeline({ scrollTrigger: { trigger: r, start: "top 90%" } })
        .from($(".hr", r), { scaleX: 0, duration: 1, ease: "expo.inOut" })
        .from($$(".num, h4, p", r), { y: 16, opacity: 0, stagger: 0.06, duration: 0.7, ease: EASE }, "-=0.6")
    );
    const ctaSplit = SplitText.create("[data-ctabar-text]", { type: "words,chars" });
    splits.push(ctaSplit);
    gsap.timeline({ scrollTrigger: { trigger: "[data-ctabar]", start: "top 88%" } })
      .from("[data-ctabar]", { clipPath: "inset(0 100% 0 0 round 8px)", duration: 1.3, ease: "expo.inOut" })
      .from("[data-faces] img", { x: -20, opacity: 0, stagger: 0.05, duration: 0.6, ease: EASE }, 0.6)
      .from(
        ctaSplit.chars,
        { yPercent: 100, opacity: 0, stagger: 0.015, duration: 0.6, ease: EASE },
        0.7
      )
      .from("[data-ctabar-arrow]", { scale: 0, rotate: -90, duration: 0.8, ease: "back.out(1.8)" }, 0.9);

    // CTA bar pointer trail on arrow
    (() => {
      const bar = $<HTMLElement>("[data-ctabar]");
      const arr = $<HTMLElement>("[data-ctabar-arrow]");
      const ax = gsap.quickTo(arr, "x", { duration: 0.8, ease: "power3.out" });
      const ay = gsap.quickTo(arr, "y", { duration: 0.8, ease: "power3.out" });
      on(bar, "pointermove", (e: Event) => {
        const pe = e as PointerEvent;
        const r = arr.getBoundingClientRect();
        ax((pe.clientX - r.left - r.width / 2) * 0.18);
        ay((pe.clientY - r.top - r.height / 2) * 0.18);
      });
      on(bar, "pointerleave", () => { ax(0); ay(0); });
    })();

    /* ---- 10 Footer: construction lines draw, then wordmark fills in ---- */
    gsap.timeline({ scrollTrigger: { trigger: "[data-mark]", start: "top 80%" } })
      .from(q("[data-c].c--v"), { scaleY: 0, duration: 1, ease: "expo.inOut", stagger: 0.1 })
      .from(q("[data-c].c--h"), { scaleX: 0, duration: 1.2, ease: "expo.inOut", stagger: 0.1 }, 0.2)
      .from("[data-mark-img]", { clipPath: "inset(0 100% 0 0)", duration: 1.4, ease: "expo.inOut" }, 0.6)
      .from(q("[data-mark] .num"), { opacity: 0, duration: 0.6 }, 0.8);

    /* ---- Badge ---- */
    gsap.from("[data-badge]", { y: 80, opacity: 0, duration: 1, ease: EASE, delay: 3 });
  }, root);

  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);
  let refreshT: ReturnType<typeof setTimeout> | undefined;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 150); };
  $$<HTMLImageElement>("img").forEach((img) => { if (!img.complete) on(img, "load", queueRefresh); });

  return () => {
    listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
    window.removeEventListener("load", onLoad);
    timers.forEach((t) => clearTimeout(t));
    clearTimeout(refreshT);
    splits.forEach((sp) => sp.revert());
    mm.revert();
    ctx.revert();
    gsap.ticker.remove(raf);
    lenis.destroy();
    created.forEach((el) => el.remove());
  };
}
