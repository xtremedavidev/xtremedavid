import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { createScene } from "../scene";
import { A } from "../data";

gsap.registerPlugin(ScrollTrigger, SplitText);

/** SplitText masks clip glyphs on tight tracking — give each mask room without moving layout. */
const unclip = (sp: SplitText) => { for (const m of ((sp as unknown as { masks?: HTMLElement[] }).masks || [])) { m.style.padding = "0 0.14em 0.16em"; m.style.margin = "0 -0.14em -0.16em"; } return sp; };

export function initRepsDarkMotion(root: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(sel);
  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(sel)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.innerWidth < 900;
  const splits: SplitText[] = [];
  const listeners: Array<[EventTarget, string, EventListener]> = [];
  const on = (el: EventTarget | null, ev: string, fn: EventListener, o?: AddEventListenerOptions) => { if (!el) return; el.addEventListener(ev, fn, o); listeners.push([el, ev, fn]); };

  /* ---------- smooth scroll ---------- */
  const lenis = reduce ? null : new Lenis({ lerp: 0.085, smoothWheel: true });
  const tick = (time: number) => lenis?.raf(time * 1000);
  if (lenis) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0); }
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => on(a, "click", (e) => {
    const id = a.getAttribute("href")!; const t = id === "#top" ? document.body : document.querySelector(id);
    if (!t) return; e.preventDefault();
    if (lenis) lenis.scrollTo(t as HTMLElement, { offset: 0, duration: 1.6 }); else window.scrollTo({ top: (t as HTMLElement).getBoundingClientRect().top + scrollY });
  }));

  /* ---------- the live scene ---------- */
  const impulsesEl = $("[data-impulses]"), kwhEl = $("[data-kwh]"), tagEl = $("[data-tag-t]");
  let lastTag = 0;
  const onEnergy = (n: number) => {
    if (impulsesEl) impulsesEl.textContent = n.toLocaleString("en-GB");
    if (kwhEl) kwhEl.textContent = (n * 0.03).toFixed(2);
    const now = performance.now();
    if (tagEl && now - lastTag > 450) { lastTag = now; tagEl.textContent = `Trigger ${String(1 + (n % 54)).padStart(2, "0")} · ${(15 + Math.random() * 7).toFixed(1)} kN`; }
  };
  let scene: ReturnType<typeof createScene> | null = null;
  try {
    scene = createScene($<HTMLCanvasElement>("[data-gl]")!, { theme: "dark", mapUrl: `${A}map-grid-1.webp`, logoUrl: `${A}logo.svg`, quality: mobile ? 0.6 : 1, onEnergy });
  } catch {
    root.setAttribute("data-nogl", "");
  }
  const onResize = () => scene?.resize();
  on(window, "resize", onResize);
  if (!mobile) on(window, "pointermove", ((e: PointerEvent) => scene?.setPointer((e.clientX / innerWidth) * 2 - 1, -((e.clientY / innerHeight) * 2 - 1))) as EventListener);

  // hold to brake
  const hold = $("[data-hold]"), ring = $("[data-hold-ring]"), holdLabel = $("[data-hold-label]"), live = $("[data-live]");
  let holdTw: gsap.core.Tween | null = null;
  let holding = false;
  const brake = (v: boolean) => {
    if (v === holding) return; holding = v;
    scene?.setBrake(v); hold?.toggleAttribute("data-on", v);
    if (holdLabel) holdLabel.textContent = v ? "Braking — keep holding" : "Hold to brake";
    holdTw?.kill();
    holdTw = gsap.to(ring, {
      strokeDashoffset: v ? 0 : 125.7, duration: v ? 1.4 : 0.5, ease: v ? "none" : "power2.out",
      onComplete: () => {
        if (!v) return;
        // a full brake: the whole plate fires in a wave
        scene?.burst();
        if (holdLabel) holdLabel.textContent = "Full brake · 54 triggers fired";
        live?.setAttribute("data-burst", ""); setTimeout(() => live?.removeAttribute("data-burst"), 900);
      },
    });
  };
  on(hold, "pointerdown", () => brake(true));
  ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => on(hold, ev, () => brake(false)));
  on(hold, "keydown", ((e: KeyboardEvent) => { if ((e.key === " " || e.key === "Enter") && !e.repeat) { e.preventDefault(); brake(true); } }) as EventListener);
  on(hold, "keyup", () => brake(false));

  /* ---------- loader + intro ---------- */
  const loader = $("[data-loader]"), pct = $("[data-pct]");
  const h1 = unclip(new SplitText($("[data-h1]")!, { type: "lines", mask: "lines" })); splits.push(h1);
  gsap.set(h1.lines, { yPercent: 110 });
  gsap.set("[data-intro]", { autoAlpha: 0, y: 24 });
  lenis?.stop();
  const load = { v: 0 };
  const loadTl = gsap.timeline();
  loadTl.to(load, { v: 0.8, duration: 1.1, ease: "power2.out", onUpdate: () => { if (pct) pct.textContent = String(Math.round(load.v * 100)).padStart(3, "0"); gsap.set("[data-bar]", { scaleX: load.v }); } });
  Promise.all([scene?.ready ?? Promise.resolve(), new Promise((r) => setTimeout(r, reduce ? 0 : 900))]).then(() => {
    loadTl.to(load, { v: 1, duration: 0.5, ease: "power2.inOut", onUpdate: () => { if (pct) pct.textContent = String(Math.round(load.v * 100)).padStart(3, "0"); gsap.set("[data-bar]", { scaleX: load.v }); } })
      .to(loader, { yPercent: -100, duration: 1.1, ease: "expo.inOut" }, "+=0.15")
      .set(loader, { display: "none" })
      .to(h1.lines, { yPercent: 0, duration: 1.3, stagger: 0.1, ease: "expo.out" }, "-=0.55")
      .to("[data-intro]", { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out" }, "-=1")
      .add(() => lenis?.start());
  });

  /* ---------- journey: scroll drives the camera ---------- */
  const rail = $("[data-rail]"), railFill = $("[data-rail-fill]"), railItems = $$("[data-rail-i]"), shades = $$("[data-jshade]");
  const journey = $("[data-journey]")!;
  ScrollTrigger.create({
    trigger: journey, start: "top bottom", end: "bottom bottom",
    onUpdate: (self) => {
      // five 100vh steps, then the finale: the camera finishes as the finale pins, so the logo holds while you read
      const p = Math.min(1, (self.progress * (self.end - self.start)) / (6 * window.innerHeight));
      scene?.setProgress(p);
      const idx = Math.min(5, Math.max(0, Math.round(p * 6) - 1));
      railItems.forEach((li, i) => li.toggleAttribute("data-on", i === idx));
      if (railFill) gsap.set(railFill, { scaleY: (idx + 1) / 6 });
      const inSteps = p > 0.08 && p < 0.9;
      rail?.toggleAttribute("data-on", inSteps);
      shades.forEach((el) => el.toggleAttribute("data-on", inSteps && el.dataset.jshade === (idx % 2 ? "r" : "l")));
    },
  });
  $$("[data-card]").forEach((card) => {
    const parts = [...card.children];
    gsap.fromTo(parts, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: card, start: "top 82%", toggleActions: "play none none reverse" } });
  });
  gsap.fromTo($$("[data-step='5'] > *"), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, stagger: 0.1, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: "[data-step='5']", start: "top 55%", toggleActions: "play none none reverse" } });

  // the scene sleeps once the content sheet covers the screen
  ScrollTrigger.create({ trigger: "[data-sheet]", start: "top top", onToggle: (self) => scene?.setVisible(!self.isActive) });

  // nav: hide while reading, show on scroll up; highlight section
  const nav = $("[data-nav]");
  ScrollTrigger.create({ start: "top -120", onUpdate: (self) => nav?.toggleAttribute("data-hide", self.direction === 1 && self.scroll() > window.innerHeight * 1.2) });
  const links = $$<HTMLAnchorElement>("[data-navlink]");
  links.forEach((a) => {
    const sec = document.querySelector(a.dataset.navlink!);
    if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (self) => { if (self.isActive) links.forEach((l) => l.toggleAttribute("data-on", l === a)); else a.removeAttribute("data-on"); } });
  });

  /* ---------- content sheet ---------- */
  $$("[data-sheet] [data-split]").forEach((el) => {
    const sp = unclip(new SplitText(el, { type: "lines", mask: "lines" })); splits.push(sp);
    gsap.from(sp.lines, { yPercent: 105, duration: 1.2, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 86%" } });
  });
  $$("[data-rise]").forEach((el) => gsap.from(el, { autoAlpha: 0, y: 36, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));
  $$("[data-reveal]").forEach((el) => gsap.fromTo(el, { clipPath: "inset(12% 6% 12% 6% round 22px)" }, { clipPath: "inset(0% 0% 0% 0% round 22px)", ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 35%", scrub: true } }));
  $$("[data-parallax]").forEach((el) => gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count!; const o = { v: 0 };
    el.textContent = "0";
    gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 88%" }, onUpdate: () => { el.textContent = Math.round(o.v).toLocaleString("en-GB"); } });
  });
  $$("[data-bar-w]").forEach((el, i) => gsap.to(el, { width: `${el.dataset.barW}%`, duration: 1.6, delay: i * 0.12, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } }));

  // reel: drag to scroll on desktop
  const reel = $("[data-reel]");
  if (reel && !mobile) {
    let down = false, sx = 0, sl = 0;
    on(reel, "pointerdown", ((e: PointerEvent) => { down = true; sx = e.clientX; sl = reel.scrollLeft; reel.style.scrollSnapType = "none"; }) as EventListener);
    on(window, "pointerup", () => { if (!down) return; down = false; reel.style.scrollSnapType = ""; });
    on(window, "pointermove", ((e: PointerEvent) => { if (down) reel.scrollLeft = sl - (e.clientX - sx); }) as EventListener);
  }

  // beliefs: the row nearest the middle of the screen lights up
  const rows = $$("[data-belrow]");
  rows.forEach((row) => ScrollTrigger.create({ trigger: row, start: "top 62%", end: "bottom 62%", onToggle: (self) => { if (self.isActive) rows.forEach((r) => r.toggleAttribute("data-on", r === row)); } }));
  rows[1]?.setAttribute("data-on", "");

  // CTA glow breathes with scroll; footer wordmark rises
  gsap.fromTo("[data-glow]", { scale: 0.6, opacity: 0.3 }, { scale: 1.15, opacity: 1, ease: "none", scrollTrigger: { trigger: "[data-glow]", start: "top bottom", end: "bottom top", scrub: true } });
  // footer wordmark writes itself: each stroke is traced in green, left to right, then fills in
  const fmark = $("[data-fmark]");
  const strokes = fmark ? $$<SVGGeometryElement>("path, rect", fmark).filter((el) => !el.closest("mask")) : [];
  if (fmark && strokes.length) {
    strokes.sort((p, q) => p.getBBox().x - q.getBBox().x);
    strokes.forEach((el) => {
      const len = el.getTotalLength();
      gsap.set(el, { attr: { stroke: "#B6FF8E", "stroke-width": 4, "stroke-linejoin": "round", "stroke-linecap": "round" }, strokeDasharray: len, strokeDashoffset: len, fillOpacity: 0 });
    });
    const write = gsap.timeline({ paused: true });
    write.to(strokes, { strokeDashoffset: 0, duration: 1.3, stagger: 0.07, ease: "power2.inOut" })
      .to(strokes, { fillOpacity: 1, duration: 0.7, stagger: 0.05, ease: "power2.out" }, 0.9)
      // settle the pen line into the fill colour; a hairline of it also hides the seams between the logo's pieces
      .to(strokes, { attr: { stroke: "#E4E7E1", "stroke-width": 1.5 }, duration: 0.6, stagger: 0.05, ease: "power2.out" }, 1.2);
    if (reduce) write.progress(1);
    else ScrollTrigger.create({ trigger: fmark, start: "top 85%", onEnter: () => write.timeScale(1).play(), onLeaveBack: () => write.timeScale(2.5).reverse() });
  }

  // magnetic buttons
  if (!mobile && !reduce) $$("[data-magnetic]").forEach((b) => {
    const xTo = gsap.quickTo(b, "x", { duration: 0.6, ease: "power3.out" }), yTo = gsap.quickTo(b, "y", { duration: 0.6, ease: "power3.out" });
    on(b, "pointermove", ((e: PointerEvent) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); }) as EventListener);
    on(b, "pointerleave", () => { xTo(0); yTo(0); });
  });

  if (process.env.NODE_ENV !== "production") (window as unknown as { __reps?: unknown }).__reps = scene;
  requestAnimationFrame(() => ScrollTrigger.refresh());

  return () => {
    listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
    splits.forEach((sp) => sp.revert());
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.ticker.remove(tick); lenis?.destroy();
    holdTw?.kill(); loadTl.kill();
    scene?.dispose();
  };
}
