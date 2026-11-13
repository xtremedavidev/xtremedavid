import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { createScene } from "../scene";
import { createBoltScene } from "./boltScene";
import { A } from "../data";
import { initRepsLightSections } from "./sectionsMotion";

gsap.registerPlugin(ScrollTrigger, SplitText);

const unclip = (sp: SplitText) => { for (const m of ((sp as unknown as { masks?: HTMLElement[] }).masks || [])) { m.style.padding = "0 0.14em 0.16em"; m.style.margin = "0 -0.14em -0.16em"; } return sp; };
const STEP_NAMES = ["Impulse capture", "Hydraulic transmission", "Frictionless conversion", "Energy storage", "On-demand usage"];

type Scene = ReturnType<typeof createScene>;

export function initRepsLightMotion(root: HTMLElement): () => void {
  const $ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => r.querySelector<T>(sel);
  const $$ = <T extends Element = HTMLElement>(sel: string, r: ParentNode = root) => [...r.querySelectorAll<T>(sel)];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = window.innerWidth < 1000;
  const splits: SplitText[] = [];
  const listeners: Array<[EventTarget, string, EventListener]> = [];
  const on = (el: EventTarget | null, ev: string, fn: EventListener) => { if (!el) return; el.addEventListener(ev, fn); listeners.push([el, ev, fn]); };

  /* ---------- smooth scroll + anchors ---------- */
  const lenis = reduce ? null : new Lenis({ lerp: 0.09, smoothWheel: true });
  const tick = (time: number) => lenis?.raf(time * 1000);
  if (lenis) { lenis.on("scroll", ScrollTrigger.update); gsap.ticker.add(tick); gsap.ticker.lagSmoothing(0); }
  const goTo = (t: HTMLElement) => { if (lenis) lenis.scrollTo(t, { offset: -90, duration: 1.4 }); else window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 90 }); };
  $$<HTMLAnchorElement>('a[href^="#"]').forEach((a) => on(a, "click", (e) => {
    const id = a.getAttribute("href")!; const t = id === "#top" ? document.body : document.querySelector<HTMLElement>(id);
    if (a.hasAttribute("data-play")) { e.preventDefault(); window.dispatchEvent(new Event("reps:play")); return; }
    if (!t) return; e.preventDefault(); goTo(t);
  }));

  /* ---------- two live scenes: the city in the hero, the system in "How it works" ---------- */
  const scenes: Scene[] = [];
  const makeScene = (canvas: HTMLCanvasElement | null, opts: Parameters<typeof createScene>[1]) => {
    if (!canvas) return null;
    try { const sc = createScene(canvas, { theme: "light", mapUrl: `${A}map-grid-1.webp`, quality: mobile ? 0.55 : 1, ...opts }); scenes.push(sc); return sc; }
    catch { root.setAttribute("data-nogl", ""); return null; }
  };
  // hero: a lightning bolt made of particles over the city map — it leans toward the cursor, parts around it, bursts on click
  let hero: ReturnType<typeof createBoltScene> | null = null;
  const heroEl = $("[data-hero]");
  try { hero = createBoltScene($<HTMLCanvasElement>("[data-gl-hero]")!, { mapUrl: `${A}map-grid-1.webp`, quality: mobile ? 0.55 : 1 }); }
  catch { root.setAttribute("data-nogl", ""); }
  if (heroEl && hero) {
    on(heroEl, "pointermove", ((e: PointerEvent) => { const r = heroEl.getBoundingClientRect(); hero?.setPointer(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1), e.pointerType === "mouse"); }) as EventListener);
    on(heroEl, "pointerleave", () => hero?.leave());
    on(heroEl, "click", ((e: MouseEvent) => { if (!(e.target as HTMLElement).closest("a, button")) hero?.burst(); }) as EventListener);
  }
  let how: Scene | null = null;
  const vis = (sc: () => { setVisible(v: boolean): void } | null, trigger: string) => ScrollTrigger.create({ trigger, start: "top bottom", end: "bottom top", onToggle: (self) => sc()?.setVisible(self.isActive) });
  vis(() => hero, "[data-hero]");
  vis(() => how, "[data-how]");
  on(window, "resize", () => { scenes.forEach((sc) => sc.resize()); hero?.resize(); });

  /* ---------- intro ---------- */
  const h1 = unclip(new SplitText($("[data-h1]")!, { type: "lines", mask: "lines" })); splits.push(h1);
  const intro = gsap.timeline({ delay: 0.15 });
  intro.from(h1.lines, { yPercent: 110, duration: 1.3, stagger: 0.1, ease: "expo.out" })
    .from("[data-intro]", { autoAlpha: 0, y: 22, duration: 1, stagger: 0.08, ease: "expo.out" }, 0.25)
    .from("[data-hero]", { clipPath: "inset(3% 3% 3% 3% round 40px)", duration: 1.6, ease: "expo.out" }, 0)
    .from("[data-nav]", { y: -30, autoAlpha: 0, duration: 1, ease: "expo.out" }, 0.3);

  /* ---------- how it works: the active step drives the camera ---------- */
  const steps = $$("[data-step]"), cnt = $("[data-cnt]"), vname = $("[data-visname]"), vbar = $("[data-vbar]");
  let curStep = 0;
  function setStep(i: number, force = false) {
    if (i === curStep && !force) return; curStep = i;
    steps.forEach((el, k) => el.toggleAttribute("data-on", k === i));
    if (cnt) cnt.textContent = `0${i + 1}`;
    if (vname) vname.textContent = STEP_NAMES[i];
    if (vbar) vbar.style.transform = `scaleX(${(i + 1) / 5})`;
    how?.setProgress((i + 1) / 6);
  }
  setStep(0, true);
  const howCanvas = $<HTMLCanvasElement>("[data-gl-how]");
  // created lazily, the first time "How it works" comes near
  ScrollTrigger.create({ trigger: "[data-how]", start: "top 180%", once: true, onEnter: () => { how = makeScene(howCanvas, { progress: 1 / 6, truck: !mobile }); how?.jump(1 / 6); setStep(curStep, true); } });

  steps.forEach((el, i) => ScrollTrigger.create({ trigger: el, start: mobile ? "top 72%" : "top 55%", end: mobile ? "bottom 72%" : "bottom 55%", onToggle: (self) => { if (self.isActive) setStep(i); } }));

  /* ---------- the plate: rises off the page as you scroll in, then gets scanned and labelled ---------- */
  const leaders = $$<SVGPathElement>("[data-leader]");
  leaders.forEach((p) => { const L = p.getTotalLength(); gsap.set(p, { strokeDasharray: L, strokeDashoffset: L }); });
  gsap.set("[data-call]", { autoAlpha: 0, y: 18, scale: 0.94 });
  gsap.set("[data-node], [data-node-ring]", { scale: 0, transformOrigin: "50% 50%" });
  if (!reduce) {
    // scrubbed: the card lifts from a tilted, cropped slab to flat and full size
    gsap.fromTo("[data-plate-in]",
      { rotationX: 28, y: 140, scale: 0.86, clipPath: "inset(14% 9% 14% 9% round 40px)", transformOrigin: "50% 100%" },
      { rotationX: 0, y: 0, scale: 1, clipPath: "inset(-12% -12% -12% -12% round 0px)", ease: "none", scrollTrigger: { trigger: "[data-plate-zone]", start: "top bottom", end: "top 28%", scrub: 0.8 } });
    gsap.fromTo("[data-plate-img]", { scale: 1.22, filter: "blur(6px) saturate(.6)" }, { scale: 1, filter: "blur(0px) saturate(1)", ease: "none", scrollTrigger: { trigger: "[data-plate-zone]", start: "top bottom", end: "top 30%", scrub: 0.8 } });
  }
  const sx = { v: -100 };
  const plateTl = gsap.timeline({ scrollTrigger: { trigger: "[data-plate-zone]", start: "top 40%", toggleActions: "play none none reverse" } });
  plateTl
    .set("[data-plate-scan]", { opacity: 1 })
    .fromTo(sx, { v: -100 }, { v: 320, duration: 1.3, ease: "power2.inOut", onUpdate: () => $("[data-plate-scan]")?.style.setProperty("--sx", `${sx.v}%`) })
    .set("[data-plate-scan]", { opacity: 0 })
    .to("[data-node]", { scale: 1, stagger: 0.09, duration: 0.5, ease: "back.out(3)" }, 0.45)
    .fromTo("[data-node-ring]", { scale: 0, opacity: 0.6 }, { scale: 2.4, opacity: 0, stagger: 0.09, duration: 1.1, ease: "expo.out" }, 0.5)
    .to("[data-node-ring]", { scale: 1, opacity: 0.35, duration: 0.4 }, ">")
    .to(leaders, { strokeDashoffset: 0, stagger: 0.09, duration: 0.8, ease: "power2.inOut" }, 0.6)
    .to("[data-call]", { autoAlpha: 1, y: 0, scale: 1, stagger: 0.09, duration: 0.8, ease: "expo.out" }, 1.0);

  // the plate card tilts toward the cursor (desktop pointers only)
  const plate = $("[data-plate]");
  if (plate && !mobile && !reduce && window.matchMedia("(pointer: fine)").matches) {
    gsap.set(plate, { transformPerspective: 1600 });
    const rx = gsap.quickTo(plate, "rotationX", { duration: 0.8, ease: "power3.out" }), ry = gsap.quickTo(plate, "rotationY", { duration: 0.8, ease: "power3.out" });
    on(plate, "pointermove", ((e: PointerEvent) => {
      const r = plate.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      ry((x - 0.5) * 9); rx(-(y - 0.5) * 7);
      plate.style.setProperty("--gx", `${x * 100}%`); plate.style.setProperty("--gy", `${y * 100}%`);
    }) as EventListener);
    on(plate, "pointerleave", () => { rx(0); ry(0); });
  }

  /* ---------- generic reveals ---------- */
  $$("[data-split]").forEach((el) => {
    const sp = unclip(new SplitText(el, { type: "lines", mask: "lines" })); splits.push(sp);
    gsap.from(sp.lines, { yPercent: 105, duration: 1.2, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  $$("main [data-rise]").forEach((el) => gsap.from(el, { autoAlpha: 0, y: 30, duration: 1.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 92%" } }));
  $$("[data-reveal]").forEach((el) => gsap.fromTo(el, { clipPath: "inset(8% 4% 8% 4% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 32px)", ease: "none", scrollTrigger: { trigger: el, start: "top 95%", end: "top 40%", scrub: true } }));
  $$("[data-parallax]").forEach((el) => gsap.fromTo(el, { yPercent: -5 }, { yPercent: 5, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true } }));
  $$("[data-count]").forEach((el) => {
    const end = +el.dataset.count!, dec = +(el.dataset.dec || 0); const o = { v: 0 };
    const show = (v: number) => { el.textContent = v.toLocaleString("en-GB", { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
    show(0);
    gsap.to(o, { v: end, duration: 1.8, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 92%" }, onUpdate: () => show(o.v) });
  });
  $$("[data-bar-w]").forEach((el, i) => gsap.to(el, { width: `${el.dataset.barW}%`, duration: 1.6, delay: i * 0.12, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 90%" } }));

  /* ---------- nav ---------- */
  const nav = $("[data-nav]");
  ScrollTrigger.create({ start: "top -200", onUpdate: (self) => nav?.toggleAttribute("data-hide", self.direction === 1 && self.scroll() > window.innerHeight) });
  const links = $$<HTMLAnchorElement>("[data-navlink]");
  links.forEach((a) => {
    const sec = document.querySelector(a.dataset.navlink!);
    if (sec) ScrollTrigger.create({ trigger: sec, start: "top 50%", end: "bottom 50%", onToggle: (self) => { if (self.isActive) links.forEach((l) => l.toggleAttribute("data-on", l === a)); else a.removeAttribute("data-on"); } });
  });

  // magnetic buttons
  if (!mobile && !reduce) $$("[data-magnetic]").forEach((b) => {
    const xTo = gsap.quickTo(b, "x", { duration: 0.6, ease: "power3.out" }), yTo = gsap.quickTo(b, "y", { duration: 0.6, ease: "power3.out" });
    on(b, "pointermove", ((e: PointerEvent) => { const r = b.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.2); yTo((e.clientY - r.top - r.height / 2) * 0.3); }) as EventListener);
    on(b, "pointerleave", () => { xTo(0); yTo(0); });
  });

  const sectionsCleanup = initRepsLightSections(root, { reduce, mobile });
  requestAnimationFrame(() => ScrollTrigger.refresh());
  // lazy images change the page height after load: keep every trigger in the right place
  let rt: ReturnType<typeof setTimeout> | undefined, lastH = root.offsetHeight;
  const ro = new ResizeObserver(() => { if (Math.abs(root.offsetHeight - lastH) < 2) return; lastH = root.offsetHeight; clearTimeout(rt); rt = setTimeout(() => ScrollTrigger.refresh(), 200); });
  ro.observe(root);

  return () => {
    listeners.forEach(([el, ev, fn]) => el.removeEventListener(ev, fn));
    splits.forEach((sp) => sp.revert());
    ScrollTrigger.getAll().forEach((t) => t.kill());
    gsap.ticker.remove(tick); lenis?.destroy();
    intro.kill(); plateTl.kill(); ro.disconnect(); clearTimeout(rt);
    scenes.forEach((sc) => sc.dispose());
    hero?.dispose();
    sectionsCleanup();
  };
}
