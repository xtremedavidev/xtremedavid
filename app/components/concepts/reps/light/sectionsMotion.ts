import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { createScene } from "../scene";
import { A } from "../data";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** Motion for the lower half of Option B (film → footer). Returns a cleanup. */
export function initRepsLightSections(root: HTMLElement, { reduce, mobile }: { reduce: boolean; mobile: boolean }): () => void {
  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(sel);
  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(sel)];
  const offs: Array<() => void> = [];
  const on = (el: EventTarget | null, ev: string, fn: EventListener) => { if (!el) return; el.addEventListener(ev, fn); offs.push(() => el.removeEventListener(ev, fn)); };
  const splits: SplitText[] = [];

  /* ── film: the frame opens from a card to full-bleed, the words part ── */
  const frame = $("[data-film-frame]"), video = $<HTMLVideoElement>("[data-film-video]"), cursor = $("[data-film-cursor]");
  if (frame) {
    const from = getComputedStyle(frame).clipPath || "inset(29% 33% 29% 33% round 28px)";
    const tl = gsap.timeline({ scrollTrigger: { trigger: "[data-filmsec]", start: "top top", end: "bottom bottom", scrub: reduce ? false : 0.6 } });
    tl.fromTo(frame, { clipPath: from }, { clipPath: "inset(0% 0% 0% 0% round 32px)", ease: "none", duration: 1 }, 0)
      .fromTo(video, { scale: 1.25 }, { scale: 1, ease: "none", duration: 1 }, 0)
      .to("[data-film-l]", { xPercent: -60, autoAlpha: 0, ease: "power1.in", duration: 0.7 }, 0)
      .to("[data-film-r]", { xPercent: 60, autoAlpha: 0, ease: "power1.in", duration: 0.7 }, 0);
    // the preview plays muted only while it can be seen
    ScrollTrigger.create({ trigger: "[data-filmsec]", start: "top bottom", end: "bottom top", onToggle: (self) => { if (!video) return; if (self.isActive) video.play().catch(() => {}); else video.pause(); } });
    if (!mobile && cursor) {
      const xTo = gsap.quickTo(cursor, "left", { duration: 0.5, ease: "power3.out" }), yTo = gsap.quickTo(cursor, "top", { duration: 0.5, ease: "power3.out" });
      on(frame, "pointermove", ((e: PointerEvent) => { const r = frame.getBoundingClientRect(); xTo(e.clientX - r.left); yTo(e.clientY - r.top); }) as EventListener);
    }
  }

  /* ── impact: the gate lane simulation ── */
  const gate = $("[data-gate]");
  let gateRaf = 0, gateOn = false;
  if (gate) {
    const NS = "http://www.w3.org/2000/svg";
    const layer = $("[data-gate-trucks-layer]", gate)!, pulsesLayer = $("[data-gate-pulses]", gate)!;
    const glow = $("[data-gate-glow]", gate)!, cells = $$("[data-gate-cell]", gate), lamps = $$("[data-gate-lamp]", gate), screen = $("[data-gate-screen]", gate)!;
    const rotor = $$("[data-gate-rotor]", gate);
    const trucksEl = $("[data-gate-trucks]", gate), kwhEl = $("[data-gate-kwh]", gate);
    const paths = ["#gate-p1", "#gate-p2", "#gate-p3"].map((id) => gate.querySelector<SVGPathElement>(id)!);
    const mkTruck = (dir: 1 | -1) => {
      const g = document.createElementNS(NS, "g");
      g.innerHTML = dir === 1
        ? `<rect x="-92" y="-12" width="70" height="24" rx="3" fill="#fff" stroke="#C9CDC5"/><rect x="-92" y="-12" width="70" height="3" fill="#8DD270"/><rect x="-20" y="-11" width="20" height="22" rx="4" fill="#111311"/><rect x="-96" y="-10" width="3" height="5" rx="1" fill="#E5484D" data-brake/><rect x="-96" y="5" width="3" height="5" rx="1" fill="#E5484D" data-brake/>`
        : `<rect x="22" y="-12" width="70" height="24" rx="3" fill="#fff" stroke="#C9CDC5"/><rect x="0" y="-11" width="20" height="22" rx="4" fill="#111311"/>`;
      layer.appendChild(g); return g;
    };
    type T = { g: SVGGElement; x: number; v: number; dir: 1 | -1; y: number; hit: boolean };
    const trucks: T[] = [];
    let spawnIn = 0, spawnOut = 1.4, count = 0, kwh = 0, level = 0.25, outGlow = 0, spin = 0, plateGlow = 0;
    type P = { el: SVGCircleElement; seg: number; d: number };
    const pulses: P[] = [];
    const firePulse = () => { const c = document.createElementNS(NS, "circle"); c.setAttribute("r", "6"); c.setAttribute("fill", "#8DD270"); c.setAttribute("stroke", "#fff"); c.setAttribute("stroke-width", "2"); pulsesLayer.appendChild(c); pulses.push({ el: c, seg: 0, d: 0 }); };
    let last = performance.now();
    const step = (now: number) => {
      gateRaf = requestAnimationFrame(step);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      spawnIn -= dt; spawnOut -= dt;
      if (spawnIn <= 0) { trucks.push({ g: mkTruck(1), x: -20, v: 150, dir: 1, y: 320, hit: false }); spawnIn = 2.6 + Math.random() * 1.6; }
      if (spawnOut <= 0) { trucks.push({ g: mkTruck(-1), x: 860, v: 170, dir: -1, y: 260, hit: false }); spawnOut = 3.4 + Math.random() * 2; }
      for (let i = trucks.length - 1; i >= 0; i--) {
        const t = trucks[i];
        if (t.dir === 1) {
          // brakes into the plate, rolls slowly across it, accelerates away through the gate
          const nose = t.x;
          const target = nose > 250 && nose < 470 ? 52 : 150;
          t.v += (target - t.v) * Math.min(1, dt * 2.2);
          t.x += t.v * dt;
          const braking = t.v < 120 && nose < 470;
          t.g.querySelectorAll("[data-brake]").forEach((b) => b.setAttribute("opacity", braking ? "1" : ".25"));
          // every axle over the plate fires the triggers
          const over = nose - 46 > 300 && nose - 46 < 420;
          if (over) { plateGlow = Math.min(1, plateGlow + dt * 3); if (Math.random() < dt * 5) firePulse(); }
          if (nose > 420 && !t.hit) { t.hit = true; count++; kwh += 0.42; if (trucksEl) trucksEl.textContent = String(count); if (kwhEl) kwhEl.textContent = kwh.toFixed(1); }
        } else t.x -= t.v * dt;
        t.g.setAttribute("transform", `translate(${t.x.toFixed(1)} ${t.y})`);
        if (t.x > 960 || t.x < -140) { t.g.remove(); trucks.splice(i, 1); }
      }
      plateGlow = Math.max(0, plateGlow - dt * 1.2);
      glow.setAttribute("opacity", (plateGlow * 0.55).toFixed(3));
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i], path = paths[p.seg], len = path.getTotalLength();
        p.d += dt * (p.seg === 0 ? 70 : 150);
        if (p.d >= len) {
          if (p.seg === 0) spin = Math.min(1, spin + 0.25);
          if (p.seg === 1) level = Math.min(1, level + 0.03);
          if (p.seg === 2) outGlow = 1;
          p.seg++; p.d = 0;
          if (p.seg > 2) { p.el.remove(); pulses.splice(i, 1); continue; }
        }
        const pt = paths[p.seg].getPointAtLength(p.d);
        p.el.setAttribute("cx", pt.x.toFixed(1)); p.el.setAttribute("cy", pt.y.toFixed(1));
      }
      spin = Math.max(0, spin - dt * 0.25);
      rotor.forEach((r) => { const a = (now / 1000) * (60 + spin * 600); r.setAttribute("transform", `rotate(${a % 360} 360 447)`); });
      level = Math.max(0.2, level - dt * 0.01);
      cells.forEach((c, i) => { const h = Math.max(2, Math.min(34, (level * 1.2 - i * 0.08) * 34)); c.setAttribute("height", h.toFixed(1)); c.setAttribute("y", (464 - h).toFixed(1)); });
      outGlow = Math.max(0, outGlow - dt * 0.6);
      lamps.forEach((l, i) => l.setAttribute("fill", outGlow > 0.1 + i * 0.15 ? "#F2C94C" : "#D3D7CF"));
      screen.setAttribute("fill", outGlow > 0.05 ? "#8DD270" : "#EEF0EB");
    };
    const start = () => { if (gateOn || reduce) return; gateOn = true; last = performance.now(); gateRaf = requestAnimationFrame(step); };
    const stop = () => { gateOn = false; cancelAnimationFrame(gateRaf); };
    ScrollTrigger.create({ trigger: gate, start: "top bottom", end: "bottom top", onToggle: (self) => (self.isActive ? start() : stop()) });
    offs.push(stop);
  }

  /* ── reel: drag to scroll on desktop ── */
  const reel = $("[data-reel]");
  if (reel && !mobile) {
    let down = false, sx = 0, sl = 0;
    on(reel, "pointerdown", ((e: PointerEvent) => { down = true; sx = e.clientX; sl = reel.scrollLeft; reel.style.scrollSnapType = "none"; }) as EventListener);
    on(window, "pointerup", () => { if (!down) return; down = false; reel.style.scrollSnapType = ""; });
    on(window, "pointermove", ((e: PointerEvent) => { if (down) reel.scrollLeft = sl - (e.clientX - sx); }) as EventListener);
    gsap.from($$("[data-reel-item]", reel), { x: 80, autoAlpha: 0, stagger: 0.08, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: reel, start: "top 88%" } });
  }

  /* ── at a glance: gauge, design life ── */
  const gauge = $<SVGPathElement>("[data-gauge]");
  if (gauge) {
    const L = gauge.getTotalLength();
    gsap.set(gauge, { strokeDasharray: L, strokeDashoffset: L });
    gsap.to(gauge, { strokeDashoffset: L * 0.1, duration: 2, ease: "power3.out", scrollTrigger: { trigger: gauge, start: "top 88%" } });
  }
  gsap.to("[data-life]", { scaleX: 1, duration: 2, ease: "power2.inOut", scrollTrigger: { trigger: "[data-life]", start: "top 90%" } });
  gsap.from("[data-land-plate]", { attr: { y: 10 }, duration: 1.2, ease: "bounce.out", scrollTrigger: { trigger: "[data-land-plate]", start: "top 90%" } });

  /* ── beliefs: the manifesto inks in word by word, the team photo opens up ── */
  const man = $("[data-manifesto]");
  if (man) {
    const sp = new SplitText(man, { type: "words" }); splits.push(sp);
    gsap.fromTo(sp.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.05, ease: "none", scrollTrigger: { trigger: man, start: "top 78%", end: "bottom 42%", scrub: true } });
  }
  if (!mobile) gsap.fromTo("[data-team-stage]", { clipPath: "inset(10% 22% 10% 22% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 32px)", ease: "none", scrollTrigger: { trigger: "[data-team-stage]", start: "top 90%", end: "center 55%", scrub: true } });
  gsap.fromTo("[data-team-img]", { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: "[data-team-stage]", start: "top bottom", end: "bottom top", scrub: true } });

  /* ── press: the funding number ── */
  gsap.from("[data-fund]", { yPercent: 30, autoAlpha: 0, duration: 1.4, ease: "expo.out", scrollTrigger: { trigger: "[data-fund]", start: "top 88%" } });

  /* ── cta: the plates fly out of the road and spell REPS behind the form ── */
  const ctaCanvas = $<HTMLCanvasElement>("[data-gl-cta]");
  let cta: ReturnType<typeof createScene> | null = null;
  ScrollTrigger.create({
    trigger: "[data-cta]", start: "top 220%", once: true,
    onEnter: () => {
      if (!ctaCanvas) return;
      try {
        cta = createScene(ctaCanvas, {
          theme: "light", mapUrl: `${A}map-grid-1.webp`, logoUrl: `${A}logo.svg`, truck: false, quality: mobile ? 0.55 : 1, progress: 0.78,
          finale: mobile ? { p: [0, 92, 86], t: [0, 0, -6], fov: 36 } : { p: [22, 120, 100], t: [22, 0, -16], fov: 36 },
        });
        cta.jump(0.78);
      } catch { root.setAttribute("data-nogl", ""); }
    },
  });
  ScrollTrigger.create({
    trigger: "[data-cta]", start: "top bottom", end: mobile ? "top 10%" : "top 20%",
    onUpdate: (self) => cta?.setProgress(0.78 + self.progress * 0.22),
  });
  ScrollTrigger.create({ trigger: "[data-cta]", start: "top bottom", end: "bottom top", onToggle: (self) => cta?.setVisible(self.isActive) });
  const onResize = () => cta?.resize();
  on(window, "resize", onResize);

  /* ── footer: the wordmark writes itself ── */
  const fmark = $("[data-fmark]");
  const strokes = fmark ? $$<SVGGeometryElement>("path, rect", fmark).filter((el) => !el.closest("mask")) : [];
  let write: gsap.core.Timeline | null = null;
  if (fmark && strokes.length) {
    strokes.sort((p, q) => p.getBBox().x - q.getBBox().x);
    strokes.forEach((el) => { const len = el.getTotalLength(); gsap.set(el, { attr: { stroke: "#5DBB3A", "stroke-width": 4, "stroke-linejoin": "round", "stroke-linecap": "round" }, strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 }); });
    write = gsap.timeline({ paused: true });
    write.to(strokes, { strokeDashoffset: 0, duration: 1.3, stagger: 0.07, ease: "power2.inOut" })
      .to(strokes, { fillOpacity: 1, duration: 0.7, stagger: 0.05, ease: "power2.out" }, 0.9)
      .to(strokes, { attr: { stroke: "#111311", "stroke-width": 1.5 }, duration: 0.6, stagger: 0.05, ease: "power2.out" }, 1.2);
    if (reduce) write.progress(1);
    else ScrollTrigger.create({ trigger: fmark, start: "top 88%", onEnter: () => write!.timeScale(1).play(), onLeaveBack: () => write!.timeScale(2.5).reverse() });
  }

  return () => {
    offs.forEach((fn) => fn());
    splits.forEach((sp) => sp.revert());
    write?.kill();
    cta?.dispose();
  };
}
