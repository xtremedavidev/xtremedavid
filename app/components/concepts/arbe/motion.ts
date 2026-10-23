import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { buildCloud, drawCloud, type Pt } from "./pointcloud";

gsap.registerPlugin(ScrollTrigger, SplitText);

type HudRow = [string, string, string];
export const SCENES: { stop: string; lab: string; text: string; hud: HudRow[]; hi: number }[] = [
  { stop: "City", lab: "Scene 01 / 05 · City", text: "Picks the people out of the crowd, even beside a moving car.", hi: 2,
    hud: [["Speed", "32", "km/h"], ["Objects", "128", ""], ["Closest person", "6.4", "m"], ["Condition", "Clear", ""]] },
  { stop: "Highway", lab: "Scene 02 / 05 · Highway", text: "Lost cargo, 300 m out, at full highway speed.", hi: 1,
    hud: [["Speed", "130", "km/h"], ["Range", "300", "m"], ["Frame rate", "20", "FPS"], ["False alarms", "~0", ""]] },
  { stop: "Intersection", lab: "Scene 03 / 05 · Intersection", text: "Every person on the crossing, tracked at night.", hi: 1,
    hud: [["Speed", "18", "km/h"], ["Pedestrians", "47", ""], ["Cyclists", "6", ""], ["Condition", "Night", ""]] },
  { stop: "Fog & snow", lab: "Scene 04 / 05 · Fog & snow", text: "The camera fades out. The radar sees the same picture.", hi: 2,
    hud: [["Speed", "88", "km/h"], ["Camera", "18", "%"], ["Radar detections", "100", "%"], ["Condition", "Fog", "−4°C"]] },
  { stop: "Work site", lab: "Scene 05 / 05 · Work site", text: "Dust, dark and uneven ground. Still sees every machine.", hi: 1,
    hud: [["Speed", "24", "km/h"], ["Machines", "5", ""], ["Range", "300", "m"], ["Condition", "Dust", ""]] },
];

export function initArbeMotion(root: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(sel)!;
  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(sel)];
  const splits: SplitText[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  const listeners: Array<[EventTarget, string, EventListener]> = [];
  const on = (el: EventTarget, ev: string, fn: EventListener, opts?: AddEventListenerOptions) => { el.addEventListener(ev, fn, opts); listeners.push([el, ev, fn]); };
  const tickers: Array<() => void> = [];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fmt = (el: HTMLElement, v: number) => (el.dataset.sep !== undefined ? Math.round(v).toLocaleString("en-US") : String(Math.round(v)));
  const DPR = () => Math.min(2, window.devicePixelRatio || 1);
  const sizeCanvas = (c: HTMLCanvasElement) => { const r = c.getBoundingClientRect(); const d = DPR(); c.width = Math.max(1, Math.round(r.width * d)); c.height = Math.max(1, Math.round(r.height * d)); const ctx = c.getContext("2d")!; ctx.setTransform(d, 0, 0, d, 0, 0); return { ctx, w: r.width, h: r.height }; };

  /* ---------- canvases that also render in reduced motion ---------- */
  // 02 comparison point cloud
  const cloudBox = $("[data-cloud]"), cloudCv = $<HTMLCanvasElement>("[data-cloud-canvas]"), splitLine = $("[data-split-line]");
  const cloud = { t: reduce ? 1 : 0, split: 0.5, ctx: null as CanvasRenderingContext2D | null, w: 0, h: 0, pts: [] as Pt[] };
  const drawC = () => { if (!cloud.ctx) return; drawCloud(cloud.ctx, cloud.pts, cloud.w, cloud.h, cloud.t, cloud.split * cloud.w); splitLine.style.left = cloud.split * 100 + "%"; };
  const sizeC = () => { const s = sizeCanvas(cloudCv); Object.assign(cloud, s); cloud.pts = buildCloud(s.w, s.h); drawC(); };

  // 07 48×48 matrix
  const mCv = $<HTMLCanvasElement>("[data-matrix]"), mCount = $("[data-matrix-count]");
  const order: number[] = []; const shade: number[] = [];
  { let sd = 3; const r = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); const keys: [number, number][] = [];
    for (let i = 0; i < 2304; i++) { const row = Math.floor(i / 48), col = i % 48; keys.push([row + col + r() * 6, i]); shade.push(0.55 + r() * 0.45); }
    keys.sort((a, b) => a[0] - b[0]).forEach(([, i]) => order.push(i)); }
  const mat = { p: reduce ? 1 : 0, ctx: null as CanvasRenderingContext2D | null, w: 0 };
  const drawM = () => { const c = mat.ctx; if (!c) return; const w = mat.w, cell = w / 48, lit = Math.round(mat.p * 2304); c.clearRect(0, 0, w, w);
    const on = new Uint8Array(2304); for (let k = 0; k < lit; k++) on[order[k]] = 1;
    for (let i = 0; i < 2304; i++) { const x = (i % 48) * cell + cell / 2, y = Math.floor(i / 48) * cell + cell / 2; c.globalAlpha = on[i] ? shade[i] : 0.14; c.fillStyle = on[i] && shade[i] > 0.97 ? "#FFFFFF" : "#5C82FF"; c.beginPath(); c.arc(x, y, on[i] ? cell * 0.2 : cell * 0.14, 0, 6.283); c.fill(); }
    c.globalAlpha = 1; mCount.textContent = lit.toLocaleString("en-US"); };
  const sizeM = () => { const s = sizeCanvas(mCv); mat.ctx = s.ctx; mat.w = s.w; drawM(); };

  // 01 hero radar lens
  const stage = $("[data-stage]"), lensCv = $<HTMLCanvasElement>("[data-lens-canvas]"), ring = $("[data-lens-ring]");
  const lens = { x: 0, y: 0, R: 150, ctx: null as CanvasRenderingContext2D | null, w: 0, h: 0, pts: [] as Pt[], dirty: true, live: true };
  const drawL = () => { const c = lens.ctx; if (!c) return; const { x, y, R, w, h } = lens; c.clearRect(0, 0, w, h); c.save(); c.beginPath(); c.arc(x, y, R, 0, 6.283); c.clip();
    c.fillStyle = "rgba(5,11,46,.92)"; c.fillRect(x - R, y - R, R * 2, R * 2);
    const sub = lens.pts.filter((p) => Math.abs(p.dx - x) < R + 4 && Math.abs(p.dy - y) < R + 4); drawCloud(c, sub, w, h, 1, null, 1, false); c.restore();
    gsap.set(ring, { x, y }); };
  const sizeL = () => { const s = sizeCanvas(lensCv); lens.ctx = s.ctx; lens.w = s.w; lens.h = s.h; lens.R = s.w < 700 ? 100 : 150; lens.pts = buildCloud(s.w, s.h * 1.15).map((p) => ({ ...p, dy: p.dy - s.h * 0.08, py: p.py - s.h * 0.08 })); if (!lens.x) { lens.x = s.w * 0.52; lens.y = s.h * 0.42; } drawL(); };

  const sizeAll = () => { sizeC(); sizeM(); sizeL(); };
  sizeAll();
  let rT: ReturnType<typeof setTimeout> | undefined;
  on(window, "resize", () => { clearTimeout(rT); rT = setTimeout(sizeAll, 120); });

  // knob drag (works in reduced motion too)
  let dragging = false;
  const setSplit = (clientX: number) => { const r = cloudBox.getBoundingClientRect(); cloud.split = Math.min(0.95, Math.max(0.05, (clientX - r.left) / r.width)); drawC(); };
  on($("[data-knob]"), "pointerdown", (e) => { dragging = true; (e.target as Element).setPointerCapture?.((e as PointerEvent).pointerId); });
  on(window, "pointermove", (e) => { if (dragging) setSplit((e as PointerEvent).clientX); });
  on(window, "pointerup", () => { dragging = false; });
  on(cloudBox, "click", (e) => { if (!(e.target as Element).closest("[data-knob]")) setSplit((e as MouseEvent).clientX); });

  // applications accordion
  const apps = $$("[data-app]");
  const openApp = (a: HTMLElement) => apps.forEach((x) => x.toggleAttribute("data-open", x === a));
  apps.forEach((a) => { on(a, "mouseenter", () => { if (window.matchMedia("(hover: hover)").matches) openApp(a); }); on(a, "click", () => openApp(a)); on(a, "focus", () => openApp(a)); });

  if (reduce) {
    $$("[data-count]").forEach((el) => (el.textContent = fmt(el, +el.dataset.count!)));
    const ex = $$<SVGGElement>("[data-exploded] [data-layer]"); const off: Record<string, number> = { radome: -200, antenna: -70, chips: 50, base: 170 };
    ex.forEach((g) => gsap.set(g, { y: off[g.dataset.layer!] }));
    $$("[data-li]").forEach((li) => li.setAttribute("data-on", ""));
    $$("[data-ev]").forEach((e) => e.setAttribute("data-on", ""));
    return () => { listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn)); clearTimeout(rT); };
  }

  $$("[data-count]").forEach((el) => (el.textContent = "0"));
  const countUp = (el: HTMLElement, dur = 1.4) => { const o = { v: 0 }; return gsap.to(o, { v: +el.dataset.count!, duration: dur, ease: "power3.out", onUpdate: () => { el.textContent = fmt(el, o.v); } }); };

  /* ---------- Lenis ---------- */
  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  const raf = (t: number) => lenis.raf(t * 1000);
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  const mm = gsap.matchMedia();
  const ctx = gsap.context(() => {
    const EASE = "expo.out";
    const nav = $("[data-nav]");

    $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => on(a, "click", (e) => { const id = a.getAttribute("href"); if (!id || id.length < 2) return; const t = root.querySelector<HTMLElement>(id); if (!t) return; e.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 1.6 }); }));
    gsap.to("[data-progress]", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });
    ScrollTrigger.create({ start: "top -80", end: "max", onUpdate(self) { gsap.to(nav, { yPercent: self.direction === 1 && self.scroll() > 700 ? -130 : 0, duration: 0.6, ease: "power3.out", overwrite: "auto" }); } });
    // nav goes light-on-dark over dark chapters
    const darkActive = new Set<Element>();
    [...$$("[data-dark]"), $("[data-drive-pin]")].forEach((sec) => ScrollTrigger.create({ trigger: sec, start: "top 70", end: "bottom 70", onToggle(self) { if (self.isActive) darkActive.add(sec); else darkActive.delete(sec); nav.toggleAttribute("data-dark", darkActive.size > 0); } }));
    $$("[data-magnetic]").forEach((el) => { const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }), yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
      on(el, "pointermove", (e) => { const r = el.getBoundingClientRect(), p = e as PointerEvent; xTo((p.clientX - r.left - r.width / 2) * 0.25); yTo((p.clientY - r.top - r.height / 2) * 0.3); });
      on(el, "pointerleave", () => { xTo(0); yTo(0); }); });

    // line reveals: each child span of [data-lines] is a line block
    const lines = (el: Element, vars: gsap.TweenVars) => { const sp = SplitText.create([...el.children] as HTMLElement[], { type: "lines", mask: "lines" }); splits.push(sp); return gsap.from(sp.lines, { yPercent: 110, duration: 1.2, stagger: 0.08, ease: EASE, ...vars }); };
    const heroLines = $("[data-hero] [data-lines]");
    $$("[data-lines]").forEach((el) => { if (el !== heroLines) lines(el, { scrollTrigger: { trigger: el, start: "top 85%" } }); });
    $$("[data-rise]").forEach((el) => { if (el.closest("[data-hero]")) return; gsap.from(el, { y: 24, opacity: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: el, start: "top 90%" } }); });
    $$("[data-count]").forEach((el) => { if (el.closest("[data-stage]")) return; ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => countUp(el) }); });

    /* ---------- 01 HERO ---------- */
    const media = $("[data-stage-media]");
    gsap.set(media, { clipPath: "polygon(50% 100%, 50% 100%, 50% 100%, 50% 100%, 50% 100%)" });
    gsap.set(["[data-br]", "[data-read]", ring, lensCv, "[data-lens-hint]"], { opacity: 0 });
    const intro = gsap.timeline({ delay: 0.15 });
    intro.from(nav.children, { y: -20, opacity: 0, duration: 1, stagger: 0.06, ease: EASE })
      .add(lines(heroLines, { duration: 1.4, stagger: 0.12 }), 0.15)
      .from("[data-hero] [data-rise]", { y: 24, opacity: 0, duration: 1, stagger: 0.08, ease: EASE }, 0.5)
      .to(media, { clipPath: "polygon(0% 28%, 50% 0%, 100% 28%, 50% 100%, 50% 100%)", duration: 0.9, ease: "power3.in" }, 0.55)
      .to(media, { clipPath: "polygon(0% 0%, 50% 0%, 100% 0%, 100% 100%, 0% 100%)", duration: 1.1, ease: "expo.out" }, 1.45)
      .to("[data-br]", { opacity: 1, duration: 0.6, stagger: 0.08 }, 2.1)
      .from("[data-br]", { scale: 1.6, duration: 0.8, stagger: 0.08, ease: EASE }, 2.1)
      .to("[data-read]", { opacity: 1, duration: 0.6, stagger: 0.08 }, 2.2)
      .from("[data-read]", { y: 20, duration: 0.9, stagger: 0.08, ease: EASE }, 2.2)
      .add(() => $$("[data-stage] [data-count]").forEach((el) => countUp(el, 1.6)), 2.3)
      .to([lensCv, ring, "[data-lens-hint]"], { opacity: 1, duration: 0.8 }, 2.6)
      .from(ring, { scale: 0.3, duration: 1, ease: "back.out(1.6)" }, 2.6);
    // lens follows the pointer, drifts when idle
    const tgt = { x: lens.x, y: lens.y }; let idleT = 0; let lastMove = 0; let stageOn = true;
    const lx = gsap.quickTo(lens, "x", { duration: 0.7, ease: "power3.out", onUpdate: () => { lens.dirty = true; } });
    const ly = gsap.quickTo(lens, "y", { duration: 0.7, ease: "power3.out", onUpdate: () => { lens.dirty = true; } });
    on(stage, "pointermove", (e) => { const r = stage.getBoundingClientRect(), p = e as PointerEvent; tgt.x = p.clientX - r.left; tgt.y = p.clientY - r.top; lastMove = performance.now(); lx(tgt.x); ly(tgt.y); });
    const tick = () => { if (!stageOn) return; const now = performance.now(); if (now - lastMove > 2200) { idleT += 0.006; lx(lens.w * (0.5 + 0.28 * Math.sin(idleT * 1.3))); ly(lens.h * (0.42 + 0.1 * Math.sin(idleT * 2.1))); } if (lens.dirty) { lens.dirty = false; drawL(); } };
    gsap.ticker.add(tick); tickers.push(() => gsap.ticker.remove(tick));
    ScrollTrigger.create({ trigger: stage, start: "top bottom", end: "bottom top", onToggle: (s) => { stageOn = s.isActive; } });
    gsap.to("[data-video]", { yPercent: 8, scale: 1.06, ease: "none", scrollTrigger: { trigger: stage, start: "top 40%", end: "bottom top", scrub: true } });

    /* ---------- 02 POINT CLOUD ---------- */
    gsap.timeline({ scrollTrigger: { trigger: cloudBox, start: "top 85%", end: "center 45%", scrub: 1 } })
      .fromTo(cloud, { t: 0, split: 0.92 }, { t: 1, split: 0.5, ease: "power2.inOut", onUpdate: drawC });
    gsap.from("[data-cloud] [data-tag]", { y: 16, opacity: 0, stagger: 0.1, duration: 0.8, ease: EASE, scrollTrigger: { trigger: cloudBox, start: "top 70%" } });

    /* ---------- 03 THE DRIVE (pinned) ---------- */
    const scenes = $$("[data-scene]"), stops = $$("[data-stop]"), cells = $$("[data-hud-cell]");
    const cardLab = $("[data-card-lab]"), cardText = $("[data-card-text]"), card = $("[data-card]");
    let cur = 0;
    const setScene = (i: number) => {
      if (i === cur) return; const prev = SCENES[cur]; cur = i; const sc = SCENES[i];
      stops.forEach((s, k) => s.toggleAttribute("data-on", k <= i));
      gsap.timeline().to(card, { y: -12, opacity: 0, duration: 0.25, ease: "power2.in" }).add(() => { cardLab.textContent = sc.lab; cardText.textContent = sc.text; }).to(card, { y: 0, opacity: 1, duration: 0.5, ease: EASE });
      cells.forEach((c, k) => { c.toggleAttribute("data-on", k === sc.hi); const [kk, v, u] = sc.hud[k]; $("[data-hud-k]", c).textContent = kk; $("[data-hud-u]", c).textContent = u;
        const vEl = $("[data-hud-v]", c); const from = parseFloat(prev.hud[k][1]), to = parseFloat(v);
        if (!isNaN(from) && !isNaN(to) && /^[\d.]+$/.test(v)) { const dec = v.includes(".") ? 1 : 0; const o = { v: from }; gsap.to(o, { v: to, duration: 0.8, ease: "power2.out", onUpdate: () => { vEl.textContent = o.v.toFixed(dec); } }); }
        else { gsap.fromTo(vEl, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4 }); vEl.textContent = v; } });
    };
    stops[0].setAttribute("data-on", "");
    const U = 4.8;
    const dtl = gsap.timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: "[data-drive-pin]", start: "top top", end: () => "+=" + window.innerHeight * U * 0.85, pin: true, scrub: 1, anticipatePin: 1,
      onUpdate: (self) => setScene(Math.min(4, Math.max(0, Math.floor(self.progress * U + 0.15)))) } });
    dtl.to("[data-rail-fill]", { scaleY: 1, duration: U }, 0)
      .from("[data-scene='0'] [data-det]", { opacity: 0, scale: 0.7, stagger: 0.08, duration: 0.3, transformOrigin: "50% 50%" }, 0.05)
      .from("[data-scene='0'] img", { scale: 1.08, duration: 1 }, 0);
    for (let i = 1; i < 5; i++) {
      dtl.to(scenes[i], { opacity: 1, duration: 0.3 }, i - 0.2).fromTo($("img", scenes[i]), { scale: 1.12 }, { scale: 1, duration: 1.2 }, i - 0.2);
    }
    const hwRings = $$<SVGPathElement>("[data-hwfan] path[stroke]");
    hwRings.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = String(L); p.style.strokeDashoffset = String(L); });
    dtl.from("[data-hwfan] svg", { opacity: 0, scaleY: 0.2, transformOrigin: "50% 100%", duration: 0.4 }, 0.9).to(hwRings, { strokeDashoffset: 0, stagger: 0.08, duration: 0.3 }, 1.0);
    dtl.to("[data-wipe]", { left: "50%", duration: 0.6, ease: "power2.inOut" }, 3.15).to("[data-fog-radar]", { clipPath: "inset(0 0 0 50%)", duration: 0.6, ease: "power2.inOut" }, 3.15)
      .to("[data-foglab]", { opacity: 1, duration: 0.2 }, 3.5);
    dtl.to({}, { duration: 0.2 }, U - 0.2);

    /* ---------- 04 INSIDE PHOENIX ---------- */
    const layers = $$<SVGGElement>("[data-exploded] [data-layer]"), lis = $$("[data-li]"), leaders = $$("[data-leader]");
    const OFF: Record<string, [number, number]> = { radome: [-26, -200], antenna: [-10, -70], chips: [0, 50], base: [10, 170] };
    const seq = ["radome", "antenna", "chips", "base"];
    mm.add("(min-width: 761px)", () => {
      layers.forEach((g) => gsap.set(g, { y: OFF[g.dataset.layer!][0] }));
      const itl = gsap.timeline({ scrollTrigger: { trigger: "[data-inside-pin]", start: "top top", end: "+=220%", pin: true, scrub: 1, anticipatePin: 1,
        onUpdate: (self) => { const a = Math.min(3, Math.floor(self.progress * 4.6 - 0.3)); lis.forEach((li, i) => li.toggleAttribute("data-on", i <= a)); } } });
      itl.from("[data-exploded] svg", { scale: 0.9, rotate: -4, transformOrigin: "50% 50%", duration: 0.6, ease: "power2.out" }, 0)
        .from("[data-axis]", { opacity: 0, duration: 0.3 }, 0.3);
      seq.forEach((k, i) => { const g = layers.find((x) => x.dataset.layer === k)!; itl.to(g, { y: OFF[k][1], duration: 0.8, ease: "power2.inOut" }, 0.4 + i * 0.7).fromTo(leaders[i], { scaleX: 0 }, { scaleX: 1, duration: 0.4 }, 0.8 + i * 0.7); });
      itl.to("[data-core]", { fill: "#5C82FF", duration: 0.3, yoyo: true, repeat: 3 }, 2.2).to({}, { duration: 0.6 });
      return () => lis.forEach((li) => li.removeAttribute("data-on"));
    });
    mm.add("(max-width: 760px)", () => { layers.forEach((g) => gsap.set(g, { y: OFF[g.dataset.layer!][1] * 0.8 })); });

    /* ---------- 05 PERFORMANCE ---------- */
    const rings = $$<SVGPathElement>("[data-fan-wrap] [data-ring]");
    rings.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = String(L); p.style.strokeDashoffset = String(L); });
    gsap.timeline({ scrollTrigger: { trigger: "[data-fan-wrap]", start: "top 75%" } })
      .from("[data-fan-wrap] [data-fan]", { opacity: 0, scale: 0.3, transformOrigin: "600px 700px", duration: 1.4, ease: EASE })
      .from("[data-fan-wrap] [data-spoke]", { opacity: 0, duration: 0.6, stagger: 0.03 }, 0.2)
      .to(rings, { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: "power2.out" }, 0.3)
      .from("[data-fan-wrap] [data-ringlabel]", { opacity: 0, duration: 0.6, stagger: 0.1 }, 0.9)
      .from("[data-fan-wrap] [data-blip]", { opacity: 0, scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: 0.08, ease: "back.out(2)" }, 1);
    gsap.fromTo("[data-sweep]", { rotation: -50, svgOrigin: "600 700" }, { rotation: 50, svgOrigin: "600 700", duration: 3.2, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.fromTo("[data-ping]", { scale: 0.6, opacity: 0.8, transformOrigin: "50% 50%" }, { scale: 2.2, opacity: 0, duration: 1.8, repeat: -1, stagger: { each: 0.35, repeat: -1 }, ease: "power2.out" });
    gsap.from("[data-phx]", { y: 80, opacity: 0, rotate: -6, duration: 1.6, ease: EASE, scrollTrigger: { trigger: "[data-phx]", start: "top 85%" } });
    gsap.to("[data-phx]", { y: -14, duration: 3, ease: "sine.inOut", yoyo: true, repeat: -1 });
    gsap.from("[data-spec]", { y: 24, opacity: 0, duration: 0.9, stagger: 0.06, ease: EASE, scrollTrigger: { trigger: "[data-spec]", start: "top 85%" } });

    /* ---------- 06 BEV GRID ---------- */
    const gcells = $$<SVGRectElement>("[data-grid] [data-cell]");
    gsap.set(gcells, { opacity: 0 });
    ScrollTrigger.create({ trigger: "[data-bev]", start: "top 70%", once: true, onEnter: () => {
      gsap.to(gcells, { opacity: 1, duration: 0.5, ease: "power2.out", delay: (i: number, el: SVGRectElement) => +el.dataset.cell! / 700 });
      gsap.fromTo("[data-grid] [data-occ]", { fillOpacity: 0.3 }, { fillOpacity: 1, duration: 0.8, repeat: -1, yoyo: true, delay: 1.4, ease: "sine.inOut", stagger: { each: 0.02, from: "random" } });
    } });

    /* ---------- 07 CHIPSET ---------- */
    gsap.to(mat, { p: 1, ease: "none", onUpdate: drawM, scrollTrigger: { trigger: mCv, start: "top 80%", end: "bottom 45%", scrub: 0.6 } });
    gsap.from("[data-boards]", { clipPath: "inset(100% 0 0 0 round 20px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: "[data-boards]", start: "top 80%" } });
    gsap.from("[data-boards] img", { scale: 1.2, duration: 1.8, ease: EASE, scrollTrigger: { trigger: "[data-boards]", start: "top 80%" } });

    /* ---------- 08 EDGE CASES ---------- */
    const cases = $$("[data-case]");
    gsap.from(cases, { y: 60, opacity: 0, duration: 1.1, stagger: 0.1, ease: EASE, scrollTrigger: { trigger: cases[0], start: "top 85%" } });
    cases.forEach((c, i) => { const box = $<SVGRectElement>("[data-box]", c); const L = box.getTotalLength(); box.style.strokeDasharray = String(L); box.style.strokeDashoffset = String(L);
      gsap.timeline({ scrollTrigger: { trigger: c, start: "top 80%" }, delay: 0.3 + i * 0.12 })
        .from($$("[data-pt]", c), { opacity: 0, scale: 0, transformOrigin: "50% 50%", duration: 0.5, stagger: { each: 0.004, from: "random" } })
        .to(box, { strokeDashoffset: 0, duration: 0.8, ease: "power2.inOut" }, 0.3);
      on(c, "mouseenter", () => gsap.fromTo(box, { strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.7, ease: "power2.inOut" })); });

    /* ---------- 09 APPLICATIONS ---------- */
    gsap.from(apps, { y: 60, opacity: 0, duration: 1.1, stagger: 0.08, ease: EASE, scrollTrigger: { trigger: "[data-apps]", start: "top 85%" } });

    /* ---------- 10 RECOGNITION ---------- */
    const track = $("[data-track]"), evs = $$("[data-ev]");
    const lightEvs = () => { const lim = window.innerWidth * 0.62; evs.forEach((e) => e.toggleAttribute("data-on", e.getBoundingClientRect().left < lim)); };
    mm.add("(min-width: 761px)", () => {
      gsap.timeline({ scrollTrigger: { trigger: "[data-recog]", start: "top top", end: () => "+=" + Math.max(400, track.scrollWidth - window.innerWidth + 200), pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true, onUpdate: lightEvs } })
        .to(track, { x: () => -Math.max(0, track.scrollWidth - window.innerWidth + 160), ease: "none" }, 0)
        .to("[data-tl-fill]", { scaleX: 1, ease: "none" }, 0);
    });
    mm.add("(max-width: 760px)", () => { gsap.set("[data-tl-fill]", { scaleX: 1 }); evs.forEach((e) => e.setAttribute("data-on", "")); });

    /* ---------- 11 CTA ---------- */
    gsap.to("[data-marquee]", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    gsap.from("[data-cta]", { clipPath: "inset(14% 6% 14% 6% round 28px)", duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: "[data-cta]", start: "top 85%" } });

    /* ---------- 12 FOOTER WORDMARK ---------- */
    const wm = $$<SVGPathElement>("[data-wordmark] path");
    wm.forEach((p) => { const L = p.getTotalLength(); p.style.strokeDasharray = String(L); p.style.strokeDashoffset = String(L); p.style.fillOpacity = "0"; });
    gsap.timeline({ scrollTrigger: { trigger: "[data-wordmark]", start: "top 85%" } })
      .to(wm, { strokeDashoffset: 0, duration: 1.8, stagger: 0.15, ease: "power2.inOut" })
      .to(wm, { fillOpacity: 1, duration: 0.8, stagger: 0.1 }, "-=0.6");

    gsap.from("[data-badge]", { y: 80, opacity: 0, duration: 1, ease: EASE, delay: 3 });
  }, root);

  // late images change layout: refresh triggers when they land
  const onLoad = () => ScrollTrigger.refresh();
  window.addEventListener("load", onLoad);
  let refreshT: ReturnType<typeof setTimeout> | undefined;
  const queueRefresh = () => { clearTimeout(refreshT); refreshT = setTimeout(() => ScrollTrigger.refresh(), 150); };
  $$<HTMLImageElement>("img").forEach((img) => { if (!img.complete) on(img, "load", queueRefresh); });

  return () => {
    listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
    window.removeEventListener("load", onLoad);
    timers.forEach((t) => clearTimeout(t));
    clearTimeout(refreshT); clearTimeout(rT);
    tickers.forEach((f) => f());
    splits.forEach((sp) => sp.revert());
    mm.revert();
    ctx.revert();
    gsap.ticker.remove(raf);
    lenis.destroy();
  };
}
